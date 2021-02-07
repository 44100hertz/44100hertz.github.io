// TODO: save/load user asm files

import React, {useState} from 'react'

import Editor from './Editor.js'
import EmulatorPanel from './EmulatorPanel.js'
import construction from './construction.gif'
import './style.css'

import * as lex from '../assembler/lex.js'
import {TILESET_ADDRESS, TILEMAP_ADDRESS, TILEMAP_END} from '../hz16/constants.js'
//

function App() {
  const sample_code = `
    a_tileset = ${TILESET_ADDRESS}
    a_tilemap = ${TILEMAP_ADDRESS}
    a_tilemap_end = ${TILEMAP_END}

    ; TILEMAP TEST ROM
    ; Writes every value from 0 to 255 character to the tilemap
    mov a 0
    mov b a_tilemap
loop:
    poke b a
    inc a a
    and a a 0xff    ;limit to ASCII (0-255)
    inc b b
    jgt a_tilemap_end b loop
    brk
    `
        .split('\n').map(l =>
          ({
            text: lex.cleanup_line(l, {trim: true}),
            key: Editor.next_line_key(),
          }))

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
