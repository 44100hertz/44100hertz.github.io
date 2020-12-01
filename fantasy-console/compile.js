import {names as inames} from "./instructions.js";

export const compile = (text) => {
    let bin = [];
    const regs = {
        a: 0, b: 1, c: 2, d: 3, e: 4, pc: 5, sp: 6
    };
    for (let line of text) {
        let [label, code] = line;
        let tokens = code.split(' ');
        let nibs = [];
        let immed = [];
        nibs[0] = inames[tokens[0]];
        tokens.slice(1).map((t) => {
            if (regs[t] !== undefined) {
                nibs.push(regs[t]);
            } else {
                nibs.push(7);
                immed.push(+t);
            }
        });
        bin.push(nibs.reduce((a, b) => a << 4 | b));
        bin = bin.concat(immed);
    }
    return new Uint16Array(bin);
};
