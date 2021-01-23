import React from 'react';
import {parse_fields, field_pos} from './parse.js';

export const col_order = ['label', 'code', 'comment'];

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

export function CodeLine ({line, lineno, key, cursor}) {
    const {label, code, comment} = parse_fields(line);
    let {field, offset} = cursor !== false ? field_pos(cursor, line) : {};

    return <div className="codeline" style={{backgroundColor: cursor && '#e0f0e8'}}>
             {field === 0 && <Cursor pos={offset}/>}
             <Label>{label && label + ':'}</Label>
             {field === 1 && <Cursor pos={offset}/>}
             <Code>{code}</Code>
             {field === 2 && <Cursor pos={offset}/>}
             <Comment>{comment && ';' + comment}</Comment>
           </div>;
}

export function PrettyCode ({code, cursor_x, cursor_y}) {
    return code.map((line, lineno) =>
        <CodeLine {...{line, lineno, cursor: (cursor_y === lineno) && Math.min(line.length, cursor_x)}}/>
    );
}
