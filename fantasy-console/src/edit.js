import React from "react";
import * as format from "./format.js";
import * as lex from "./lex.js";

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
            cursor_pos: [0,0,0],
            message: 'normal',
            code: props.code.split('\n').map(l => lex.cleanup_line(l, {trim: true})),
        }
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
            [key_detect(';'),
             () => {
                 this.insert_at_cursor(';');
                 this.cursor_set_field(2);
             }],
            [key_detect(':'),
             () => {
                 this.insert_at_cursor(':');
                 this.cursor_set_field(1);
             }],
            [key_detect('Z', {ctrl: 1, shift: 1}), () => this.redo()],
            [key_detect('z', {ctrl: 1}), () => this.undo()],
            [key_detect('l', {ctrl: 1}), () => this.do_command(['cleanup'])],
            [is_input_char,
             (event) => {
                 this.insert_at_cursor(event.key)
             }],
        ];
    }

    cursor_move_line (off) {
        const {cursor_pos: [l,f,o]} = this.state;
        this.setState({cursor_pos: [clamp(l + off, 0, this.document_length-1), f, o]});
    }

    cursor_set_field (field) {
        const {cursor_pos: [l, f]} = this.state;
        field = (field+3)%3;
        if (f !== field) {
            this.setState({cursor_pos: [l, field, 0]});
        }
    }

    cursor_move_field (off) {
        const {cursor_pos: [,field]} = this.state;
        this.cursor_set_field(field + off);
    }

    cursor_move_char (off) {
        const {x, y} = this.pos_to_xy();
        const len = this.line(y).length + 1;
        this.setState({cursor_pos: this.xy_to_pos({x: (x+off+len)%len, y: y})});
    }

    render () {
        const {cursor_pos: [l,f,o]} = this.state;
        return (
            <div onKeyDown={(event) => this.handle_key(event)} id="codepane" tabIndex='0' className="border">
              <h2>({l}:{f}:{o}) {this.state.message}</h2>
              <format.PrettyCode {...this.state}/>
            </div>
        );
    }

    handle_key (event) {
        const match = this.key_mapping.find(([pred,]) => pred(event));
        if (match) {
            match[1](event);
            event.preventDefault();
        }
    }

    // Offset = 0: forward delete
    // Offset =-1: backspace
    remove_at_cursor (off) {
        const {cursor_pos: [l, f, o]} = this.state;
        this.do_command(['splice', [l,f,o+off], [l,f,o+off+1], '']);
        this.cursor_move_char(off);
    }

    insert_at_cursor (key) {
        const {cursor_pos: [l, f, o]} = this.state;
        this.do_command(['splice', [l,f,o], [l,f,o], key]);
    }

    line (line = this.state.cursor_pos[0]) {
        return this.state.code[line];
    }

    pos_to_xy ([line, field, offset] = this.state.cursor_pos) {
        return {x: lex.field_offset_to_column(this.state.code[line], field, offset), y: line};
    }

    xy_to_pos ({x, y}) {
        let {field, offset} = lex.column_to_field_offset(this.state.code[y], x);
        return [y, field, offset];
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
        if (command) {
            command.redo();
            const history = [...old_history, command];
            ++head;
            this.setState({history, history_head: head});
        }
    }

    commands = {
        splice: (p1, p2, contents = '') => {
            // TODO: handle multi-line editing
            const {x: start, y: line} = this.pos_to_xy(p1);
            const {x: end} = this.pos_to_xy(p2);

            const {code} = this.state;
            const linestr = code[line];

            let line_result = linestr.substring(0, start) + contents + linestr.substring(end);
            const code_result = [...code.slice(0, line), line_result, ...code.slice(line + 1)];

            const [l,f,o] = p2;
            const cursor_pos = [l,f,lex.clamp_field_offset(line_result, f, o+1)];

            return {
                redo: () => this.setState({code: code_result, cursor_pos}),
                undo: () => this.setState({code: code, cursor_pos}),
            };
        },

        newline: (lineno = this.state.cursor_y) => {
            const {code, cursor_pos: [l,f,o]} = this.state;
            const newcode = [...code.slice(0,l+1), ':;', ...code.slice(l+1)];
            return {
                redo: () => this.setState({code: newcode, cursor_pos: [l+1,f,o]}),
                undo: () => this.setState({code: code, cursor_pos: [l+1,f,o]}),
            };
        },

        cleanup: () => {
            const dirty_code = this.state.code;
            let diff = false;
            const clean_code = this.state.code.map(l => {
                const nl = lex.cleanup_line(l, {trim: true});
                if (nl !== l) diff = true;
                return nl;
            });
            if (diff) {
                this.setState({message: 'reformatting code'});
                return {
                    redo: () => this.setState({code: clean_code}),
                    undo: () => this.setState({code: dirty_code}),
                }
            } else {
                this.setState({message: 'nothing to reformat'});
                return null;
            }
        },
    }
}
