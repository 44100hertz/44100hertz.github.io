import Point from "../lib/Point.js";

const levels = [
    {
        getKind: () => "normal",
        count: new Point(6, 4),
        height: 14,
        offset: 10,
    },
    {
        getKind: (x, y) =>
            y > 0 && y < 3
                ? x > 1 && x < 6
                    ? x == 2 || x == 5
                        ? "solid"
                        : "killer"
                    : "empty"
                : "normal",
        count: new Point(8, 4),
        height: 14,
        offset: 10,
    },
    {
        getKind: (x ,y) =>
           (x == 0 || x == 6)
           ? "solid"
           : y % 2 == 0 ? "normal" : "empty",
        count: new Point(7, 9),
        height: 14,
        offset: 0,
    },
    {
        getKind: (x, y) =>
            (x == 1 || x == 5 || y == 0 || y == 4)
            ? "normal"
            : (x == 3 && y == 2)
                ? "blackhole"
                : "empty",
        count: new Point(7, 5),
        height: 20,
        offset: 10,
    }
];

export function brickPattern(level) {
    return levels[level-1];
}
