export const col_order = ['label', 'code', 'comment'];

export const clear_cursor = () => {
    const old = document.getElementById('cursor');
    if (old) {
        old.parentNode.style.backgroundColor = '';
        old.remove();
    }
};

// NOTE: drawing the cursor will affect the DOM in a way that makes the editor
// malfunction. Use clear_cursor before doing edit operations.
export const draw_cursor = (field, cur_char) => {
    const fieldlen = field.innerHTML.length;

    field.insertAdjacentHTML('beforebegin', '<div id="cursor">|</div>');
    field.parentNode.style.backgroundColor = '#e0f0e8';

    const pos = Math.min(cur_char, fieldlen);
    field.previousSibling.style.left = pos + 'ch';
};

function Label ({children}) {
    return <div class='label'>{children}</div>
}

function Code ({children}) {
    return <div class='code'>{children}</div>
}

function Comment ({children}) {
    return <div class='comment'>{children}</div>
}

export function CodeLine ({line}) {
    let [, contents, comment] = line.match(/([^;]*);?(.*)/);
    let [, label, code] = contents.match(/^(\w+|):?\s*(.*)/);
    return <div class="codeline">
             <Label>{label}</Label>
             <Code>{code}</Code>
             <Comment>{comment}</Comment>
           </div>;
}

export function PrettyCode ({code}) {
    return code.split('\n')
        .map((line, lineno) => <CodeLine {...{line, lineno}}/>);
}
