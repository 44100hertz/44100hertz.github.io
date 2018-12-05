const col_order = ['label', 'code', 'comment'];

const create_page = (code, lineno=0) => code.split('\n')
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

const clear_cursor = () => {
    const old = document.getElementById('cursor');
    if (old) {
        old.parentNode.style.backgroundColor = '';
        old.remove();
    }
};

// NOTE: drawing the cursor will affect the DOM in a way that makes the editor
// malfunction. Use clear_cursor before doing edit operations.
const draw_cursor = (field, cur_char) => {
    const fieldlen = field.innerHTML.length;

    field.insertAdjacentHTML('beforebegin', '<div id="cursor">|</div>');
    field.parentNode.style.backgroundColor = '#e0f0e8';

    const pos = Math.min(cur_char, fieldlen);
    field.previousSibling.style.left = pos + 'ch';
};

export default {create_page, new_line, col_order, draw_cursor, clear_cursor};
