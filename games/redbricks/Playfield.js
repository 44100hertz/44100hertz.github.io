import Point from '../lib/Point.js';

export default class Playfield {
    constructor(id, gameSize) {
        this.gameSize = gameSize;
        this.e_playfield = document.getElementById(id);
        this.e_viewport = document.createElement('div');
        this.e_playfield.appendChild(this.e_viewport);

        this.e_viewport.style.width = `${gameSize.x}px`;
        this.e_viewport.style.height = `${gameSize.y}px`;
        this.e_viewport.classList.add('viewport');
        this.entities = [];
        this.rescale();
    }

    rescale() {
        const { size } = this.clientRect();
        const scale = size.div(this.gameSize)
        this.e_viewport.style.transform = `scale(${scale.x * 100}%,${scale.y * 100}%)`;
    }

    draw() {
    }

    bindEvent(event, callback) {
        switch (event) {
            case 'mousemove':
                addEventListener(event, (ev) => {
                    callback(this.clientToGamePos(new Point(ev.clientX, ev.clientY)));
                });
                break;
            default:
                addEventListener(event, callback);
        }
    }

    clientRect() {
        const {top, right, bottom, left} = this.e_playfield.getBoundingClientRect();
        return {
            origin: new Point(left, top),
            size: new Point(right - left, bottom - top),
        };
    }

    clientToGamePos(clientPos) {
        const { origin, size } = this.clientRect();
        return clientPos.sub(origin).div(size).mul(this.gameSize); 
    }

    addEntity(props) {
        const entity = new Entity(this, props);
        this.entities.push(entity);
        this.e_viewport.appendChild(entity.element);
        return entity;
    }
}

export class Entity {
    constructor(playfield, {position, size}) {
        this.playfield = playfield;
        this.element = document.createElement('div');
        this.element.classList.add('game-entity');
        this.size = size ?? new Point(0,0);
        this.position = position ?? new Point(0,0);
    }

    set x(x) { this.position = new Point(x, this.position.y); }
    get x() { return this.position.x }
    set y(y) { this.position = new Point(this.position.x, y); }
    get y() { return this.position.y }

    set position(newpos) {
        this._position = newpos;
        // center position
        const pos = this.position.sub(this.size.div(new Point(2)));
        this.element.style.left = `${pos.x}px`;
        this.element.style.top = `${pos.y}px`;
    }
    get position() { return this._position; }

    set size(newsize) {
        this._size = newsize;
        this.element.style.width = `${this.size.x}px`;
        this.element.style.height = `${this.size.y}px`;
    }
    get size() { return this._size; }
}


