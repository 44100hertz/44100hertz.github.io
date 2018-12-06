// TODO: save/load user asm files
// TODO: compiler
// TODO: emulator

import {} from "./edit.js";
import {compile} from "./compile.js";
import * as emu from "./emulate.js";

const button = document.getElementById('runbutton');

button.addEventListener('click', (event) => {
    const rom = compile();
    emu.run(rom, event.timeStamp);
});
