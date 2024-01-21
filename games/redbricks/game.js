import Point from "../lib/Point.js";
import Rect from "../lib/Rect.js";
import Playfield from "./Playfield.js";
import { brickPattern } from "./brickpattern.js";

addEventListener("load", load);

function load() {
    const gameSize = new Point(240, 240);
    const playfield = new Playfield("playfield", gameSize);
    let level = 1;
    function start() {
        const game = new Game(playfield, gameSize, level, (status) => {
            if (status == "win") ++level;
            setTimeout(start, 1000);
        });
    }
    start();
}

class Game {
    constructor(playfield, gameSize, level, stopCallback) {
        this.playfield = playfield;
        this.gameSize = gameSize;
        this.stopCallback = stopCallback;
        this.scoreboard = document.getElementById("scoreboard");

        console.log(`Loading level ${level}...`);

        // Difficulty values
        this.level = level;
        this.ballSpeed = 1.5;

        // Other settings
        this.gravity = 100;
        this.maxBallSpeed = 300;
        const brickHeight = 12;
        const brickOffset = 10;
        const brickGap = new Point(3, 3);

        // Paddle
        this.paddle = this.playfield.addEntity({
            size: new Point(32, 8),
            position: this.gameSize.sub(new Point(this.gameSize.x / 2, 16)),
        });
        this.paddle.element.classList.add("paddle");

        // Ball
        this.ball = this.playfield.addEntity({
            size: new Point(8, 8),
            position: this.gameSize.sub(
                new Point(0, this.paddle.position.y - 2)
            ),
            velocity: new Point(0, 0),
        });
        this.ball.element.classList.add("ball");
        this.ballStuck = true;

        // Bricks
        const { numBricks, getBrickKind } = brickPattern(level);
        const brickSpacing = new Point(
            (this.gameSize.x - brickGap.x * 2) / numBricks.x,
            brickHeight + brickGap.y
        );
        const brickSize = new Point(
            brickSpacing.x - brickGap.x,
            brickHeight
        );
        this.bricks = [];

        for (let iy = 0; iy < numBricks.y; ++iy) {
            for (let ix = 0; ix < numBricks.x; ++ix) {
                const kind = getBrickKind(ix, iy);
                if (kind == "empty") {
                    continue;
                }
                const brick = this.playfield.addEntity({
                    size: brickSize,
                    position: brickSpacing
                        .mul(new Point(ix, iy))
                        .add(brickGap)
                        .add(new Point(0, brickOffset))
                        .add(brickSpacing.div(new Point(2, 2))),
                    kind,
                });
                switch (brick.kind) {
                    case "normal":
                        break;
                    case "solid":
                        brick.element.classList.add("solid");
                        break;
                }
                this.bricks.push(brick);
                brick.element.classList.add("brick");
            }
        }

        this.update();
        this.playfield.bindEvent("mousemove", this.mousemove.bind(this));
        this.playfield.bindEvent("keydown", this.keydown.bind(this));
    }

    update(newtime) {
        const dt = (newtime - this.lastTime) / 1000 || 1 / 240;
        this.lastTime = newtime;

        // Ball movement and collision
        if (this.ballStuck) {
            this.ball.position = this.paddle.position.add(new Point(0, -10));
        } else {
            this.ball.velocity.x = Math.min(
                this.maxBallSpeed,
                Math.max(-this.maxBallSpeed, this.ball.velocity.x)
            );
            this.ball.velocity.y += this.gravity * dt * this.ballSpeed;

            const nextBallPos = () => {
                return this.ball.position.add(
                    this.ball.velocity.mul(new Point(dt * this.ballSpeed))
                );
            };

            const testY = new Point(this.ball.position.x, nextBallPos().y);
            const collisionY = this.getBallCollision(testY);
            if (collisionY.kind) this.ball.velocity.y *= -1;

            const testX = new Point(nextBallPos().x, this.ball.position.y);
            const collisionX = this.getBallCollision(testX);
            if (collisionX.kind) this.ball.velocity.x *= -1;

            if (collisionY.kind == "paddle") {
                this.ball.velocity.x += this.paddleSpeedX / 2;
                this.ball.velocity.x +=
                    this.ball.position.x < this.paddle.position.x ? -10 : 10;
            }

            [collisionX, collisionY].forEach(({ kind, entity }) => {
                if (kind == "bottom") {
                    this.stopStatus = "die";
                }
                if (kind == "brick" && entity.kind != "solid") {
                    this.playfield.removeEntity(entity);
                    this.bricks = this.bricks.filter(
                        (brick) => brick != entity
                    );
                    const remainingBrick = this.bricks.find(
                        (brick) => brick.kind != "solid"
                    );
                    if (!remainingBrick) {
                        this.stopStatus = "win";
                    }
                }
            });

            this.ball.position = nextBallPos();
        }

        this.paddleSpeedX = (this.paddle.x - this.lastPaddleX) / dt || 0;
        this.lastPaddleX = this.paddle.x;

        if (this.stopStatus) {
            this.playfield.reset();
            this.stopCallback(this.stopStatus);
        } else {
            requestAnimationFrame(this.update.bind(this));
        }
    }

    getBallCollision(pos) {
        const ballRect = Rect.centered(pos, this.ball.size);
        if (ballRect.origin.y > this.gameSize.y) {
            return { kind: "bottom" };
        } else if (
            ballRect.origin.x < 0 ||
            ballRect.end.x > this.gameSize.x
        ) {
            return { kind: "viewport" };
        } else if (
            ballRect.overlaps(this.paddle.rect) &&
            ballRect.end.y < this.paddle.position.y
        ) {
            return { kind: "paddle" };
        } else {
            for (const brick of this.bricks) {
                if (ballRect.overlaps(brick.rect)) {
                    return { kind: "brick", entity: brick };
                }
            }
        }
        return {};
    }

    keydown() {
        if (this.ballStuck) {
            this.ballStuck = false;
            const jitter = Math.random() < 0.5 ? -10 : 10;
            this.ball.velocity = new Point(
                this.paddleSpeedX / this.ballSpeed + jitter,
                -200
            );
        }
    }

    mousemove(mousePos) {
        const pwidth = this.paddle.size.x;
        this.paddle.x = Math.max(
            pwidth / 2,
            Math.min(mousePos.x, this.gameSize.x - pwidth / 2)
        );
    }
}
