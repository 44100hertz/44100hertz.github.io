import * as compile from "./compile.js";

const fps = 60.0;
const frame_ms = 1000/fps;
const screen_height = 60;
const screen_width = 60;
const screen_area = screen_width * screen_height;
const scan_height = 120;
const scan_width = 120;
const scan_area = scan_width * scan_height;
const clockspeed = scan_area * fps; // 0.245 MHz

const screen = document.getElementById('screen');
const canvas = screen.getContext('2d');

const REG_PC = 6;
const REG_SP = 7;
const REG_ZERO = REG_PC | 0x8;

const ROM_START = 0x8000;
// HACK: avoid generating nibble array (GC avoidance)
const nib = new Uint8Array(4);

class Emu {
    constructor(rom, timestamp) {
        this.reg = new Uint16Array(8);
        this.ram = new Uint16Array(0x10000);

        this.gram = new Uint8Array(0x3);

        this.ram.set(rom, ROM_START);
        this.reg[REG_PC] = ROM_START;
        this.next_frame = timestamp;
        this.pixbuf = canvas.createImageData(screen_width, screen_height);
        for (let i in this.pixbuf.data) {
            this.pixbuf.data[i] = 255;
        }
    }
    frame (timestamp) {
        for (; timestamp > this.next_frame; this.next_frame += frame_ms) {
            for (let line = 0; line < scan_height; ++line) {
                for (let col = 0; col < scan_width; ++col) {
                    this.cycle();
                    if (this.break_line) break;
                    if (line < screen_height && col < screen_width) {
                        const off = (line * screen_width + col) * 4;
                        for (let i=0; i<3; ++i) {
                            this.pixbuf.data[off+i] = this.gram[i];
                        }
                    }
                }
                this.break_line = false;
                if (this.break_frame) break;
            }
            this.break_frame = false;
        }
        canvas.putImageData(this.pixbuf, 0, 0);
        if (this.break) {
            console.log('terminated with brk');
        } else {
            window.requestAnimationFrame((t) => this.frame(t));
        }
    }
    get next_word () {
        return this.ram[this.reg[REG_PC]++];
    }
    read_val (nib) {
        nib &= 0x7;
        return nib == 0x7 ? this.next_word : this.reg[nib];
    }
    read (nib) {
        const v = this.read_val(nib);
        return nib == REG_ZERO ? 0 : nib & 0x8 ? this.ram[v] : v;
    }
    write (nib, v) {
        // NO BAD WRITE NOPS!! I want these slots for teh futuer
        if (nib == 0x7) throw "tried to write to immediate";
        if (nib == REG_ZERO) throw "tried to write to zero or rom addr";
        if (nib & 0x8) {
            this.ram[this.read_val(nib)] = v;
        } else {
            this.reg[nib] = v;
        }
    }
    cycle () {
        const instr = this.next_word;
        nib[0] = instr >> 12;
        nib[1] = instr >> 8 & 0xf;
        nib[2] = instr >> 4 & 0xf;
        nib[3] = instr & 0xf;
        if (nib[0]) {
            switch (nib[0]) {
            case 0x1:
                this.gram[0] = 0;
                break;
            case 0x2:
                this.gram[0] = 255;
                break;
            case 0x3:
                this.reg[REG_PC] = ROM_START;
                break;
            case 0x4:
                break;
            case 0x5:
                break;
            case 0x6:
                break;
            case 0x7:
                break;
            case 0x8:
                break;
            case 0x9:
                break;
            case 0xa:
                break;
            case 0xb:
                break;
            case 0xc:
                break;
            case 0xd:
                break;
            case 0xe:
                break;
            case 0xf:
                break;
            }
        } else if (nib[1]) {
            switch (nib[1]) {
            case 0x1:
                break;
            case 0x2:
                break;
            case 0x3:
                break;
            case 0x4:
                break;
            case 0x5:
                break;
            case 0x6:
                break;
            case 0x7:
                break;
            case 0x8:
                break;
            case 0x9:
                break;
            case 0xa:
                break;
            case 0xb:
                break;
            case 0xc:
                break;
            case 0xd:
                break;
            case 0xe:
                break;
            case 0xf:
                break;
            }
        } else if (nib[2]) {
            switch (nib[3]) {
            case 0x1:
                break;
            case 0x2:
                break;
            case 0x3:
                break;
            case 0x4:
                break;
            case 0x5:
                break;
            case 0x6:
                break;
            case 0x7:
                break;
            case 0x8:
                break;
            case 0x9:
                break;
            case 0xa:
                break;
            case 0xb:
                break;
            case 0xc:
                break;
            case 0xd:
                break;
            case 0xe:
                break;
            case 0xf:
                break;
            }
        } else if (nib[3]) {
            switch (nib[3]) {
            case 0x0: // NOP
                break;
            case 0x1:
                break;
            case 0x2:
                break;
            case 0x3:
                break;
            case 0x4:
                break;
            case 0x5:
                break;
            case 0x6:
                break;
            case 0x7:
                break;
            case 0x8:
                break;
            case 0x9:
                break;
            case 0xa:
                break;
            case 0xb:
                break;
            case 0xc:
                break;
            case 0xd: // BRKLINE
                this.break_line = true;
                break;
            case 0xe: // BRKFRAME
                this.break_frame = true;
                break;
            case 0xf: // BRK
                this.break = true;
                break;
            }
        }
    };
}

export const run = (rom, timestamp) => {
    const emu = new Emu(rom, timestamp);
    emu.frame(timestamp+1);
};
