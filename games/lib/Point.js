export default class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y ?? x;
    }

    clone() {
        return new Point(this.x, this.y);
    }

    swap() {
        return new Point(this.y, this.x);
    }

    add({ x, y }) {
        return new Point(this.x + x, this.y + y);
    }

    sub({ x, y }) {
        return new Point(this.x - x, this.y - y);
    }

    mul({ x, y }) {
        return new Point(this.x * x, this.y * y);
    }

    div({ x, y }) {
        return new Point(this.x / x, this.y / y);
    }

    clamp(min, max) {
        return new Point(
            Math.max(min.x, Math.min(max.x, this.x)),
            Math.max(min.y, Math.min(max.y, this.y)),
        )
    }

    normalize() {
        const dist = Math.sqrt(this.x * this.x + this.y * this.y);
        return new Point(this.x/dist, this.y/dist);
    }
}
