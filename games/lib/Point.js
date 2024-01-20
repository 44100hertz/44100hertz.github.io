export default class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y ?? x;
    }

    add({x, y}) {
        return new Point(this.x + x, this.y + y);
    }

    sub({x, y}) {
        return new Point(this.x - x, this.y - y);
    }

    mul({x, y}) {
        return new Point(this.x * x, this.y * y);
    }

    div({x, y}) {
        return new Point(this.x / x, this.y / y);
    }
}
