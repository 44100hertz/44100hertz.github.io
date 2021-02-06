import React from 'react'
import * as lex from '../assembler/lex.js'

export const col_order = ['label', 'code', 'comment']

export default function CodePane ({code, cursor_pos}) {
    return code.map((line, lineno) =>
        <CodeLine key={'cl' + line.key} {...{line, lineno, cursor_pos}}/>
    )
}

function CodeLine ({line, lineno, cursor_pos}) {
    const {label, code, comment} = lex.split_fields(line.text)

    // Figure out cursor
    let field, offset
    const match_line = lineno === cursor_pos[0]
    if (match_line) {
        [, field, offset] = cursor_pos
        offset = lex.clamp_field_offset(line.text, field, offset)
    }

    return <div className='codeline' style={{backgroundColor: match_line && '#e0f0e8'}}>
             {field === 0 && <Cursor pos={offset}/>}
             <Label>{(label || field === 0) && label + ':'}</Label>
             {field === 1 && <Cursor pos={offset}/>}
             <Code>{code}</Code>
             <Comment>{(comment || field === 2) && ';' + comment}</Comment>
             {field === 2 && <Cursor pos={offset - comment.length}/>}
           </div>
}

function Label ({children}) {
    return <div className='label'>{children}</div>
}

function Code ({children}) {
    return <div className='code'>{children}</div>
}

function Comment ({children}) {
    return <div className='comment'>{children}</div>
}

function Cursor ({pos}) {
    return <div id="cursor" style={{left: pos + 'ch'}}>|</div>
}

