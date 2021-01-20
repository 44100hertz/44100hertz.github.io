// TODO: save/load user asm files

import {Editor} from "./edit.js";
import {compile} from "./compile.js";
import * as emu from "./emulate.js";

const button = document.getElementById('runbutton');

const editor = new Editor();

button.addEventListener('click', (event) => {
    try {
        const rom = compile(editor.document);
        emu.run(rom, event.timeStamp);
    } catch (err) {
        throw `Compile Error\n${err}`;
    }
});
