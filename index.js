// TODO: editing
// TODO: partial updates (split inner code into div list)
// TODO: compile and run code

let prettycode = document.getElementById('prettycode');
let screen = document.getElementById('screen').getContext('2d');

let cur_char = 0;
let cur_line = 1;
let cur_field = 1;

const col_order = ['label', 'code', 'comment'];

const create_page_format = (code, lineno=0) => code.split('\n')
      .map((l) => format_line(l, ++lineno))
      .join('\n');

// inner format:
// f0x1 -- line 0, field 1
// l0   -- line 0 wrapper
const new_line = (lineno, label = '', code = '', comment = '') => {
    const cols_by_name = {label, code, comment};
    const cols = col_order.map((name, col) => {
        const contents = cols_by_name[name];
        return `<div class="${name}" id="f${lineno}x${col}">${contents}</div>`;
    }).join('');
    const odd = lineno % 2 == 0 ? 'oddline' : '';
    return `<div class="codeline ${odd}" id=l${lineno}>${cols}</div>`;
};

const format_line = (line, lineno) => {
    let [, contents, comment] = line.match(/([^;]*)(.*)/);
    let [, label, code] = contents.match(/(\w+:|)\s*(.*)/);
    return new_line(lineno, label, code, comment);
};

const getfield = (line = cur_line, field = cur_field) =>
      document.getElementById(`f${cur_line}x${cur_field}`);

const draw_cursor = () => {
    const old = document.getElementById('cursor');
    if (old) old.remove();
    const field = getfield();
    field.insertAdjacentHTML('beforebegin', '<div id="cursor">█</div>');
};

document.onkeydown = (event) => {
    // HACK: just delete the cursor except when needed
    let key = event.key;
    let not_handled;
    const field = getfield();
    let is_input = () => !event.ctrlKey && !event.metaKey && /^.$/u.test(key);
    if (key == 'Backspace') {
        const i = field.innerHTML;
        field.innerHTML = i.substring(0, i.length - 1);
    } else if (key == 'ArrowDown') {
        ++cur_line;
    } else if (key == 'ArrowUp') {
        --cur_line;
    } else if (key == 'ArrowLeft') {
        ++cur_char;
    } else if (key == 'ArrowRight') {
        --cur_char;
    } else if (key == 'Enter') {
        prettycode.innerHTML += new_line();
    } else if (key == 'Tab') {
        if (event.shiftKey) --cur_field; else ++cur_field;
    } else if (is_input()) {
        field.innerHTML += key;
    } else {
        not_handled = true;
    }
    cur_field %= col_order.length;
    if (!not_handled) {
        event.preventDefault();
    }
    draw_cursor();
};

prettycode.innerHTML = create_page_format(prettycode.innerHTML);
draw_cursor();
