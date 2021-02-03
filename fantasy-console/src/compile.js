import * as lex from './lex.js';
import {names as inames} from "./instructions.js";
import {PROGRAM_ADDRESS, PROGRAM_ADDRESS_END} from "./address_space.js";

export const compile = (text) => {
    let bin = [];
//    let address_to_line_map = [];
    const regs = {
        a: 0, b: 1, c: 2, d: 3, e: 4, pc: 5, sp: 6
    };
    const namespace = {};
    let program_counter = PROGRAM_ADDRESS;
    for (let {text: line} of text) {
        let {label, code} = lex.split_fields(line, {trim: true});

        if (label) namespace[label] = program_counter;
        if (!code) continue;

        let tokens = code.split(' ');
        let nibs = [];
        let immed = [];
        nibs[0] = inames[tokens[0]];
        tokens.slice(1).forEach((t) => {
            if (regs[t] !== undefined) {
                nibs.push(regs[t]);
            } else {
                nibs.push(7);
                immed.push(t);
            }
        });
        program_counter += 1 + immed.length;
        bin.push(nibs.reduce((a, b) => (a << 4) | b));
        bin = bin.concat(immed);
    }

    bin = bin.map(v => {
        if (!isNaN(Number(v))) {
            return Number(v);
        } else {
            if (!(v in namespace)) {
                throw Error(`Undefined label: ${v}`);
            }
            const pc = namespace[v];
            if (pc < PROGRAM_ADDRESS || pc > PROGRAM_ADDRESS_END) {
                throw Error(`Attempt to jump to out-of-bounds address ${pc} using label ${v}`);
            }
            return pc;
        }
    });

    return new Uint16Array(bin);
};
