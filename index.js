// TODO: save/load user asm files
// TODO: compiler
// TODO: emulator

import {get_text} from "./edit.js";
import {compile} from "./compile.js";
import * as emu from "./emulate.js";

const button = document.getElementById('runbutton');

button.addEventListener('click', (event) => {
    const rom = compile(get_text());
    emu.run(rom, event.timeStamp);
});
