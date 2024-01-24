import Point from "../lib/Point.js";
import Rect from "../lib/Rect.js";

function queryOrFail(query) {
    const maybeElem = document.querySelector(query);
    if (!maybeElem) {
        throw new Error(`Expected element ${query}, got NOTHING.`);
    }
    return maybeElem;
}

export default class Playfield {
    #e_playfield;
    #e_viewport;
    #e_entities;
    #e_status;
    #eventListeners;

    constructor(id, gameSize) {
        this.gameSize = gameSize;
        this.rect = new Rect(new Point(0, 0), gameSize);
        this.eventBinds = [];

        this.#e_playfield = queryOrFail("#" + id);
        this.#e_viewport = queryOrFail(`#${id} .viewport`);
        this.#e_viewport.style.width = `${gameSize.x}px`;
        this.#e_viewport.style.height = `${gameSize.y}px`;
        addEventListener("resize", () => this.#rescale());
        this.#rescale();

        this.#e_entities = queryOrFail(`#${id} .entities`);
        this.#e_status = queryOrFail(`#${id} .statusMessage div`);
        this.#eventListeners = {};
    }

    showMessage(text) {
        this.#e_status.textContent = text;
    }

    bindEvent(ev, callback) {
        addEventListener(ev, callback);
        this.#eventListeners[ev] = callback;
    }

    bindPointer(c_pointerdown, c_pointermove, c_pointerup, getPaddlePos) {
        this.getPaddlePos = getPaddlePos;

        const wrapMouse = (fn) => (ev) =>
            fn(this.#clientToGamePos(new Point(ev.clientX, ev.clientY)));

        const wrapTouch = (fn) => (ev) => {
            const { clientX, clientY } = ev.touches[0];
            ev.preventDefault(); // disable mouse events
            return fn(this.#clientToGamePos(new Point(clientX, clientY)));
        };

        this.bindEvent("mousedown", wrapMouse(c_pointerdown));
        this.bindEvent("mousemove", wrapMouse(c_pointermove));
        this.bindEvent("mouseup", wrapMouse(c_pointerup));

        // specialized touch handlers for paddle movement
        this.bindEvent(
            "touchstart",
            wrapTouch((point) => {
                this.lastTouch = point;
                this.lastTouchTime = (new Date()).valueOf();
                c_pointerdown(point);
            })
        );
        this.bindEvent(
            "touchmove",
            wrapTouch((touch) => {
                const time = (new Date()).valueOf();
                // Failsafe condition for holding finger before game begins
                if (this.lastTouchTime) {
                    const moveStep = touch.x - this.lastTouch.x;
                    const timeStep = time - this.lastTouchTime;
                    const speed = Math.abs(moveStep / timeStep);
                    const scaling = Math.sqrt(1 + speed);
                    const movement = (moveStep * scaling);
                    c_pointermove(new Point(this.getPaddlePos().x + movement, 0));
                }
                this.lastTouchTime = time;
                this.lastTouch = touch;
            })
        );
        this.bindEvent("touchend", c_pointerup);
    }

    reset() {
        this.lastTouch = undefined;
        this.lastTouchTime = undefined;
        this.#e_entities.textContent = '';
        for (const [type, listener] of Object.entries(this.#eventListeners)) {
            removeEventListener(type, listener);
        }
    }

    addEntity(props) {
        const entity = new Entity(props);
        this.#e_entities.appendChild(entity.element);
        return entity;
    }

    removeEntity(entity) {
        entity.element.remove();
    }

    #clientRect() {
        const { top, right, bottom, left } =
            this.#e_playfield.getBoundingClientRect();
        return {
            origin: new Point(left, top),
            size: new Point(right - left, bottom - top),
        };
    }

    #clientToGamePos(clientPos) {
        const { origin, size } = this.#clientRect();
        return clientPos.sub(origin).div(size).mul(this.gameSize);
    }

    #rescale() {
        const { size } = this.#clientRect();
        const scale = size.div(this.gameSize);
        this.#e_viewport.style.transform = `scale(${scale.x * 100}%,${
            scale.y * 100
        }%)`;
    }
}

class Entity {
    #size;
    #position;

    constructor({ position, size, ...props }) {
        Object.assign(this, props);
        this.element = document.createElement("div");
        this.element.classList.add("game-entity");
        this.#position = position ?? new Point(0, 0);
        this.#size = size ?? new Point(0, 0);
        this.placeInDocument();
    }

    placeInDocument() {
        const offset = this.size
            ? this.size.div(new Point(2))
            : new Point(0, 0);
        const pos = this.position.sub(offset);
        this.element.style.left = `${pos.x}px`;
        this.element.style.top = `${pos.y}px`;
        this.element.style.width = `${this.size.x}px`;
        this.element.style.height = `${this.size.y}px`;
    }

    set x(x) {
        this.position.x = x;
        this.position = this.position;
    }
    get x() {
        return this.position.x;
    }
    set y(y) {
        this.position.y = y;
        this.position = this.position;
    }
    get y() {
        return this.position.y;
    }

    set position(newpos) {
        this.#position = newpos;
        this.placeInDocument();
    }
    get position() {
        return this.#position;
    }

    set size(newsize) {
        this.#size = newsize;
        this.placeInDocument();
    }
    get size() {
        return this.#size;
    }

    get rect() {
        return Rect.centered(this.position, this.size);
    }
}
