import * as format from "./format.js";

const clamp = (v, l, u) => Math.max(l, Math.min(u, v));

function is_input_char (event) {
    return !event.ctrlKey && !event.metaKey && event.key.length == 1;
}

function key_detect (k, mod={}) {
    return (event) =>
    event.key === k &&
        (!mod.ctrl || event.ctrlKey) &&
        (!mod.shift || event.shiftKey) &&
        (!mod.alt || event.altKey);
}

export class Editor {
    constructor() {
        this.history = [];
        this.history_head = 0;
        this.cursor = new Cursor(this);
        this.mark = new Cursor(this);
        this.num_cols = format.col_order.length;
        this.codepane = document.getElementById('codepane');
        this.prettycode = document.getElementById('prettycode');
        this.prettycode.innerHTML = format.create_page(this.prettycode.innerHTML);
        codepane.focus();
        codepane.onkeydown = (event) => {
            format.clear_cursor();
            const match = this.key_mapping.find(([pred,]) => pred(event));
            if (match) {
                match[1]();
                event.preventDefault();
            }
            format.draw_cursor(this.field(), this.cursor.char);
        };
        format.draw_cursor(this.field(), this.cursor.char);

        this.key_mapping = [
            [key_detect('ArrowUp'),
             () => {
                 this.cursor.move_line(-1);
             }],
            [key_detect('ArrowDown'),
             () => {
                 this.cursor.move_line(1);
             }],
            [key_detect('ArrowLeft', {alt: 1}),
             () => {
                 this.cursor.alt_jump(-1);
             }],
            [key_detect('ArrowLeft'),
             () => {
                 this.cursor.move_char(-1);
             }],
            [key_detect('ArrowRight', {alt: 1}),
             () => {
                 this.cursor.alt_jump(1);
             }],
            [key_detect('ArrowRight'),
             () => {
                 this.cursor.move_char(1);
             }],
            [key_detect('Enter'),
             () => {
                 this.do_command(['newline', this.cursor.line]);
             }],
            [key_detect('Tab', {shift: 1}),
             () => {
                 this.cursor.move_field(-1);
             }],
            [key_detect('Tab'),
             () => {
                 this.cursor.move_field(1);
             }],
            [key_detect('Backspace'),
             () => {
                 this.remove_at_cursor(-1);
             }],
            [key_detect('Delete'),
             () => {
                 this.remove_at_cursor(0);
             }],
            [key_detect('z', {ctrl: 1}), () => this.undo()],
            [key_detect('Z', {ctrl: 1}), () => this.redo()],
            [key_detect('^'),
             () => {
                 this.cursor.field_jump(0);
             }],
            [key_detect(':'),
             () => {
                 this.cursor.field_jump(1);
             }],
            [key_detect(';'),
             () => {
                 this.cursor.field_jump(2);
             }],
            [is_input_char,
             () => {
                 this.insert_at_cursor(event.key)
             }],
        ]
    }

    line (line = this.cursor.line) {
        return this.prettycode.childNodes[line];
    }

    field (line, field = this.cursor.field) {
        return this.line(line).childNodes[field];
    }

    field_text (...args) {
        return this.field(...args).innerHTML;
    }

    get document () {
        format.clear_cursor();
        return Array.from(prettycode.childNodes).map(
            (child) => Array.from(child.childNodes).map(
                (v) => v.innerHTML));
    }

    get document_length () {
        return this.prettycode.childNodes.length;
    }

    undo () {
        if (this.history_head > 0) {
            this.history[--this.history_head].undo();
        }
    }

    redo () {
        if (this.history_head < this.history.length) {
            this.history[this.history_head++].redo();
        }
    }

    do_command (cmd) {
        this.history[this.history_head++] = this.commands[cmd[0]](...cmd.slice(1));
        this.history[this.history_head-1].redo();
        // note: this discards "future" edits after undoing
        this.history = this.history.slice(0, this.history_head);
    }

    // Offset = 0: forward delete
    // Offset =-1: backspace
    remove_at_cursor (off) {
        const pos = Math.min(this.cursor.char, this.field().innerHTML.length+off+1);
        this.do_command(['splice', this.cursor.line, this.cursor.field, pos+off, pos+off+1]);
        this.cursor.move_char(-1);
    }

    insert_at_cursor (key) {
        this.do_command(['splice', this.cursor.line, this.cursor.field, this.cursor.char, this.cursor.char, key]);
        this.cursor.move_char(1);
    }

    commands = {
        splice: (l, f, start, end = start, contents = '') => {
            const text = this.field(l, f).innerHTML;
            const result = text.substring(0, start) + contents + text.substring(end);
            const redo = () => {
                this.field(l, f).innerHTML = result;
                [this.cursor.line, this.cursor.field, this.cursor.char] = [l, f, end];
            };
            const undo = () => {
                this.field(l, f).innerHTML = text;
                [this.cursor.line, this.cursor.field, this.cursor.char] = [l, f, end];
            };
            return {redo, undo};
        },
        newline: (l) => {
            const redo = () => {
                this.line(l).insertAdjacentHTML('afterend', format.new_line());
                this.cursor.line = l+1;
            };
            const undo = () => {
                this.line(l).nextSibling.remove();
                this.cursor.line = l;
            };
            return {redo, undo};
        },
    }
}

class Cursor {
    line = 0;
    field = 0;
    char = 0;

    constructor (editor) {
        this.editor = editor;
    }

    get field_length () {
        return this.editor.field_text().length;
    }

    move_line (off) {
        this.line = clamp(this.line+off, 0, this.editor.document_length-1);
    }

    move_field (off) {
        const cols = this.editor.num_cols;
        this.field = (this.field + off + cols) % cols;
        this.char = 0;
    }

    move_char (off) {
        this.char += off;
        if (this.char < 0) {
            this.move_field(-1);
            this.char = this.field_length;
        } else if (this.char > this.field_length) {
            this.move_field(1);
            this.char = 0;
        }
    }

    alt_jump (off) {
        if (off == 1) {
            if (this.char == this.field_length) {
                this.move_field(1);
            }
            this.char = this.field_length;
        } else if (off == -1) {
            if (this.char == 0) {
                this.move_field(-1);
            }
            this.char = 0;
        }
    }

    field_jump (idx) {
        if (this.field === idx && this.char === 0) {
            this.char = this.field_length;
        } else {
            this.field = idx;
            this.char = 0;
        }
    }
}
