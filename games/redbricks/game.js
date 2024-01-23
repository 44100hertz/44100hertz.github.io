import Point from "../lib/Point.js";
import Rect from "../lib/Rect.js";
import Playfield from "./Playfield.js";
import * as sound from "./sound.js";
import { getObjects } from "./levels.js";
import { tips } from "./tips.js";

addEventListener("load", load);

function load() {
    const gameSize = new Point(240, 240);
    const playfield = new Playfield("playfield", gameSize);
    let deathCount = 0;
    let level = 1;

    let startTime;
    function introduceLevel() {
        startTime = new Date();
        playfield.showMessage(`LEVEL ${level}`);
        setTimeout(start, 1000);
    }

    addEventListener("keydown", (key) => {
        if (key.code === 'Digit7') {
            playfield.reset();
            ++level;
            start();
        }
    });

    function start() {
        playfield.showMessage('');
        const game = new Game(playfield, gameSize, level, (status) => {
            switch(status) {
                case "win":
                    ++level;
                    const time = (new Date()).valueOf() - startTime;
                    const minutes = Math.floor(time / 1000 / 60);
                    const seconds = String(Math.floor((time / 1000) % 60))
                          .padStart(2,'0');
                    playfield.showMessage(`
Good job!
Level time: ${minutes}:${seconds}`);
                    setTimeout(introduceLevel, 1000);
                    break;
                case "die":
                    playfield.showMessage(`
${tips[deathCount % tips.length]}
deaths: ${deathCount+1}
                    `);
                    ++deathCount;
                    setTimeout(start, 1000);
                    break;
                case "outOfLevels":
                    playfield.showMessage(`
You won...kind of. This game is WIP!
If you'd like, email ${"ssaammpzz@gmail.com".replace("zz", "")} with level ideas.
Thanks for playing.`);
            }
        });
    }
    introduceLevel();
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

        // Other settings, probably don't touch
        this.gravity = 100;
        this.maxBallSpeed = 300;
        this.launchSpeed = 205;
        this.paddleFriction = 0.5; // Movement affecting bounce
        this.paddleSurface = 10; // Rate of paddle side shifting ball angle

        this.paddleVelX = 0;

        this.killBlockSpeed = 80;
        this.killBlocks = [];

        this.blackHoles = [];
        this.blackHolePower = 5;

        // Paddle
        this.paddle = this.playfield.addEntity({
            size: new Point(32, 8),
            position: this.gameSize.sub(new Point(this.gameSize.x / 2, 16)),
        });
        this.paddle.element.classList.add("paddle");
        this.paddleTarget = this.paddle.x;

        // Ball
        this.ball = this.playfield.addEntity({
            size: new Point(8, 8),
            position: this.gameSize.sub(new Point(0, this.paddle.y - 2)),
            velocity: new Point(0, 0),
        });
        this.ball.element.classList.add("ball");
        this.ballStuck = true;

        // Bricks
        this.bricks = [];

        const objects = getObjects(level, playfield.rect);
        if (!objects) {
            stopCallback('outOfLevels');
            return;
        }
        for (const { position, size, kind, variant } of objects) {
            const entity = this.playfield.addEntity({
                position,
                size,
                kind,
                variant,
            });
            entity.element.classList.add(kind);
            if (variant) {
                entity.element.classList.add(variant);
            }
            switch (kind) {
                case "brick":
                    this.bricks.push(entity);
                    break;
                case "blackHole":
                    this.blackHoles.push(entity);
                    break;
            }
        }

        this.update();
        this.playfield.bindPointer(
            this.tryLaunch.bind(this),
            this.pointermove.bind(this),
            () => this.paddle.position,
        );
    }

    update(newtime) {
        const dt = Math.min(1/60, (newtime - this.lastTime) / 1000 || 1/240);
        this.lastTime = newtime;

        // Ball movement and collision
        if (this.ballStuck) {
            this.ball.position = this.paddle.position.add(new Point(0, -10));
        } else {
            this.blackHoles.forEach((hole) => {
                const distance = hole.position.x - this.ball.x;
                const scale = dt * this.blackHolePower * Math.exp(-dt);
                this.ball.velocity.x += distance * scale;
            });

            const nextBallPos = () => {
                return this.ball.position.add(
                    this.ball.velocity.mul(new Point(dt * this.ballSpeed))
                );
            };

            const testY = new Point(this.ball.x, nextBallPos().y);
            let collisionY = this.getBallCollision(testY);
            if (collisionY.kind) {
                this.ball.velocity.y *= -1;
            } else {
                this.ball.velocity.y += this.gravity * dt * this.ballSpeed;
            }

            const testX = new Point(nextBallPos().x, this.ball.y);
            const collisionX = this.getBallCollision(testX);
            if (collisionX.kind) this.ball.velocity.x *= -1;

            if (collisionY.kind == "paddle") {
                this.ball.velocity.x += this.paddleVelX * this.paddleFriction;
                this.ball.velocity.x +=
                    this.paddleSurface * (this.ball.x < this.paddle.x ? -1 : 1);
            }

            if(collisionX.kind === "brick" && collisionX.entity === collisionY.entity) {
                collisionY = {};
            }
            [collisionX, collisionY].forEach(({ kind, entity }) => {
                // sound logic
                switch(kind) {
                    case "viewport": sound.play("wallbump"); break;
                    case "paddle": sound.play("paddlebump"); break;
                    case "brick":
                        if(entity.variant == "solid") {
                            sound.play("wallbump");
                        } else {
                            if (entity.variant == "killer") {
                                sound.play("deathblock");
                            }
                            sound.play("brickbump");
                        }
                        break;
                }

                if (kind == "bottom") {
                    this.stopStatus = "die";
                }
                if (kind == "brick" && entity.variant != "solid") {
                    if(entity.variant == "killer") {
                        const killBlock = this.playfield.addEntity({
                            position: entity.position,
                            size: new Point(12, 12),
                        })
                        killBlock.element.classList.add('killBlock');
                        this.killBlocks.push(killBlock);
                    }
                    this.playfield.removeEntity(entity);
                    this.bricks = this.bricks.filter(
                        (brick) => brick != entity
                    );
                    const remainingBrick = this.bricks.find(
                        (brick) => brick.variant != "solid"
                    );
                    if (!remainingBrick) {
                        this.stopStatus = "win";
                    }
                }
            });

            this.ball.position = nextBallPos();
            this.ball.velocity.x = Math.min(
                this.maxBallSpeed,
                Math.max(-this.maxBallSpeed, this.ball.velocity.x)
            );
        }

        this.paddleVelX = (this.paddleTarget - this.paddle.x) / dt;
        this.paddle.x = this.paddleTarget;

        this.killBlocks.forEach((block) => {
            block.inBounds = block.rect.origin.y < this.playfield.rect.end.y;
            if (!block.inBounds) {
                this.playfield.removeEntity(block);
            }
            if (block.rect.overlaps(this.paddle.rect)) {
                this.stopStatus = "die";
            }
            block.y += this.killBlockSpeed * dt;
        })
        this.killBlocks = this.killBlocks.filter((block) => block.inBounds);

        if (this.stopStatus) {
            if (this.stopStatus == "die") {
                sound.play("miss");
            }
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
        } else if (ballRect.origin.x < 0 || ballRect.end.x > this.gameSize.x) {
            return { kind: "viewport" };
        } else if (
            ballRect.overlaps(this.paddle.rect) &&
            this.ball.rect.end.y <= this.paddle.rect.origin.y+1
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

    tryLaunch() {
        if (this.ballStuck) {
            sound.play("launch");
            this.ballStuck = false;
            const jitter = Math.random() < 0.5 ? -10 : 10;
            this.ball.velocity = new Point(
                this.paddleVelX / this.ballSpeed + jitter,
                -this.launchSpeed
            );
        }
    }

    pointermove(mousePos) {
        const pwidth = this.paddle.size.x;
        this.paddleTarget = Math.max(
            pwidth / 2,
            Math.min(mousePos.x, this.gameSize.x - pwidth / 2)
        );
    }
}
