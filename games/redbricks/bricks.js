import Point from '../lib/Point.js';
import Playfield from './Playfield.js';

addEventListener('load', load);

function load() {
    const game = new Game();
}

class Game {
    constructor(level) {
        this.level = level;
        this.gameSize = new Point(240,240);
        this.playfield = new Playfield('playfield', this.gameSize);

        this.paddle = this.playfield.addEntity({
            size: new Point(32, 8),
            position: this.gameSize.sub(new Point(this.gameSize.x / 2, 16)),
        });

        this.ball = this.playfield.addEntity({
            size: new Point(8, 8),
            position: this.gameSize.sub(new Point(0, this.paddle.position.y - 2)),
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
                const brick = this.playfield.addEntity({
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

        this.playfield.bindEvent('mousemove', (pos) => this.mousemove(pos));
    }

    update(dt) {
        if (this.ball_stuck) {
            this.ball.position = this.paddle.position.add(new Point(0, -10));
        }
    }

    draw() {
        this.playfield.draw();
    }

    keydown() {
    }

    mousemove(mousePos) {
        {
            const pwidth = this.paddle.size.x;
            this.paddle.x = Math.max(pwidth/2,
                Math.min(mousePos.x, this.gameSize.x - pwidth/2));
        }
    }
}
