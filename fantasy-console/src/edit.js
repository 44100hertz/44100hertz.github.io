import React from "react";
import * as format from "./format.js";
import {parse_fields, field_pos, get_field_offset} from "./parse.js";

const clamp = (v, l, u) => Math.max(l, Math.min(u, v));

function is_input_char (event) {
    return !event.ctrlKey && !event.metaKey && event.key.length === 1;
}

function key_detect (k, mod={}) {
    return (event) =>
    event.key === k &&
        (!mod.ctrl || event.ctrlKey) &&
        (!mod.shift || event.shiftKey) &&
        (!mod.alt || event.altKey);
}

export class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [],
            history_head: -1,
            cursor_x: 0,
            cursor_y: 0,
            message: 'normal',
            code: `loop:
 poke 0 a;write colors to GPU
 poke 1 b
 poke 2 c
 inc a a;update colors
 inc b b
 add b a b
 add c a b
 mov pc loop;back to start`.split('\n'),
        }
        //        format.draw_cursor(this.field(), this.cursor_char);

        this.key_mapping = [
            [key_detect('ArrowUp'),
             () => {
                 this.cursor_move_line(-1);
             }],
            [key_detect('ArrowDown'),
             () => {
                 this.cursor_move_line(1);
             }],
            [key_detect('ArrowLeft'),
             () => {
                 this.cursor_move_char(-1);
             }],
            [key_detect('ArrowRight'),
             () => {
                 this.cursor_move_char(1);
             }],
            [key_detect('Enter'),
             () => {
                 this.do_command(['newline']);
             }],
            [key_detect('Tab', {shift: 1}),
             () => {
                 this.cursor_move_field(-1);
             }],
            [key_detect('Tab'),
             () => {
                 this.cursor_move_field(1);
             }],
            [key_detect('Backspace'),
             () => {
                 this.remove_at_cursor(-1);
             }],
            [key_detect('Delete'),
             () => {
                 this.remove_at_cursor(0);
             }],
            [key_detect('^'), () => this.cursor_set_field(0)],
            [key_detect(':'), () => this.cursor_set_field(1)],
            [key_detect(';'), () => this.cursor_set_field(2)],
            [key_detect('Z', {ctrl: 1, shift: 1}), () => this.redo()],
            [key_detect('z', {ctrl: 1}), () => this.undo()],
            [is_input_char,
             (event) => {
                 this.insert_at_cursor(event.key)
             }],
        ];
    }

    handle_key (event) {
        const match = this.key_mapping.find(([pred,]) => pred(event));
        if (match) {
            match[1](event);
            event.preventDefault();
        }
    }

    render () {
        return (
            <div onKeyDown={(event) => this.handle_key(event)} id="codepane" tabIndex='0' className="border">
              <h2>{`(${this.state.cursor_x}, ${this.state.cursor_y}) ${this.state.message}`}</h2>
              <format.PrettyCode {...this.state}/>
            </div>
        );
    }

    line (line = this.state.cursor_y) {
        return this.state.code[line];
    }

    field (line, field = this.cursor_field) {
        //        return this.line(line).childNodes[field];
    }

    get document () {
        return this.state.code.join('\n');
    }

    get document_length () {
        return this.state.code.length;
    }

    undo () {
        const {history, history_head: head} = this.state;
        if (head >= 0) {
            history[head].undo();
            this.setState({history_head: head-1, message: 'undo!'});
        } else {
            this.setState({message: 'cannot undo!'});
        }
    }

    redo () {
        const {history, history_head: head} = this.state;
        console.log(history, head);
        if (head+2 <= history.length) {
            history[head+1].redo();
            this.setState({history_head: head+1, message: 'redo!'});
        } else {
            this.setState({message: 'cannot redo!'});
        }
    }

    do_command (cmd) {
        let {history: old_history, history_head: head} = this.state;
        const command = this.commands[cmd[0]](...cmd.slice(1));
        command.redo();
        const history = [...old_history, command];
        ++head;
        this.setState({history, history_head: head});
    }

    // Offset = 0: forward delete
    // Offset =-1: backspace
    remove_at_cursor (off) {
        const {cursor_x: cx, cursor_y: cy} = this.state;
        this.do_command(['splice', cy, cx+off, cx+1+off, '']);
        this.cursor_move_char(off);
    }

    insert_at_cursor (key) {
        const {cursor_x: cx, cursor_y: cy} = this.state;
        this.do_command(['splice', cy, cx, cx, key]);
    }

    commands = {
        splice: (lineno, start, end = start, contents = '') => {
            const {code} = this.state;
            const line = code[lineno];
            const line_result = line.substring(0, start) + contents + line.substring(end);
            const code_result = this.state.code.map((v,i) => i === lineno ? line_result : v);
            return {
                redo: () => {
                    this.setState({code: code_result, cursor_x: end+1, cursor_y: lineno})
                },
                undo: () => {
                    this.setState({code: code, cursor_x: end+1, cursor_y: lineno})
                },
            };
        },

        newline: (lineno = this.state.cursor_y) => {
            const {code, cursor_y: s} = this.state;
            const newcode = [...code.slice(0,s+1), '', ...code.slice(s+1)];
            return {
                redo: () => {
                    this.setState({code: newcode, cursor_y: s+1});
                },
                undo: () => {
                    this.setState({code: code, cursor_y: s+1});
                },
            };
        },
    }

    cursor_move_line (off) {
        const {code, cursor_y} = this.state;
        this.setState({cursor_y: Math.min(code.length, clamp(cursor_y+off, 0, code.length-1))});
    }

    cursor_set_field (index) {
        const line = this.line();
        this.setState({cursor_x: get_field_offset(this.line(), index)});
        if (index === 2 && !line.includes(';')) {
            const {cursor_x: cx, cursor_y: cy} = this.state;
            this.do_command(['splice', cy, cx-1, cx-1, ';']);
        }
    }

    cursor_move_field (off) {
        const {field} = field_pos(this.state.cursor_x, this.line());
        this.cursor_set_field((field + off) % 3);
    }

    cursor_move_char (off) {
        const {cursor_x} = this.state;
        const line_len = this.line().length;
        this.setState({cursor_x: (cursor_x + off + line_len + 1) % (line_len + 1)})
    }
}
