// TODO: editing
// TODO: partial updates (split inner code into div list)
// TODO: compile and run code

let codepane = document.getElementById('codepane');
let prettycode = document.getElementById('prettycode');
let screen = document.getElementById('screen').getContext('2d');

let cur_char = 0;
let cur_line = 1;
let cur_field = 1;

const col_order = ['label', 'code', 'comment'];

const create_page_format = (code, lineno=0) => code.split('\n')
      .map((l) => format_line(l, ++lineno))
      .join('');

// inner format:
// f0x1 -- line 0, field 1
// l0   -- line 0 wrapper
const new_line = (label = '', code = '', comment = '') => {
    const cols_by_name = {label, code, comment};
    const cols = col_order.map((name, col) => {
        const contents = cols_by_name[name];
        return `<div class="${name}">${contents}</div>`;
    }).join('');
    return `<div class="codeline"}>${cols}</div>`;
};
const blank_line = new_line();

const format_line = (line, lineno) => {
    let [, contents, comment] = line.match(/([^;]*)(.*)/);
    let [, label, code] = contents.match(/(\w+:|)\s*(.*)/);
    return new_line(label, code, comment);
};

const getline = (line = cur_line) => prettycode.childNodes[line];
const getfield = (line, field = cur_field) => getline(line).childNodes[field];

const clear_cursor = () => {
    const old = document.getElementById('cursor');
    if (old) {
        old.parentNode.style.backgroundColor = '';
        old.remove();
    }
};

const draw_cursor = () => {
    const field = getfield();
    field.insertAdjacentHTML('beforebegin', '<div id="cursor">█</div>');
    field.parentNode.style.backgroundColor = '#e0f0e8';
};

document.onkeydown = (event) => {
    clear_cursor();

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
        getline().insertAdjacentHTML('afterend', blank_line);
        ++cur_line;
    } else if (key == 'Tab') {
        const offset = event.shiftKey ? -1 : 1;
        cur_field = (cur_field + offset + col_order.length) % col_order.length;
    } else if (is_input()) {
        field.innerHTML += key;
    } else {
        not_handled = true;
    }
    if (!not_handled) {
        event.preventDefault();
    }
    draw_cursor();
};

prettycode.innerHTML = create_page_format(prettycode.innerHTML);
codepane.focus();
draw_cursor();
