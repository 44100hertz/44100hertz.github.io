// TODO: save/load user asm files

import React, {useState} from 'react';

import construction from './construction.gif';
import './style.css';

import Editor from './Editor.js';
import EmulatorPanel from './EmulatorPanel.js';
import * as lex from './lex.js'
//
const sample_code = `
    gpu_r = 0
    gpu_g = 1
    gpu_b = 2
loop:
    poke gpu_r a
    poke gpu_g b
    poke gpu_b c
    inc a a;update colors
    inc b b
    add b a b
    add c a b
    mov pc loop;back to start`
      .split('\n').map(l =>
        ({
          text: lex.cleanup_line(l, {trim: true}),
          key: Editor.next_line_key(),
        }));

function App() {
  const [code, setCode] = useState(sample_code);

  return (
    <>
      <h1>Online Fictional Computer</h1>
      <img src={construction} style={{position: 'fixed', top: '2px', right: '2px'}} alt="under construction"></img>
      <div id="mainflex">
        <Editor code={code} setCode={setCode}/>
        <EmulatorPanel code={code}/>
      </div>
    </>
  );
}

export default App;
