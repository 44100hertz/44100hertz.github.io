import Point from './Point.js';

export default class Rect {
    constructor(origin, size) {
        this.origin = origin;
        this.size = size;
    }

    static centered(origin, size) {
        return new Rect(origin.sub(size.div(new Point(2))), size);
    }

    within(other) {
        return (
            this.origin.x >= other.origin.x &&
            this.origin.y >= other.origin.y &&
            this.end.x <= other.end.x &&
            this.end.y <= other.end.y
        )
    }

    overlaps(other) {
        return (
            this.origin.x <= other.end.x &&
            this.origin.y <= other.end.y &&
            this.end.x >= other.origin.x &&
            this.end.y >= other.origin.y
        )
    }

    get end() {
        return this.origin.add(this.size);
    }
}