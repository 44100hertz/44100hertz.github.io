// TODO: save/load user asm files

import React from "react";
import ReactDOM from "react-dom";
import './style.css';

import {Editor} from "./edit.js";
import {compile} from "./compile.js";
//import * as emu from "./emulate.js";
//
const sample_code = `loop:
    poke 0 a;write colors to GPU
    poke 1 b
    poke 2 c
    inc a a;update colors
    inc b b
    add b a b
    add c a b
    mov pc loop;back to start`;

ReactDOM.render(
  <React.StrictMode>
    <h1>Online Fictional Computer</h1>
    <img src="./construction.gif" style={{position: 'fixed', top: '2px', right: '2px'}} alt="under construction"></img>
    <div id="mainflex">
      <Editor code={sample_code}/>
      <div id="emulator" tabIndex="1">
        <canvas id="screen" width="60" height="60"></canvas>
        <button id="runbutton">▶</button>
      </div>
    </div>
  </React.StrictMode>,
  document.getElementById('root')
);
