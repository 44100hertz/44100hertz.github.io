import Point from '../lib/Point.js';

export function brickPattern(level) {
    const getBrickKind = (x, y) => {
        switch (level) {
            case 1:
                return 'normal';
            case 2:
                return ((y == 2 || y == 1) && (x == 2 || x == 5)) ? 'solid' : 'normal';
        }
    }

    const numBricks = new Point(8,4);

    return {
        numBricks,
        getBrickKind,
    }
}