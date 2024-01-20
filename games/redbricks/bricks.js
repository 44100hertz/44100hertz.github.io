import Point from '../lib/Point.js';

addEventListener('load', load);

function load() {
    const game = new Game();
}

class Game {
    constructor(level) {
        this.level = level;

        this.e_playfield = document.getElementById('playfield'),
        this.gameSize = new Point(240, 240);
        this.entities = [];

        this.paddle = this.addEntity({
            size: new Point(32, 8),
            position: this.gameSize.sub(new Point(this.gameSize.x / 2, 16)),
            round: 8,
        });

        this.ball = this.addEntity({
            size: new Point(8, 8),
            position: this.gameSize.sub(new Point(0, this.paddle.position.y - 2)),
            round: 8,
        })
        this.ball_stuck = true;

        const num_bricks = new Point(8, 4);
        const brick_height = 10;
        const brick_gap = new Point(4,4);

        const brick_spacing = new Point(
            (this.gameSize.x - brick_gap.x*2) / num_bricks.x,
            brick_height + brick_gap.y
        );
        const brick_size = new Point(brick_spacing.x - brick_gap.x,
            brick_height
        );

        for(let ix=0; ix<num_bricks.x; ++ix) {
            for (let iy=0; iy<num_bricks.y; ++iy) {
                const brick = this.addEntity({
                    size: brick_size,
                    position: brick_spacing
                        .mul(new Point(ix,iy))
                        .add(brick_gap)
                        .add(brick_spacing.div(new Point(2,2))),
                })
                brick.element.classList.add('brick');
            }
        }

        const update = (time) => {
            this.update(time);
            this.draw();
            requestAnimationFrame(update);
        }

        update();

        addEventListener('keydown', this.keydown);
        addEventListener('mousemove', (ev) => {
            this.mousemove(this.clientToGamePos(new Point(ev.clientX, ev.clientY)));
        });
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

    update(time) {
        if (this.ball_stuck) {
            this.ball.position = this.paddle.position.add(new Point(0, -10));
        }
    }

    addEntity(props) {
        const element = document.createElement('div');
        element.classList.add('game-entity');
        this.e_playfield.appendChild(element);
        const entity = {
            element,
            position: new Point(0,0),
            size: new Point(0,0),
            ...props,
        }
        if (props.round) {
            entity.element.style['border-radius'] = `${this.gameScale() * props.round}px`;
        }
        this.entities.push(entity);
        return entity;
    }

    draw() {
        this.entities.forEach(({element, position, size}) => {
            const elemPos = this.gameToClientPos(position);
            const elemSize = this.gameToClientSize(size);
            element.style.left = `${elemPos.x - elemSize.x/2}px`;
            element.style.top = `${elemPos.y - elemSize.y/2}px`;
            element.style.width = `${elemSize.x}px`;
            element.style.height = `${elemSize.y}px`;
        })
    }

    keydown() {
    }

    mousemove(mousePos) {
        {
            const pwidth = this.paddle.size.x;
            this.paddle.position.x = Math.max(pwidth/2,
                Math.min(mousePos.x, this.gameSize.x - pwidth/2));
        }
    }
}
