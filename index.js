let code = document.getElementById('code');

const format = (lines) => lines.split('\n')
      .map(format_line)
      .reduce((acc, v) => acc + v);

const format_line = (line) => {
    const [, code, comment] = line.match(/^([^;]*);?(.*)/);
    const [, label, rest] = code.match(/^(\w+|)\s*(.*)/);
    const code_code = label !== '' && rest === '' ?
          '<div class="c_separator"> </div>' :
          `<div class="c_opcode">${rest}</div>`;
    return `\
<div class="c_label">${label}</div>\
${code_code}\
<div class="c_comment">${comment}</div>\n`;
};

code.innerHTML = format(code.innerHTML);
