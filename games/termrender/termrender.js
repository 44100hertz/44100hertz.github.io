addEventListener('load', load);

function load() {
    const term = Terminal({resolution: {x: 30, y: 20}});
    setInterval(() => {
        const randi = (bound) => Math.floor(Math.random() * bound)
        term.set_tile(
            randi(term.resolution.x),
            randi(term.resolution.y),
            {
                [Math.random() < 0.5 ? 'fg' : 'bg']: Array(3).fill(0).map(Math.random),
                char: String.fromCharCode(randi(0x40) + 0x20)
            })
    }, 20)
}

function Terminal({resolution}) {
    const e_term = document.getElementById('terminal');

    const Canvas = () => {
        const canvas = document.createElement('canvas'); 
        canvas.width = resolution.x;
        canvas.height = resolution.y;
        const ctx = canvas.getContext('2d');

        return {
            element: canvas,
            clear(color) {
                ctx.fillStyle = color;
                ctx.fillRect(0, 0, resolution.x, resolution.y);
            },
            setPixel(x, y, color) {
                const [r,g,b] = color;
                ctx.fillStyle = `rgb(${r*100}%, ${g*100}%, ${b*100}%)`;
                ctx.fillRect(x, y, 1, 1);
            }
        };
    }

    const Text = () => {
        const pre = document.createElement('pre');
        const filler = '.';
        const blankLine = filler.repeat(resolution.x);
        const charRows = Array(resolution.y).fill(blankLine)

        const rescale = () => {
            pre.style.transform = `scale(100%, 100%)`
            const termRect = e_term.getBoundingClientRect();
            const textRect = pre.getBoundingClientRect();
            const scalex = (termRect.right - termRect.left) / (textRect.right - textRect.left);
            const scaley = (termRect.bottom - termRect.top) / (textRect.bottom - textRect.top);
            pre.style.transform = `scale(${scalex*100}%, ${scaley*100}%)`
        }
        setTimeout(rescale);

        const refresh = () => {
            pre.textContent = charRows.join('\n');
        }
        refresh();

        return {
            element: pre,
            rescale,
            setChar(x, y, char) {
                if (char.length == 1) {
                    charRows[y] =
                        charRows[y].slice(0,x)
                        + char.slice(0,1)
                        + charRows[y].slice(x+1);
                }
                refresh();
            },
        }
    }

    const fg_canvas = Canvas();
    const bg_canvas = Canvas();
    const text = Text();
    fg_canvas.clear('gray');
    bg_canvas.clear('gray');

    e_term.appendChild(bg_canvas.element);
    e_term.appendChild(text.element);
    e_term.appendChild(fg_canvas.element);
    fg_canvas.element.style.mixBlendMode = 'difference';
    text.element.style.color = 'black';

    addEventListener('resize', () => text.rescale());

    const fg_pixels = Array(resolution.y).fill(0).map(() => []);

    return {
        resolution: resolution,
        set_tile(_x, _y, {fg, bg, char}) {
            const x = Math.floor(_x);
            const y = Math.floor(_y);
            if (y >= 0 && y < resolution.y && x >= 0 && x < resolution.x) {
                if(fg) {
                    fg_pixels[y][x] = fg;
                    fg_canvas.setPixel(x, y, fg);
                }
                if(fg || bg) {
                    const fg_in = fg_pixels[y][x] ?? [0,0,0];
                    const bg_in = bg ?? [0,0,0];
                    const bg_out = bg_in.map((bgc,i) => {
                        const fgc = fg_in[i];
                        // difference blend: out = abs(bg - fg)
                        // must invert that equation. lol
                        const sum = fgc + bgc;
                        return sum <= 1 ? sum : fgc - bgc;
                    })
                    bg_canvas.setPixel(x, y, bg_out);
                }
                if(char) text.setChar(x, y, char);
            }
        },
    }
}