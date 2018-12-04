// TODO: cursor-based editing
// TODO: compile and run code

let prettycode = document.getElementById('prettycode');
let screen = document.getElementById('screen').getContext('2d');
let cursor = document.getElementById('cursor');
// prettycode.innerHTML contains sample code
let innercode = prettycode.innerHTML;

const edit_pos = {x: 1, y: 5, colx: 1, col: 1};

const code_column = 10;
const comment_column = 30;

const col_order = ['label', 'code', 'comment'];

const format_lines = (lines, lineno=0) => lines.split('\n')
      .map((l) => format_line(l, ++lineno));

const format_line = (line, lineno) => {
    let [, contents, comment] = line.match(/([^;]*)(.*)/);
    let [, label, code] = contents.match(/(\w+:|)\s*(.*)/);

    // HACK: set cursor pos as side effect
    if (edit_pos.y == lineno) {
        const ep = edit_pos;
        const setpos = (content, rootcol) => {
            ep.field_width = content.length + 1;
            ep.x = rootcol + Math.min(ep.colx, ep.field_width);
        };
        const col_conf = [
            [label, 0],
            [code, code_column],
            [comment, comment_column],
        ];
        setpos(...col_conf[ep.col]);
    }

    return `<div class="c branchlabel">${label}</div>` +
        `<div class="c opcode">${code}</div>` +
        `<div class="c comment">${comment}</div>`;
};

const tick = () => {
    const coord = () => Math.floor(Math.random() * 64);
    const col = () => Math.random() * 256;
    screen.fillRect(coord(), coord(), 1, 1);
};

setInterval(tick, 40);

const refresh = () => {
    const lines = format_lines(innercode);
    edit_pos.y = Math.max(1, Math.min(edit_pos.y, lines.length));
    prettycode.innerHTML = lines.join('\n');
    cursor.style.left = `${edit_pos.x - 1}ch`;
    // HACK: fixed line height
    cursor.style.top = `${edit_pos.y * 18}px`;
};

refresh();

document.onkeydown = (event) => {
    let key = event.key;
    let not_handled;
    let input = () => !event.ctrlKey && !event.metaKey && /^.$/u.test(key);
    if (key == 'Backspace') {
        innercode = innercode.substring(0, innercode.length - 1);
    } else if (key == 'ArrowDown') {
        // HACK: Y clamped in refresh to be aware of doc lines
        ++edit_pos.y;
    } else if (key == 'ArrowUp') {
        --edit_pos.y;
    } else if (key == 'ArrowLeft') {
        edit_pos.colx = Math.max(
            1, Math.min(edit_pos.field_width, edit_pos.colx)-1) ;
    } else if (key == 'ArrowRight') {
        edit_pos.colx = Math.min(edit_pos.field_width, edit_pos.colx+1);
    } else if (key == 'Enter') {
        innercode += '\n';
    } else if (key == 'Tab') {
        if (event.shiftKey) --edit_pos.col; else ++edit_pos.col;
    } else if (input()) {
        innercode += key;
    } else {
        not_handled = true;
    }
    edit_pos.col %= col_order.length;
    if (!not_handled) {
        event.preventDefault();
    }
    refresh();
};
