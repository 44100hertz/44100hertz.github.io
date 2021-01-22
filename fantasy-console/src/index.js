// TODO: save/load user asm files

import React from "react";
import ReactDOM from "react-dom";
import './style.css';

import {Editor} from "./edit.js";
import {compile} from "./compile.js";
//import * as emu from "./emulate.js";

ReactDOM.render(
  <React.StrictMode>
    <h1>Online Fictional Computer</h1>
    <img src="./construction.gif" style={{position: 'fixed', top: '2px', right: '2px'}} alt="under construction"></img>
    <div id="mainflex">
      <Editor />
      <div id="emulator" tabIndex="1">
        <canvas id="screen" width="60" height="60"></canvas>
        <button id="runbutton">▶</button>
      </div>
    </div>
  </React.StrictMode>,
  document.getElementById('root')
);
