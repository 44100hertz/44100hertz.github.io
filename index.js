// TODO: cursor navigation
// TODO: compile and run code

let code = document.getElementById('code');
let screen = document.getElementById('screen').getContext('2d');
let innercode = code.innerHTML;

const format = (lines) => lines.split('\n')
      .map(format_line)
      .reduce((acc, v) => acc + '\n' + v)
      .concat('<div id="cursor">|</div>');

const format_line = (line) => {
    const [, code, semi, comment] = line.match(/([^;]*)\s*(;?)(.*)/);
    // special case for single-line comment
    if (code === '' && comment !== '') {
        return `<div class=c_comment> ;;; ${comment}</div>`;
    }
    const [, label, rest] = code.match(/(\w+:|)\s*(.*)/);

    const label_code = `<div class="c_label">${label}</div>`;

    // special case for label w/o code
    const code_code = label !== '' && rest === '' ?
          '<div class="c_separator"> </div>' :
          `<div class="c_opcode">${rest}</div>`;

    const comment_code = semi === '' ? '' :
          `<div class="c_comment">; ${comment}</div>`;

    return label_code + code_code + comment_code;
};

const tick = () => {
    setTimeout(tick, 40);
    const coord = () => Math.floor(Math.random() * 64);
    const col = () => Math.random() * 256;
    screen.fillRect(coord(), coord(), 1, 1);
};

tick();

const refresh = () => {
    code.innerHTML = format(innercode);
};

refresh();

document.onkeydown = (event) => {
    let key = event.key;
    let not_handled;
    let input = () => !event.ctrlKey && !event.metaKey && /^.$/u.test(key);
    if (key == 'Backspace') {
        innercode = innercode.substring(0, innercode.length - 1);
    } else if (key == 'Enter') {
        innercode += '\n';
    } else if (key == 'Tab') {
        innercode += ';';
    } else if (input()) {
        innercode += key;
    } else {
        not_handled = true;
    }
    if (!not_handled) {
        event.preventDefault();
    }
    refresh();
};
