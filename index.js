let code = document.getElementById('code');
let screen = document.getElementById('screen').getContext('2d');
let innercode = code.innerHTML;

const format = (lines) => lines.split('\n')
      .map(format_line)
      .reduce((acc, v) => acc + v);

const format_line = (line) => {
    const [, code, comment] = line.match(/([^;]*);?(.*)/);
    const [, label, rest] = code.match(/(\w+:|)\s*(.*)/);
    const code_code = label !== '' && rest === '' ?
          '<div class="c_separator"> </div>' :
          `<div class="c_opcode">${rest}</div>`;
    return `<div class="c_label">${label}</div>\
${code_code}\
<div class="c_comment">${comment}</div>\n`;
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

const modkeys = {
    Shift: 'up',
};

const inputkeys = /^[a-zA-Z; ]$/;
const shifted = {
    1:'!',2:'@',3:'#',4:'$',5:'%',
    6:'^',7:'&',8:'*',9:'(',0:')'};

const shiftlayer = (k) => shifted[k] || k;

document.onkeydown = (event) => {
    let key = event.key;
    let not_handled;
    if (modkeys.Shift === 'down') {
        key = shiftlayer(key);
    }
    if (modkeys[key]) {
        modkeys[key] = 'down';
    } else if (key == 'Backspace') {
        innercode = innercode.substring(0, innercode.length - 1);
    } else if (key == 'Enter') {
        innercode += '\n';
    } else if (key == 'Tab') {
        innercode += ';';
    } else if (inputkeys.test(event.key)) {
        innercode += key;
    } else {
        not_handled = true;
    }
    if (!not_handled) {
        event.preventDefault();
    }
    refresh();
};

document.onkeyup = (event) => {
    let key = event.key;
    if (modkeys[key]) {
        modkeys[key] = 'up';
    }
};
