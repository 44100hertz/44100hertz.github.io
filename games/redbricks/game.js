import Point from "../lib/Point.js";
import Rect from "../lib/Rect.js";
import Playfield from "./Playfield.js";
import * as sound from "./sound.js";
import { getObjects } from "./levels.js";
import { getScoreMessage, getDeathMessage, getEndMessage } from "./commentary.js";

addEventListener("load", load);

function load() {
    const queryURL = new URLSearchParams(window.location.search);

    const gameSize = new Point(240, 240);
    const playfield = new Playfield("playfield", gameSize);
    let deathCount = 0;
    let overrideLevel = Number(queryURL.get("level"));
    let level = overrideLevel || 1;

    let startTime;
    function introduceLevel() {
        startTime = new Date();
        playfield.showMessage(`LEVEL ${level}`);
        setTimeout(start, overrideLevel ? 500 : 2000);
    }

    function start() {
        playfield.showMessage('');
        const game = new Game(playfield, gameSize, level, (status, game) => {
            switch(status) {
                case "win":
                    const timeMs = (new Date()).valueOf() - startTime;
                    const time = Math.floor(timeMs / 1000);
                    playfield.showMessage(getScoreMessage(time, game.maxBrickStreak));
                    ++level;
                    setTimeout(introduceLevel, 2000);
                    break;
                case "die":
                    ++deathCount;
                    playfield.showMessage(getDeathMessage(deathCount));
                    setTimeout(start, 1000);
                    break;
                case "outOfLevels":
                    playfield.showMessage(getEndMessage());
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
        this.paddleOffset = 4;
        this.paddleSize = new Point(33, 8);

        // Other settings, probably don't touch
        this.gravity = 100;
        this.maxBallSpeed = 300;
        this.launchSpeed = 209;
        this.paddleFriction = 0.5; // Movement affecting bounce
        this.paddleSurface = 10; // Rate of paddle side shifting ball angle

        this.entities = [];

        this.killBlockSpeed = 150;
        this.blackHolePower = 5;
        this.whiteHolePower = -3;

        this.paddleVelX = 0;
        this.brickStreak = 0;
        this.maxBrickStreak = 0;

        // Paddle
        this.paddle = this.playfield.addEntity({
            size: this.paddleSize,
            position: new Point(
                this.gameSize.x / 2,
                this.gameSize.y - this.paddleSize.y/2 - this.paddleOffset)
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
        // @ts-ignore
        objects.forEach(this.addEntity.bind(this));

        this.update();
        this.playfield.bindPointer(
            () => {},
            this.pointermove.bind(this),
            this.tryLaunch.bind(this),
            () => this.paddle.position,
        );
    }

    update(newtime) {
        const dt = this.ballSpeed * Math.min(1/60, (newtime - this.lastTime) / 1000 || 1/240);
        this.lastTime = newtime;

        // Ball movement and collision
        if (this.ballStuck) {
            this.ball.position = this.paddle.position.add(new Point(0, -10));
        } else {
            this.entities.forEach((entity) => {
                switch (entity.kind) {
                    case "blackHole":
                        const distance = entity.position.x - this.ball.x;
                        const scale = dt * Math.exp(-dt);
                        const power =
                            entity.variant == "reverse"
                                ? this.whiteHolePower
                                : this.blackHolePower;
                        this.ball.velocity.x += distance * scale * power;
                        break;
                    case "killBlock":
                        const inBounds = entity.rect.overlaps(this.playfield.rect);
                        if (!inBounds) {
                            this.playfield.removeEntity(entity);
                            entity.toBeDeleted = true;
                        }
                        if (entity.rect.overlaps(this.paddle.rect)) {
                            this.stopStatus = "die";
                        }
                        entity.position = entity.position.sub(
                            entity.velocity.mul(new Point(dt))
                        );
                        break;
                }
            });
            this.entities = this.entities.filter((entity) => !entity.toBeDeleted);

            const nextBallPos = () => {
                return this.ball.position.add(
                    this.ball.velocity.mul(new Point(dt))
                );
            };

            this.ball.velocity.y += this.gravity * dt;
            const testY = new Point(this.ball.x, nextBallPos().y);
            let collisionY = this.getBallCollision(testY);
            if (collisionY.kind == "portalX") {
                collisionY = {};
            } else if (collisionY.kind == "portalY") {
                this.ball.position.y = this.gameSize.y - this.ball.position.y;
            } else if (collisionY.kind) {
                this.ball.velocity.y *= -1;
                this.ball.velocity.y += this.gravity * dt;
            }
            if (collisionY.kind == "paddle") {
                this.ball.velocity.x += this.paddleVelX * this.paddleFriction;
                this.ball.velocity.x +=
                    this.paddleSurface * (this.ball.x < this.paddle.x ? -1 : 1);
            }

            const testX = new Point(nextBallPos().x, this.ball.y);
            let collisionX = this.getBallCollision(testX);
            if (collisionX.kind == "paddle" || collisionX.kind == "portalY") {
                collisionX = {};
            } else if (collisionX.kind == "portalX") {
                this.ball.position.x = this.gameSize.x - this.ball.position.x;
            } else if (collisionX.kind) {
                this.ball.velocity.x *= -1;
            }

            if(collisionX.kind === "brick" && collisionX.entity === collisionY.entity) {
                collisionY = {};
            }
            [collisionX, collisionY].forEach(({ kind: collisionKind, entity }) => {
                // sound logic
                switch(collisionKind) {
                    case "viewport":
                        sound.play("wallbump", 2);
                        break;
                    case "portalX":
                    case "portalY":
                        sound.play("portal", 0);
                        break;
                    case "paddle":
                        this.brickStreak = 0;
                        sound.play("paddlebump", 2);
                        break;
                    case "brick":
                        sound.play("paddlebump", 4);
                        if(entity.variant !== "solid") {
                            if (entity.variant == "killer") {
                                sound.play("deathblock");
                            }
                            const div = entity.remainingDivisions !== undefined;
                            const octave = div ? 1-Math.floor(Math.log2(entity.size.x/25)) : 0;
                            sound.play("brickbump", this.brickStreak + octave*12);
                            ++this.brickStreak;
                            this.maxBrickStreak = Math.max(this.brickStreak, this.maxBrickStreak);
                        }
                        break;
                }

                if (collisionKind == "bottom") {
                    this.stopStatus = "die";
                }
                if (collisionKind == "brick" && entity.variant != "solid") {
                    if(entity.variant == "killer") {
                        const killBlock = this.playfield.addEntity({
                            position: entity.position,
                            size: new Point(12, 12),
                            velocity: entity.position
                                .sub(this.paddle.position)
                                .normalize()
                                .mul(new Point(this.killBlockSpeed)),
                            kind: "killBlock",
                        });
                        killBlock.element.classList.add('killBlock');
                        this.entities.push(killBlock);
                    } else if (entity.remainingDivisions) {
                        const field = entity.size.x > entity.size.y ? 'x' : 'y';
                        const size = entity.size.clone();
                        size[field] = size[field] / 2 - 1.5;
                        for (let i=0; i<2; ++i) {
                            const position = entity.position.clone();
                            position[field] += (i-0.5) * (entity.size[field] / 2 + 1.5);
                            this.addEntity({
                                position,
                                size,
                                kind: "brick",
                                variant: "dividing",
                                remainingDivisions: entity.remainingDivisions - 1,
                            });
                        }
                    }
                    entity.element.classList.add("remnant");
                    setTimeout(() => this.playfield.removeEntity(entity), 1000);
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
            this.ball.velocity = this.ball.velocity.clamp(
                new Point(-this.maxBallSpeed),
                new Point(this.maxBallSpeed)
            );
        }

        this.paddleVelX = (this.paddleTarget - this.paddle.x) / dt;
        this.paddle.x = this.paddleTarget;

        if (this.stopStatus) {
            if (this.stopStatus == "die") {
                sound.play("miss", -3);
            }
            this.playfield.reset();
            this.stopCallback(this.stopStatus, this);
        } else {
            requestAnimationFrame(this.update.bind(this));
        }
    }

    getBallCollision(pos) {
        const ballRect = Rect.centered(pos, this.ball.size);
        const paddleRect = new Rect(this.paddle.rect.origin, new Point(this.paddle.size.x, 1));
        if (
            this.enablePortalsY &&
            (ballRect.origin.y < 0 || ballRect.end.y > this.gameSize.y)
        ) {
            return { kind: "portalY" };
        } else if (ballRect.end.y > this.gameSize.y) {
            return { kind: "bottom" };
        } else if (ballRect.origin.x < 0 || ballRect.end.x > this.gameSize.x) {
            if (this.enablePortalsX) {
                return { kind: "portalX" };
            }
            return { kind: "viewport" };
        } else if (this.ball.velocity.y > 0 && ballRect.overlaps(paddleRect)) {
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

    addEntity({position, size, kind, variant, ...props}) {
        const entity = this.playfield.addEntity({
            position,
            size,
            kind,
            variant,
            ...props,
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
                this.entities.push(entity);
                break;
            case "portal":
                if (variant == "left") this.enablePortalsX = true;
                if (variant == "top") this.enablePortalsY = true;
                break;
        }
        return entity;
    }

    tryLaunch() {
        if (this.ballStuck) {
            sound.play("launch", -6);
            this.ballStuck = false;
            const jitter = this.paddle.x < this.gameSize.x/2 ? 10 : -10;
            this.ball.velocity = new Point(
                this.paddleVelX + jitter,
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
