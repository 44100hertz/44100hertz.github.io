'use strict';
// TODO: save/load user asm files
// TODO: compiler
// TODO: emulator

let codepane = document.getElementById('codepane');
let prettycode = document.getElementById('prettycode');
let screen = document.getElementById('screen').getContext('2d');

const col_order = ['label', 'code', 'comment'];

const create_page_format = (code, lineno=0) => code.split('\n')
      .map((l) => format_line(l, ++lineno))
      .join('');

const new_line = (lineno, label = '', code = '', comment = '') => {
    const cols_by_name = {label, code, comment};
    const cols = col_order.map((name, col) => {
        const contents = cols_by_name[name];
        return `<div class="${name}">${contents}</div>`;
    }).join('');
    return `<div class="codeline"}>${cols}</div>`;
};

const format_line = (line, lineno) => {
    let [, contents, comment] = line.match(/([^;]*);?(.*)/);
    let [, label, code] = contents.match(/^(\w+|):?\s*(.*)/);
    return new_line(lineno, label, code, comment);
};

let [cur_line, cur_field, cur_char] = [0, 0, 0];
const getline = (line = cur_line) => prettycode.childNodes[line];
const getfield = (line, field = cur_field) => getline(line).childNodes[field];

const commands = {
    splice: (l, f, start, end = start, contents = '') => {
        const text = getfield(l, f).innerHTML;
        const result = text.substring(0, start) + contents + text.substring(end);
        const redo = () => {
            getfield(l, f).innerHTML = result;
            [cur_line, cur_field, cur_char] = [l, f, end];
        };
        const undo = () => {
            getfield(l, f).innerHTML = text;
            [cur_line, cur_field, cur_char] = [l, f, start];
        };
        return {redo, undo};
    },
    newline: (l) => {
        const redo = () => {
            getline(l).insertAdjacentHTML('afterend', new_line());
            cur_line = l+1;
        };
        const undo = () => {
            getline(l).nextSibling.remove();
            cur_line = l;
        };
        return {redo, undo};
    },
};

let history = [];
let history_head = 0;

const do_command = (cmd) => {
    history[history_head++] = commands[cmd[0]](...cmd.slice(1));
    history[history_head-1].redo();
    // note: this discards "future" edits after undoing
    history = history.slice(0, history_head);
};
const undo = () => {
    if (history_head > 0) {
        history[--history_head].undo();
    }
};
const redo = () => {
    if (history_head < history.length) {
        history[history_head++].redo();
    }
};

const clear_cursor = () => {
    const old = document.getElementById('cursor');
    if (old) {
        old.parentNode.style.backgroundColor = '';
        old.remove();
    }
};

const draw_cursor = () => {
    const field = getfield();
    const fieldlen = field.innerHTML.length;

    field.insertAdjacentHTML('beforebegin', '<div id="cursor">|</div>');
    field.parentNode.style.backgroundColor = '#e0f0e8';

    const pos = Math.min(cur_char, fieldlen);
    field.previousSibling.style.left = pos + 'ch';
};

const clamp = (v, l, u) => Math.max(l, Math.min(u, v));

const cur_move_line = (off) =>
      cur_line = clamp(cur_line+off, 0, prettycode.childNodes.length-1);
const cur_move_char = (off) =>
      cur_char = clamp(cur_char+off, 0, getfield().innerHTML.length);
const cur_move_field = (off) =>
      cur_field = (cur_field + off + col_order.length) % col_order.length;

const edit_remove = (off) => {
    const pos = Math.min(cur_char, getfield().innerHTML.length+off+1);
    if (pos > 0) {
        do_command(['splice', cur_line, cur_field, pos+off, pos+off+1]);
        cur_move_char(-1);
    }
};
const edit_insert = (key) => {
    do_command(['splice', cur_line, cur_field, cur_char, cur_char, key]);
    cur_move_char(1);
};

codepane.onkeydown = (event) => {
    clear_cursor();

    const is_input = (event) =>
          !event.ctrlKey && !event.metaKey && /^.$/u.test(event.key);
    const key = (k, ctrl=0, shift=0) => (event) =>
          event.key == k && (ctrl == event.ctrlKey) && (shift == event.shiftKey);

    const mapping = [
        [key('ArrowUp'),     () => cur_move_line(-1)],
        [key('ArrowDown'),   () => cur_move_line(1)],
        [key('ArrowLeft'),   () => cur_move_char(-1)],
        [key('ArrowRight'),  () => cur_move_char(1)],
        [key('z', 1),        undo],
        [key('Z', 1, 1),     redo],
        [key('Enter'),       () => do_command(['newline', cur_line])],
        [key('Tab'),         () => cur_move_field(1)],
        [key('Tab', 0, 1),   () => cur_move_field(-1)],
        [key('Backspace'),   () => edit_remove(-1)],
        [key('Delete'),      () => edit_remove(0)],
        [is_input,           () => edit_insert(event.key)],
    ];
    const match = mapping.find(([pred,]) => pred(event));
    if (match) {
        match[1]();
        event.preventDefault();
    }

    draw_cursor();
};

prettycode.innerHTML = create_page_format(prettycode.innerHTML);
codepane.focus();
draw_cursor();
