import Point from "../lib/Point.js";
import Rect from "../lib/Rect.js";

export default class Playfield {
    #e_playfield;
    #e_viewport;
    #e_entities;

    constructor(id, gameSize) {
        this.gameSize = gameSize;
        this.rect = new Rect(new Point(0, 0), gameSize);
        this.eventBinds = [];

        this.#e_playfield = document.getElementById(id);
        this.#e_viewport = document.querySelector(`#${id} .viewport`);
        this.#e_viewport.style.width = `${gameSize.x}px`;
        this.#e_viewport.style.height = `${gameSize.y}px`;
        addEventListener("resize", () => this.#rescale());
        this.#rescale();

        this.#e_entities = document.querySelector(`#${id} .entities`);
    }

    bindEvent(event, callback) {
        switch (event) {
            case "pointermove":
            case "pointerdown":
                this.eventBinds.push(
                    addEventListener(event, (ev) =>
                        callback(
                            this.#clientToGamePos(
                                new Point(ev.clientX, ev.clientY)
                            )
                        )
                    )
                );
                break;
            default:
                this.eventBinds.push(addEventListener(event, callback));
        }
    }

    reset() {
        this.eventBinds.forEach((ev) => removeEventListener(document, ev));
        this.#e_entities.innerHTML = "";
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
        this.size = size ?? new Point(0, 0);
        this.position = position ?? new Point(0, 0);
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
        // center position
        const pos = this.position.sub(this.size.div(new Point(2)));
        this.element.style.left = `${pos.x}px`;
        this.element.style.top = `${pos.y}px`;
    }
    get position() {
        return this.#position;
    }

    set size(newsize) {
        this.#size = newsize;
        this.element.style.width = `${this.size.x}px`;
        this.element.style.height = `${this.size.y}px`;
    }
    get size() {
        return this.#size;
    }

    get rect() {
        return Rect.centered(this.position, this.size);
    }
}
