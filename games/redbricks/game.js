import Point from '../lib/Point.js';
import Rect from '../lib/Rect.js';
import Playfield from './Playfield.js';
import { brickPattern } from './brickpattern.js';

addEventListener('load', load);

function load() {
    const gameSize = new Point(240,240);
    const playfield = new Playfield('playfield', gameSize);
    let level = 1;
    function start() {
        const game = new Game(playfield, gameSize, level,
            (status) => {
                if (status == 'win') ++level;
                setTimeout(start, 1000)
            });
    }
    start();
}

class Game {
    constructor(playfield, gameSize, level, stopCallback) {
        this.playfield = playfield;
        this.gameSize = gameSize;
        this.stopCallback = stopCallback;
        this.scoreboard = document.getElementById('scoreboard');

        console.log(`Loading level ${level}...`);

        // Difficulty values
        this.level = level;
        this.ball_speed = 1.5;

        // Other settings
        this.gravity = 100;
        this.max_ball_speed = 300;
        const brick_height = 12;
        const brick_offset = 10;
        const brick_gap = new Point(3,3);

        // Paddle
        this.paddle = this.playfield.addEntity({
            size: new Point(32, 8),
            position: this.gameSize.sub(new Point(this.gameSize.x / 2, 16)),
        });
        this.paddle.element.classList.add('paddle');

        // Ball
        this.ball = this.playfield.addEntity({
            size: new Point(8, 8),
            position: this.gameSize.sub(new Point(0, this.paddle.position.y - 2)),
            velocity: new Point(0,0),
        })
        this.ball.element.classList.add('ball');
        this.ball_stuck = true;

        // Bricks
        const { numBricks, getBrickKind } = brickPattern(level);
        const brick_spacing = new Point(
            (this.gameSize.x - brick_gap.x*2) / numBricks.x,
            brick_height + brick_gap.y
        );
        const brick_size = new Point(brick_spacing.x - brick_gap.x,
            brick_height
        );
        this.bricks = [];

        for (let iy=0; iy<numBricks.y; ++iy) {
            for(let ix=0; ix<numBricks.x; ++ix) {
                const kind = getBrickKind(ix, iy);
                if (kind == 'empty') {
                    continue;
                }
                const brick = this.playfield.addEntity({
                    size: brick_size,
                    position: brick_spacing
                        .mul(new Point(ix,iy))
                        .add(brick_gap)
                        .add(new Point(0, brick_offset))
                        .add(brick_spacing.div(new Point(2,2))),
                    kind
                })
                switch (brick.kind) {
                    case 'normal':
                        break;
                    case 'solid':
                        brick.element.classList.add('solid')
                        break;
                }
                this.bricks.push(brick);
                brick.element.classList.add('brick');
            }
        }

        this.update();
        this.playfield.bindEvent('mousemove', this.mousemove.bind(this));
        this.playfield.bindEvent('keydown', this.keydown.bind(this));
    }

    update(newtime) {
        const dt = ((newtime - this.lastTime) / 1000) || 1/240;
        this.lastTime = newtime;

        // Ball movement and collision
        if (this.ball_stuck) {
            this.ball.position = this.paddle.position.add(new Point(0, -10));
        } else {
            this.ball.velocity.x =
                Math.min(this.max_ball_speed,
                    Math.max(-this.max_ball_speed,
                        this.ball.velocity.x))
            this.ball.velocity.y += this.gravity * dt * this.ball_speed;

            const next_ball_pos = () => {
                return this.ball.position
                    .add(this.ball.velocity
                        .mul(new Point(dt * this.ball_speed)))
            }

            const test_y = new Point(this.ball.position.x, next_ball_pos().y);
            const collision_y = this.getBallCollision(test_y);
            if (collision_y.kind) this.ball.velocity.y *= -1;

            const test_x = new Point(next_ball_pos().x, this.ball.position.y);
            const collision_x = this.getBallCollision(test_x);
            if (collision_x.kind) this.ball.velocity.x *= -1;

            if (collision_y.kind == 'paddle') {
                this.ball.velocity.x += this.paddle_xvel / 2;
                this.ball.velocity.x +=
                    this.ball.position.x < this.paddle.position.x ?
                    -10 : 10
            }

            ([collision_x, collision_y]).forEach(({kind, entity}) => {
                if (kind == 'bottom') {
                    this.stopStatus = 'die';
                }
                if (kind == 'brick' && entity.kind != 'solid') {
                    this.playfield.removeEntity(entity);
                    this.bricks = this.bricks
                        .filter((brick) => brick != entity);
                    const remaining_brick = this.bricks
                        .find((brick) => brick.kind != 'solid')
                    if (!remaining_brick) {
                        this.stopStatus = 'win';
                    }
                }
            })

            this.ball.position = next_ball_pos();
        }

        this.paddle_xvel = ((this.paddle.x - this.last_paddle_x) / dt) || 0;
        this.last_paddle_x = this.paddle.x;

        if (this.stopStatus) {
            this.playfield.reset();
            this.stopCallback(this.stopStatus);
        } else {
            requestAnimationFrame(this.update.bind(this));
        }
    }

    getBallCollision(pos) {
        const ball_rect = Rect.centered(pos, this.ball.size);
        if (ball_rect.origin.y > this.gameSize.y) {
            return {kind: 'bottom'};
        } else if ( ball_rect.origin.x < 0 || ball_rect.end.x > this.gameSize.x ) {
            return {kind: 'viewport'};
        } else if ( ball_rect.overlaps(this.paddle.rect) && ball_rect.end.y < this.paddle.position.y ) {
            return {kind: 'paddle'};
        } else {
            for(const brick of this.bricks) {
                if (ball_rect.overlaps(brick.rect)) {
                    return {kind: 'brick', entity: brick};
                }
            }
        }
        return {};
    }

    keydown() {
        if (this.ball_stuck) {
            this.ball_stuck = false;
            const jitter = Math.random() < 0.5 ? -10 : 10;
            this.ball.velocity = new Point(
                (this.paddle_xvel / this.ball_speed) + jitter,
                -200
            );
        }
    }

    mousemove(mousePos) {
        const pwidth = this.paddle.size.x;
        this.paddle.x = Math.max(pwidth/2,
            Math.min(mousePos.x, this.gameSize.x - pwidth/2));
    }
}