import Point from '../lib/Point.js';

export default class Playfield {
    constructor(id, gameSize) {
        this.e_playfield = document.getElementById(id);
        this.gameSize = gameSize;
        this.entities = [];
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

    gameToClientPos(gamePos) {
        const { origin, size } = this.clientRect();
        return gamePos.div(this.gameSize).mul(size).add(origin);
    }

    gameScale() {
        return this.clientRect().size.x / this.gameSize.x;
    }

    gameToClientSize(gameSize) {
        const { size } = this.clientRect();
        return gameSize.div(this.gameSize).mul(size);
    }

    addEntity(props) {
        const entity = new Entity(this, props);
        this.entities.push(entity);
        this.e_playfield.appendChild(entity.element);
        return entity;
    }
}

export class Entity {
    constructor(playfield, {position, size, classList, ...props}) {
        this.playfield = playfield;
        this.element = document.createElement('div');
        this.element.classList.add('game-entity');
        if(classList) {
            classList.forEach((c) => this.element.classList.add(c));
        }
        this.size = size ?? new Point(0,0);
        this.position = position ?? new Point(0,0);

        if (props.round) {
            this.element.style['border-radius'] = `${playfield.gameScale() * props.round}px`;
        }
    }

    set x(x) { this.position = new Point(x, this.position.y); }
    get x() { return this.position.x }
    set y(y) { this.position = new Point(this.position.x, y); }
    get y() { return this.position.y }

    set position(newpos) {
        this._position = newpos;
        const elemPos = this.playfield.gameToClientPos(this._position);
        const elemSize = this.playfield.gameToClientSize(this._size);
        this.element.style.left = `${elemPos.x - elemSize.x/2}px`;
        this.element.style.top = `${elemPos.y - elemSize.y/2}px`;
    }
    get position() { return this._position; }

    set size(newsize) {
        this._size = newsize;
        const elemSize = this.playfield.gameToClientSize(this._size);
        this.element.style.width = `${elemSize.x}px`;
        this.element.style.height = `${elemSize.y}px`;
    }
    get size() { return this._size; }
}


