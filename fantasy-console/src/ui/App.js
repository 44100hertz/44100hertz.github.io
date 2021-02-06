// TODO: save/load user asm files

import React, {useState} from 'react'

import Editor from './Editor.js'
import EmulatorPanel from './EmulatorPanel.js'
import construction from './construction.gif'
import './style.css'

import * as lex from '../assembler/lex.js'
//
const sample_code = `
    gpu_color = 0
loop:
    poke gpu_color b
    inc a a
    add b a b
    mov pc loop;back to start`
      .split('\n').map(l =>
        ({
          text: lex.cleanup_line(l, {trim: true}),
          key: Editor.next_line_key(),
        }))

function App() {
  const [code, setCode] = useState(sample_code)

  return (
    <>
      <h1>Online Fictional Computer</h1>
      <img src={construction} style={{position: 'fixed', top: '2px', right: '2px'}} alt="under construction"></img>
      <div id="mainflex">
        <Editor code={code} setCode={setCode}/>
        <EmulatorPanel code={code}/>
      </div>
    </>
  )
}

export default App
