import Point from '../lib/Point.js';

const levels = [
    {
        kind: () => 'normal',
        num: new Point(6,4),
    },
    {
        kind: (x,y) =>
            ((y == 2 || y == 1) && (x == 2 || x == 5)) ?
            'solid' : 'normal',
        num: new Point(8,4),
    }
];

export function brickPattern(level) {
    const {kind, num} = levels[level-1];
    return {
        numBricks: num,
        getBrickKind: kind,
    }
}