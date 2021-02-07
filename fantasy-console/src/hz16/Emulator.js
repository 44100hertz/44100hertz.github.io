import {names as inames} from './instructions.js'
import PPU from './PPU.js'
import {
    PROGRAM_ADDRESS,
    SCAN_WIDTH, SCAN_HEIGHT,
    CPU_CYCLES_PER_PIXEL,
} from './constants.js'

const REG_PC = 5
const REG_SP = 6
const REG_ZERO = REG_PC | 0x8

const signed = (a) => a & 0x8000 ? -(~a+1) : a; // Used for comparison

export default class Emulator {

    constructor(rom, canvas) {
        this.reg = new Uint16Array(8)
        this.carry = false
        this.ram = new Uint16Array(0x10000)
        this.ppu = new PPU(canvas)
        this.ram.set(rom, PROGRAM_ADDRESS)
        this.reg[REG_PC] = PROGRAM_ADDRESS
    }

    frame () {
        if (!this.ppu.loaded) {
            window.requestAnimationFrame((t) => this.frame(t))
            return
        }

        for (let line = 0; line < SCAN_HEIGHT; ++line) {
            for (let col = 0; col < SCAN_WIDTH; ++col) {
                for (let i=0; i<CPU_CYCLES_PER_PIXEL; ++i) {
                    this.cycle()
                }
                if (this.break_line) break
            }
            this.break_line = false
            if (this.break_frame) break
        }
        this.break_frame = false
        this.ppu.render()

        if (this.break) {
            console.log('terminated with brk')
        } else {
            window.requestAnimationFrame((t) => this.frame(t))
        }
    }

