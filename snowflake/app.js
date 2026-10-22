/* Snowflake — a canvas port of dump/snowflake.scad */
(() => {
    'use strict';

    /* ------------------------------------------------------------------ *
     *  geometry — mirrors the openscad source
     * ------------------------------------------------------------------ */

    const DEG = Math.PI / 180;
    const ARM_W = 40;      // scad: w = 40
    const MAX_LEVEL = 4;   // scad: if (i < 4)

    // affine matrix [a, b, c, d, e, f]:  x' = a·x + c·y + e , y' = b·x + d·y + f
    const IDENT = [1, 0, 0, 1, 0, 0];
    const MIRROR_X = [-1, 0, 0, 1, 0, 0];

    const mul = (m, n) => [
        m[0] * n[0] + m[2] * n[1],
        m[1] * n[0] + m[3] * n[1],
        m[0] * n[2] + m[2] * n[3],
        m[1] * n[2] + m[3] * n[3],
        m[0] * n[4] + m[2] * n[5] + m[4],
        m[1] * n[4] + m[3] * n[5] + m[5]
    ];
    const rotM = (a) => {
        const c = Math.cos(a);
        const s = Math.sin(a);
        return [c, s, -s, c, 0, 0];
    };
    const moveM = (x, y) => [1, 0, 0, 1, x, y];
    const scaleM = (s) => [s, 0, 0, s, 0, 0];

    // scad: function bit(x, n)
    const bit = (x, n) =>
        Math.floor(x / 2 ** n) - 2 * Math.floor(x / 2 ** (n + 1)) === 1;

    // Emit one arm of the flake (a hard-cornered box) in parent space.
    // The mirror() in scad flips winding, so normalise it — otherwise
    // overlapping arms would cancel out under the nonzero fill rule.
    function pushArm(out, m, w, h) {
        const [a, b, c, d, e, f] = m;
        const hh = h / 2;
        const x0 = c * -hh, y0 = d * -hh;
        const x1 = a * w + c * -hh, y1 = b * w + d * -hh;
        const x2 = a * w + c * hh, y2 = b * w + d * hh;
        const x3 = c * hh, y3 = d * hh;
        if (a * d - b * c < 0) {
            out.push(x3 + e, y3 + f, x2 + e, y2 + f, x1 + e, y1 + f, x0 + e, y0 + f);
        } else {
            out.push(x0 + e, y0 + f, x1 + e, y1 + f, x2 + e, y2 + f, x3 + e, y3 + f);
        }
    }

    function buildPath(params) {
        const s = params.scaleIter;
        const tw = params.twistIter * DEG;
        const h = params.lineThickness;
        const verts = [];

        const walk = (m, level, tally) => {
            // The hub (level 0) is always six-fold. The mask's three bits
            // drive levels 1..3, so the centre can never become a pinwheel.
            const sym = level === 0 || bit(params.skipPattern, level - 1) ? 6 : 3;
            for (let j = 0; j < sym; j++) {
                const ma = mul(m, rotM((j * Math.PI * 2) / sym));
                pushArm(verts, ma, ARM_W, h);
                if (level < MAX_LEVEL && ARM_W * tally > params.minLineW) {
                    const child = mul(
                        mul(mul(mul(ma, moveM(ARM_W, 0)), scaleM(s)), MIRROR_X),
                        rotM(tw)
                    );
                    walk(child, level + 1, tally * s);
                }
            }
        };
        walk(IDENT, 0, 1);

        // normalise so the flake always fills the same circle
        let r2 = 1e-9;
        for (let i = 0; i < verts.length; i += 2) {
            const d = verts[i] * verts[i] + verts[i + 1] * verts[i + 1];
            if (d > r2) r2 = d;
        }
        const r = Math.sqrt(r2);

        const path = new Path2D();
        for (let i = 0; i < verts.length; i += 8) {
            path.moveTo(verts[i] / r, verts[i + 1] / r);
            path.lineTo(verts[i + 2] / r, verts[i + 3] / r);
            path.lineTo(verts[i + 4] / r, verts[i + 5] / r);
            path.lineTo(verts[i + 6] / r, verts[i + 7] / r);
            path.closePath();
        }
        return path;
    }

    const CAN_FILTER = (() => {
        try {
            return 'filter' in document.createElement('canvas').getContext('2d');
        } catch (err) {
            return false;
        }
    })();

    // A soft, pre-blurred copy of the flake used as a bloom underlay.
    function makeGlow(path) {
        const n = CAN_FILTER ? 256 : 72;
        const cv = document.createElement('canvas');
        cv.width = n;
        cv.height = n;
        const g = cv.getContext('2d');
        if (CAN_FILTER) g.filter = 'blur(9px)';
        g.translate(n / 2, n / 2);
        g.scale(n / 2 - n * 0.06, n / 2 - n * 0.06);
        g.fillStyle = '#fff';
        g.fill(path);
        return cv;
    }

    const pathCache = new Map();
    function flakeFor(params, minLineW) {
        const key = [
            params.scaleIter,
            params.twistIter,
            params.skipPattern,
            params.lineThickness,
            minLineW
        ].join('|');
        let entry = pathCache.get(key);
        if (!entry) {
            const path = buildPath({ ...params, minLineW });
            entry = { path, glow: makeGlow(path) };
            pathCache.set(key, entry);
            if (pathCache.size > 36) pathCache.delete(pathCache.keys().next().value);
        }
        return entry;
    }

    /* ------------------------------------------------------------------ *
     *  state
     * ------------------------------------------------------------------ */

    const DEFAULTS = {
        scaleIter: 0.5,
        twistIter: 30,
        skipPattern: 3,
        lineThickness: 10
    };

    const PARAM_SPECS = [
        { key: 'scaleIter', label: 'scale / iter', min: 0.3, max: 0.6, step: 0.005, decimals: 3 },
        { key: 'twistIter', label: 'twist / iter', min: 0, max: 60, step: 0.5, decimals: 1, unit: '\u00B0' },
        { key: 'skipPattern', label: 'six-fold mask', min: 0, max: 7, step: 1, bits: 3,
            hint: 'Six arms at levels 1\u20133 (left to right). The hub is always six.' },
        { key: 'lineThickness', label: 'line weight', min: 5, max: 15, step: 0.25, decimals: 2 }
    ];

    const MIN_LINE = { min: 5, max: 20, step: 0.5 };
    const SLOT_COUNT = 16;
    const STORE_KEY = 'snowflake.v1';

    const S = {
        params: { ...DEFAULTS },
        minLineW: 10,
        slots: new Array(SLOT_COUNT).fill(null),
        selected: 0
    };

    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

    function sanitize(raw, base) {
        const out = { ...base };
        for (const spec of PARAM_SPECS) {
            const v = Number(raw?.[spec.key]);
            if (Number.isFinite(v)) {
                out[spec.key] = clamp(spec.bits ? Math.round(v) : v, spec.min, spec.max);
            }
        }
        return out;
    }

    let persistTimer = 0;
    function writeStore() {
        clearTimeout(persistTimer);
        persistTimer = 0;
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify({
                params: S.params,
                minLineW: S.minLineW,
                slots: S.slots,
                selected: S.selected
            }));
        } catch (err) { /* private mode, quota — the flake still renders */ }
    }
    function persist() {
        if (persistTimer) clearTimeout(persistTimer);
        persistTimer = setTimeout(writeStore, 140);
    }

    function restore() {
        let raw = null;
        try {
            raw = localStorage.getItem(STORE_KEY);
        } catch (err) { return; }
        if (!raw) return;
        try {
            const data = JSON.parse(raw);
            if (!data || typeof data !== 'object') return;
            S.params = sanitize(data.params, DEFAULTS);
            if (Number.isFinite(data.minLineW)) {
                S.minLineW = clamp(data.minLineW, MIN_LINE.min, MIN_LINE.max);
            }
            if (Array.isArray(data.slots)) {
                for (let i = 0; i < SLOT_COUNT; i++) {
                    S.slots[i] = data.slots[i] ? sanitize(data.slots[i], DEFAULTS) : null;
                }
            }
            if (Number.isInteger(data.selected)) S.selected = clamp(data.selected, 0, SLOT_COUNT - 1);
        } catch (err) { /* corrupt payload — start fresh */ }
    }

    /* ------------------------------------------------------------------ *
     *  dom
     * ------------------------------------------------------------------ */

    const $ = (id) => document.getElementById(id);
    const flakeCv = $('flake');
    const fctx = flakeCv.getContext('2d');
    const cloudCv = $('cloud');
    const cloudWrap = $('cloudwrap');
    const gridEl = $('grid');
    const rowsEl = $('rows');
    const minLineInput = $('min-line');
    const minLineVal = $('min-line-val');
    const hintEl = $('hint');
    const slotLabel = $('slot-label');
    const exportBtn = $('export');
    const importBtn = $('import');
    const fileInput = $('file');
    const controlsEl = document.querySelector('.controls');
    const flockEl = document.querySelector('.flock');
    const randomBtn = $('randomize');
    const resetBtn = $('reset');

    const slotEls = [];

    function formatValue(spec, v) {
        if (spec.bits) return v.toString(2).padStart(spec.bits, '0');
        return v.toFixed(spec.decimals) + (spec.unit || '');
    }

    const controls = new Map();

    function buildControls() {
        for (const spec of PARAM_SPECS) {
            const row = document.createElement('div');
            row.className = 'row';

            const head = document.createElement('div');
            head.className = 'row-head';
            const label = document.createElement('span');
            label.className = 'label';
            label.textContent = spec.label;
            const val = document.createElement('span');
            val.className = 'val';
            head.append(label, val);

            const input = document.createElement('input');
            input.type = 'range';
            input.min = spec.min;
            input.max = spec.max;
            input.step = spec.step;
            input.setAttribute('aria-label', spec.label);
            if (spec.hint) input.title = spec.hint;

            row.append(head, input);
            rowsEl.append(row);
            controls.set(spec.key, { spec, input, val });

            input.addEventListener('input', () => {
                const raw = Number(input.value);
                S.params[spec.key] = spec.bits ? Math.round(raw) : raw;
                syncParam(spec.key);
                commitEdit();
            });
        }

        minLineInput.min = MIN_LINE.min;
        minLineInput.max = MIN_LINE.max;
        minLineInput.step = MIN_LINE.step;
        minLineInput.addEventListener('input', () => {
            S.minLineW = Number(minLineInput.value);
            syncMinLine();
            paintFlock();
            persist();
        });
    }

    function syncParam(key) {
        const entry = controls.get(key);
        if (!entry) return;
        const { spec, input, val } = entry;
        const v = S.params[key];
        input.value = v;
        const pct = ((v - spec.min) / (spec.max - spec.min)) * 100;
        input.style.setProperty('--fill', pct.toFixed(2) + '%');
        val.textContent = formatValue(spec, v);
    }

    function syncAllParams() {
        for (const key of controls.keys()) syncParam(key);
    }

    function syncMinLine() {
        minLineInput.value = S.minLineW;
        const pct = ((S.minLineW - MIN_LINE.min) / (MIN_LINE.max - MIN_LINE.min)) * 100;
        minLineInput.style.setProperty('--fill', pct.toFixed(2) + '%');
        minLineVal.textContent = S.minLineW.toFixed(1).replace(/\.0$/, '');
    }

    function buildGrid() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        for (let i = 0; i < SLOT_COUNT; i++) {
            const el = document.createElement('button');
            el.type = 'button';
            el.className = 'slot';
            el.style.setProperty('--i', String(i));
            el.setAttribute('aria-label', `Save slot ${i + 1}`);

            const cv = document.createElement('canvas');
            const px = Math.round(58 * dpr);
            cv.width = px;
            cv.height = px;
            el.append(cv);

            const plus = document.createElement('span');
            plus.className = 'plus';
            el.append(plus);

            gridEl.append(el);
            slotEls.push({ el, cv });

            el.addEventListener('click', () => onSlotClick(i));
            el.addEventListener('pointerenter', () => onSlotHover(i, true));
            el.addEventListener('pointerleave', () => onSlotHover(i, false));
        }
    }

    /* ------------------------------------------------------------------ *
     *  flock painting
     * ------------------------------------------------------------------ */

    let flockQueued = false;
    let flockLast = -1e9;
    function paintFlock() {
        if (flockQueued) return;
        flockQueued = true;
        const run = () => {
            flockQueued = false;
            flockLast = performance.now();
            for (let i = 0; i < SLOT_COUNT; i++) paintSlot(i);
        };
        // keep slider drags smooth: the tiny slot previews may lag a beat
        const wait = Math.max(0, 70 - (performance.now() - flockLast));
        if (wait > 0) setTimeout(() => requestAnimationFrame(run), wait);
        else requestAnimationFrame(run);
    }

    function paintSlot(i) {
        const { el, cv } = slotEls[i];
        const params = S.slots[i];
        const g = cv.getContext('2d');
        const n = cv.width;

        el.classList.toggle('filled', !!params);
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.clearRect(0, 0, n, n);
        if (!params) return;

        const { path } = flakeFor(params, S.minLineW);
        g.translate(n / 2, n / 2);
        g.rotate((i % 4) * 0.17 - 0.26);
        const r = n * 0.4;
        g.scale(r, r);
        g.fillStyle = '#fff';
        g.fill(path);
    }

    /* ------------------------------------------------------------------ *
     *  collection — sixteen live flakes, edited in place
     * ------------------------------------------------------------------ */

    const HINT_IDLE = 'edits save in place';
    const MASKS = [0, 1, 2, 3, 3, 4, 5, 6, 7, 7];
    let hintTimer = 0;

    function setHint(text) {
        clearTimeout(hintTimer);
        hintEl.textContent = text;
    }

    function say(text) {
        clearTimeout(hintTimer);
        hintEl.textContent = text;
        hintTimer = setTimeout(() => { hintEl.textContent = HINT_IDLE; }, 2800);
    }

    // a small spin impulse so a new flake arrives with a little life
    function kick(amount) {
        spin = Math.max(spin, amount);
    }

    function randomFlake() {
        const r = Math.random;
        return {
            scaleIter: Math.round((0.4 + r() * 0.17) * 1000) / 1000,
            twistIter: Math.round((8 + r() * 50) * 2) / 2,
            skipPattern: MASKS[Math.floor(r() * MASKS.length)],
            lineThickness: Math.round((7 + r() * 4.5) * 4) / 4
        };
    }

    function flakeKey(p) {
        return p ? `${p.scaleIter}|${p.twistIter}|${p.skipPattern}|${p.lineThickness}` : '';
    }

    function fillRandom() {
        const taken = new Set(S.slots.map(flakeKey));
        for (let i = 0; i < SLOT_COUNT; i++) {
            if (S.slots[i]) continue;
            let p = randomFlake();
            for (let tries = 0; taken.has(flakeKey(p)) && tries < 12; tries++) p = randomFlake();
            taken.add(flakeKey(p));
            S.slots[i] = p;
        }
    }

    function syncSlotLabel() {
        slotLabel.textContent = `${String(S.selected + 1).padStart(2, '0')} / ${SLOT_COUNT}`;
    }

    // every edit lands in the highlighted slot immediately
    function commitEdit() {
        S.slots[S.selected] = { ...S.params };
        paintSlot(S.selected);
        persist();
    }

    function selectSlot(i) {
        S.selected = i;
        for (let k = 0; k < SLOT_COUNT; k++) {
            slotEls[k].el.classList.toggle('sel', k === i);
            slotEls[k].el.setAttribute('aria-current', k === i ? 'true' : 'false');
        }
        if (S.slots[i]) {
            S.params = { ...S.slots[i] };
            syncAllParams();
            kick(0.5);
        }
        syncSlotLabel();
        persist();
    }

    function onSlotClick(i) {
        selectSlot(i);
        setHint(HINT_IDLE);
    }

    function onSlotHover(i, on) {
        clearTimeout(hintTimer);
        hintEl.textContent = on ? 'click to edit' : HINT_IDLE;
    }

    function randomize() {
        const taken = new Set(S.slots.map((p, i) => (i === S.selected ? '' : flakeKey(p))));
        let p = randomFlake();
        for (let tries = 0; taken.has(flakeKey(p)) && tries < 12; tries++) p = randomFlake();
        S.params = p;
        syncAllParams();
        commitEdit();
        kick(0.75);
    }

    function reset() {
        S.params = { ...DEFAULTS };
        syncAllParams();
        commitEdit();
        kick(0.45);
    }

    /* ---------- files ---------- */

    function exportFlakes() {
        const payload = {
            format: 'snowflakes',
            version: 1,
            minLineW: S.minLineW,
            flakes: S.slots.map((p) => ({ ...p }))
        };
        const blob = new Blob([JSON.stringify(payload, null, 2) + '\n'], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'snowflakes.json';
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        say(`exported ${S.slots.filter(Boolean).length} flakes`);
    }

    async function importFlakes(file) {
        let data;
        try {
            data = JSON.parse(await file.text());
        } catch (err) {
            say('could not read that file');
            return;
        }
        const list = Array.isArray(data) ? data : data && Array.isArray(data.flakes) ? data.flakes : null;
        if (!list) {
            say('no flakes in that file');
            return;
        }

        const next = new Array(SLOT_COUNT).fill(null);
        let loaded = 0;
        for (let i = 0; i < Math.min(SLOT_COUNT, list.length); i++) {
            const item = list[i];
            if (item && typeof item === 'object') {
                next[i] = sanitize(item, DEFAULTS);
                loaded++;
            }
        }
        S.slots = next;
        fillRandom(); // the flock is always full

        if (data && Number.isFinite(data.minLineW)) {
            S.minLineW = clamp(data.minLineW, MIN_LINE.min, MIN_LINE.max);
            syncMinLine();
        }
        selectSlot(0);
        paintFlock();
        say(`loaded ${loaded} flake${loaded === 1 ? '' : 's'}`);
    }

    /* ------------------------------------------------------------------ *
     *  main canvas
     * ------------------------------------------------------------------ */

    let dpr = 1;
    let vw = 0;
    let vh = 0;
    let cx = 0;
    let cy = 0;
    let radius = 0;
    let board = 0;

    const reduceMotion = window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : { matches: false };

    let baseSpin = reduceMotion.matches ? 0.008 : 0.055; // rad/s
    let spin = baseSpin;
    let spinTarget = baseSpin;
    let angle = Math.random() * Math.PI * 2;
    let turnX = 0;
    let turnY = 0;
    let turnXTarget = 0;
    let turnYTarget = 0;
    let lastInput = -1e6;
    let lastT = 0;
    let cloudX = 0;
    let cloudY = 0;

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        vw = window.innerWidth;
        vh = window.innerHeight;
        cx = vw * 0.5;

        if (vw <= 700) {
            // compact hud: measure what is left above the panels and fit into it
            const top = Math.min(
                controlsEl.getBoundingClientRect().top,
                flockEl.getBoundingClientRect().top
            );
            const room = Math.max(140, Math.min(vh, top) - 14);
            cy = room * 0.52;
            radius = Math.min(vw * 0.44, room * 0.46);
        } else {
            // sit in the open lane between the two glass panels
            const laneL = controlsEl.getBoundingClientRect().right + 22;
            const laneR = flockEl.getBoundingClientRect().left - 22;
            const lane = Math.max(220, laneR - laneL);
            cx = (laneL + laneR) / 2;
            cy = vh * 0.455;
            radius = Math.min(vh * 0.325, lane * 0.5);
        }
        board = Math.ceil(radius * 3.1);

        flakeCv.width = Math.max(1, Math.round(board * dpr));
        flakeCv.height = Math.max(1, Math.round(board * dpr));
        flakeCv.style.width = board + 'px';
        flakeCv.style.height = board + 'px';
        flakeCv.style.left = Math.round(cx - board / 2) + 'px';
        flakeCv.style.top = Math.round(cy - board / 2) + 'px';
        lastT = 0;
    }

    function draw() {
        const { path, glow } = flakeFor(S.params, S.minLineW);
        fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        fctx.clearRect(0, 0, board, board);

        fctx.save();
        fctx.translate(board / 2, board / 2);
        fctx.rotate(angle);
        fctx.scale(radius, radius);
        // a restrained turn-in-depth, driven by the pointer
        fctx.transform(1 - turnX * 0.085, 0, 0, 1 + turnX * 0.055, 0, 0);
        fctx.translate(0, turnY * 0.015);

        fctx.globalCompositeOperation = 'lighter';
        fctx.globalAlpha = 0.15;
        fctx.drawImage(glow, -1.42, -1.42, 2.84, 2.84);
        fctx.globalAlpha = 0.34;
        fctx.drawImage(glow, -1.1, -1.1, 2.2, 2.2);

        fctx.globalCompositeOperation = 'source-over';
        fctx.globalAlpha = 1;
        fctx.fillStyle = '#ffffff';
        fctx.fill(path);
        fctx.restore();
    }

    function frame(t) {
        const now = t || performance.now();
        const dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0;
        lastT = now;

        const idle = now - lastInput > 2400;
        const goal = idle ? baseSpin : spinTarget;
        spin += (goal - spin) * (1 - Math.exp(-dt * (idle ? 0.7 : 2.6)));
        angle += spin * dt;

        const ease = 1 - Math.exp(-dt * (idle ? 0.8 : 3.2));
        turnX += ((idle ? 0 : turnXTarget) - turnX) * ease;
        turnY += ((idle ? 0 : turnYTarget) - turnY) * ease;

        cloudX += ((idle ? 0 : turnXTarget) * -16 - cloudX) * ease * 0.6;
        cloudY += ((idle ? 0 : turnYTarget) * -9 - cloudY) * ease * 0.6;
        cloudWrap.style.transform =
            `translate3d(${cloudX.toFixed(2)}px, ${cloudY.toFixed(2)}px, 0)`;

        draw();
        requestAnimationFrame(frame);
    }

    function onPointerMove(e) {
        const nx = clamp((e.clientX / vw) * 2 - 1, -1, 1);
        const ny = clamp((e.clientY / vh) * 2 - 1, -1, 1);
        turnXTarget = nx;
        turnYTarget = ny;
        spinTarget = baseSpin + nx * 0.38;
        lastInput = performance.now();
    }

    /* ------------------------------------------------------------------ *
     *  cirrus cloud
     * ------------------------------------------------------------------ */

    function drawClouds() {
        const cw = 760;
        const ch = 470;
        cloudCv.width = cw;
        cloudCv.height = ch;
        const out = cloudCv.getContext('2d');
        out.clearRect(0, 0, cw, ch);

        // paint into a buffer, then bake the blur in — a css filter on a
        // moving layer gets re-rasterised every frame, this does not
        const buffer = document.createElement('canvas');
        buffer.width = cw;
        buffer.height = ch;
        const g = buffer.getContext('2d');
        g.lineCap = 'round';

        let seed = 0x5eed;
        const rnd = () => {
            seed = (seed * 1664525 + 1013904223) % 4294967296;
            return seed / 4294967296;
        };
        // cheap bell-ish distribution in [-1, 1]
        const bell = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;

        // one ice fibre: a tapered, faintly curved stroke
        const fibre = (x, y, len, width, angle, bend, alpha) => {
            if (alpha <= 0.004) return;
            g.save();
            g.translate(x, y);
            g.rotate(angle);
            const grad = g.createLinearGradient(0, 0, len, 0);
            grad.addColorStop(0, 'rgba(255,255,255,0)');
            grad.addColorStop(0.3, `rgba(255,255,255,${alpha})`);
            grad.addColorStop(0.72, `rgba(255,255,255,${alpha * 0.8})`);
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            g.strokeStyle = grad;
            g.lineWidth = width;
            g.beginPath();
            g.moveTo(0, 0);
            g.quadraticCurveTo(len * 0.5, bend, len, bend * 0.35);
            g.stroke();
            g.restore();
        };

        // cirrus banks: fibrous tufts combed into a single drifting mass
        const banks = [
            { x: 0.56, y: 0.285, w: 0.28, h: 0.11, a: -0.09, n: 170, len: [25, 120], alpha: [0.06, 0.30] },
            { x: 0.72, y: 0.165, w: 0.19, h: 0.08, a: -0.30, n: 100, len: [20, 95], alpha: [0.05, 0.24] },
            { x: 0.40, y: 0.320, w: 0.22, h: 0.07, a: -0.02, n: 80, len: [20, 105], alpha: [0.04, 0.17] },
            { x: 0.86, y: 0.400, w: 0.16, h: 0.05, a: 0.10, n: 45, len: [15, 75], alpha: [0.03, 0.12] },
            { x: 0.22, y: 0.430, w: 0.20, h: 0.045, a: 0.04, n: 35, len: [15, 70], alpha: [0.02, 0.09] }
        ];

        for (const bank of banks) {
            for (let i = 0; i < bank.n; i++) {
                const gx = bell();
                const gy = bell();
                const x = (bank.x + gx * bank.w * 0.5) * cw;
                const y = (bank.y + gy * bank.h * 0.5) * ch;
                const len = (bank.len[0] + rnd() * (bank.len[1] - bank.len[0])) * (1 - Math.abs(gx) * 0.4);
                const width = 0.8 + rnd() * 1.9;
                const angle = bank.a + (rnd() - 0.5) * 0.3;
                const bend = (rnd() - 0.5) * len * 0.45;
                const alpha = (bank.alpha[0] + rnd() * (bank.alpha[1] - bank.alpha[0]))
                    * (1 - Math.abs(gy) * 0.55);
                fibre(x, y, len, width, angle, bend, alpha);
            }
        }

        if (CAN_FILTER) out.filter = 'blur(1.6px)';
        out.drawImage(buffer, 0, 0);
    }

    /* ------------------------------------------------------------------ *
     *  wiring
     * ------------------------------------------------------------------ */

    function onKey(e) {
        const mod = e.metaKey || e.ctrlKey;
        if (mod && (e.key === 's' || e.key === 'S')) {
            e.preventDefault();
            exportFlakes();
            return;
        }
        if (mod || e.altKey) return;
        if (e.key === 'r' || e.key === 'R') randomize();
        else if (e.key === 'e' || e.key === 'E') exportFlakes();
        else if (e.key === 'i' || e.key === 'I') fileInput.click();
    }

    function init() {
        restore();
        buildControls();
        buildGrid();
        drawClouds();

        if (!S.slots.every(Boolean)) fillRandom();
        if (!S.slots[S.selected]) S.selected = 0;
        S.params = { ...S.slots[S.selected] };

        resize();
        syncAllParams();
        syncMinLine();

        selectSlot(S.selected);
        setHint(HINT_IDLE);
        paintFlock();

        randomBtn.addEventListener('click', randomize);
        resetBtn.addEventListener('click', reset);
        exportBtn.addEventListener('click', exportFlakes);
        importBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => {
            const file = fileInput.files && fileInput.files[0];
            fileInput.value = '';
            if (file) importFlakes(file);
        });
        window.addEventListener('resize', resize);
        if (window.ResizeObserver) {
            const ro = new ResizeObserver(() => resize());
            ro.observe(controlsEl);
            ro.observe(flockEl);
        }
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('keydown', onKey);
        window.addEventListener('pagehide', writeStore);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') writeStore();
        });

        if (reduceMotion.addEventListener) {
            reduceMotion.addEventListener('change', () => {
                baseSpin = reduceMotion.matches ? 0.008 : 0.055;
                spinTarget = baseSpin;
            });
        }

        requestAnimationFrame(frame);
    }

    init();
})();