    get next_word () {
        return this.ram[this.reg[REG_PC]++]
    }
    read_val (nib) {
        nib &= 0x7
        return nib === 0x7 ? this.next_word : this.reg[nib]
    }
    r (nib) {
        const v = this.read_val(nib)
        return nib === REG_ZERO ? 0 : (nib & 0x8) ? this.ram[v] : v
    }
    w (nib, v) {
        // NO BAD WRITE NOPS!! I want these slots for teh futuer
        if (nib === 0x7) throw Error("tried to write to immediate")
        if (nib & 0x8) {
            this.ram[this.read_val(nib)] = v
        } else {
            this.reg[nib] = v
        }
    }
    w_carry (nib, v) {
        this.w(nib, v)
        this.carry = v > 0xffff
    }
    jumpif (cond, dest) {
        if (cond) this.reg[REG_PC] = dest
    }
    push (v) {
        this.mem[this.reg[REG_SP]] = v
        ++this.reg[REG_SP]
    }
    pop () {
        --this.reg[REG_SP]
        return this.mem[this.reg[REG_SP+1]]
    }
    cycle () {
        const instr = this.next_word
        const n0 = instr >> 12
        const n1 = (instr >> 8) & 0xf
        const n2 = (instr >> 4) & 0xf
        const n3 = instr & 0xf
        let v
        if (n0) {
            switch (n0) {
                case inames.and:
                    this.w_carry(n1, this.r(n2) & this.r(n3))
                    break
                case inames.or:
                    this.w_carry(n1, this.r(n2) | this.r(n3))
                    break
                case inames.xor:
                    this.w_carry(n1, this.r(n2) ^ this.r(n3))
                    break
                case inames.add:
                    this.w_carry(n1, this.r(n2) + this.r(n3))
                    break
                case inames.sub:
                    this.w_carry(n1, this.r(n2) + this.r(n3))
                    break
                case inames.adc:
                    this.w_carry(n1, this.r(n2) + this.r(n3) + this.carry)
                    break
                case inames.sbc:
                    this.w_carry(n1, this.r(n2) - this.r(n3) + this.carry)
                    break
                case inames.jeq:
                    this.jumpif(this.r(n1) === this.r(n2), this.r(n3))
                    break
                case inames.jne:
                    this.jumpif(this.r(n1) !== this.r(n2), this.r(n3))
                    break
                case inames.jlt:
                    this.jumpif(this.r(n1) < this.r(n2), this.r(n3))
                    break
                case inames.jgt:
                    this.jumpif(this.r(n1) > this.r(n2), this.r(n3))
                    break
                case inames.jls:
                    this.jumpif(signed(this.r(n1)) < signed(this.r(n2)), this.r(n3))
                    break
                case inames.jgs:
                    this.jumpif(signed(this.r(n1)) > signed(this.r(n2)), this.r(n3))
                    break
                case 0xf:
                    // maybe: idx
                    throw new Error('unimplemented')
            }
        } else if (n1) {
            switch (n1) {
                case inames.mov:
                    this.w(n2, this.r(n3))
                    break
                case inames.shr:
                    v = this.r(n3)
                    this.carry = v & 1
                    this.w(n2, v >> 1)
                    break
                case inames.srs:
                    v = this.r(n3)
                    this.carry = v & 1
                    this.w(n2, v >>> 1)
                    break
                case inames.ror:
                    v = this.r(n3)
                    this.carry = v & 1
                    this.w(n2, (v >> 1) | (this.carry << 15))
                    break
                case inames.shl:
                    v = this.r(n3)
                    this.carry = v & (1 << 15)
                    this.w(n2, v << 1)
                    break
                case inames.rol:
                    v = this.r(n3)
                    this.carry = v & (1 << 15)
                    this.w(n2, (v << 1) | this.carry)
                    break
                case inames.squ:
                    v = this.r(n3)
                    this.w(n2, v*v)
                    break
                case inames.inc:
                    this.w_carry(n2, this.r(n3)+1)
                    break
                case inames.dec:
                    this.w_carry(n2, this.r(n3)-1)
                    break
                case inames.neg:
                    this.w(n3, -this.r(n2))
                    break
                case inames.poke:
                    this.ppu.write(this.r(n2), this.r(n3))
                    break
                case 0xc:
                    throw new Error('unimplemented')
                    break
                case 0xd:
                    throw new Error('unimplemented')
                    break
                case 0xe:
                    throw new Error('unimplemented')
                    break
                case 0xf:
                    throw new Error('unimplemented')
                    break
            }
        } else if (n2) {
            switch (n2) {
                case inames.push:
                    this.push(this.r(n3))
                    break
                case inames.pop:
                    this.w(n3, this.pop())
                    break
                case inames.call:
                    const v = this.r(n3)
                    this.push(this.reg[REG_PC])
                    this.reg[REG_PC] = v
                    break
                case 0x5:
                    break
                case 0x6:
                    throw new Error('unimplemented')
                    break
                case 0x7:
                    throw new Error('unimplemented')
                    break
                case inames.jcc:
                    this.jumpif(!this.carry, this.r(n3))
                    break
                case inames.jcs:
                    this.jumpif(this.carry, this.r(n3))
                    break
                case 0xa:
                    throw new Error('unimplemented')
                    break
                case 0xb:
                    throw new Error('unimplemented')
                    break
                case 0xc:
                    throw new Error('unimplemented')
                    break
                case 0xd:
                    throw new Error('unimplemented')
                    break
                case 0xe:
                    throw new Error('unimplemented')
                    break
                case 0xf:
                    throw new Error('unimplemented')
                    break
            }
        } else if (n3) {
            switch (n3) {
                case inames.nop:
                    break
                case inames.clc:
                    this.carry = false
                    break
                case inames.sec:
                    this.carry = true
                    break
                case 0x4:
                    throw new Error('unimplemented')
                    break
                case 0x5:
                    throw new Error('unimplemented')
                    break
                case 0x6:
                    throw new Error('unimplemented')
                    break
                case 0x7:
                    throw new Error('unimplemented')
                    break
                case 0x8:
                    throw new Error('unimplemented')
                    break
                case 0x9:
                    throw new Error('unimplemented')
                    break
                case 0xa:
                    throw new Error('unimplemented')
                    break
                case 0xb:
                    throw new Error('unimplemented')
                    break
                case 0xc:
                    throw new Error('unimplemented')
                    break
                case inames.brkline: // BRKLINE
                    this.break_line = true
                    break
                case inames.brkframe: // BRKFRAME
                    this.break_line = true
                    this.break_frame = true
                    break
                case inames.brk: // BRK
                    this.break_line = true
                    this.break_frame = true
                    this.break = true
                    break
            }
        } else {
            throw new Error('unimplemeted')
        }
    }
}
