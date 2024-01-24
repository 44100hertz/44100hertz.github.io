import Point from "../lib/Point.js";

const levels = [
    {
        getObjectKind: () => ({ kind: "brick" }),
        patternSize: new Point(6, 3),
        patternSpacing: 20,
        patternOffset: 20,
    },
    {
        getObjectKind: (x, y) => {
            if (y > 0 && y < 3) {
                if (x > 1 && x < 6) {
                    if (x == 2 || x == 5) {
                        return { kind: "brick", variant: "solid" };
                    } else {
                        return { kind: "brick", variant: "killer" };
                    }
                } else {
                    return {};
                }
            } else {
                return { kind: "brick" };
            }
        },
        patternSize: new Point(8, 4),
        patternSpacing: 16,
        patternOffset: 15,
    },
    {
        getObjectKind: (x, y) => {
            if (x == 0 || x == 8 || y == 0) {
                return { kind: "brick", variant: "solid" };
            } else if (y < 9 && y % 2 == 1) {
                return { kind: "brick" };
            }
            return {};
        },
        patternSize: new Point(9, 10),
        patternSpacing: 19,
        patternOffset: 0,
    },
    {
        getObjectKind: (x, y) => {
            if (x == 1 || x == 5 || y == 0 || y == 4) {
                return { kind: "brick" };
            } else {
                if (x == 3 && y == 2) {
                    return { kind: "blackHole" };
                }
            }
            return {};
        },
        patternSize: new Point(7, 5),
        patternSpacing: 20,
        patternOffset: 10,
    },
    {
        getObjectKind: (x, y) => {
            if (x != 0 && x != 6) {
                return { kind: "brick", variant: y == 4 && "solid" };
            }
            return {};
        },
        patternSize: new Point(7, 5),
        patternSpacing: 20,
        patternOffset: 20,
    },
    {
        getObjectKind: (x, y) => {
            if (x == 2 || x == 4 || y == 1 || y == 3) {
                return { kind: "brick" };
            } else {
                if (x == 3 && y == 2) {
                    return { kind: "blackHole", variant: "reverse" };
                }
            }
            return {};
        },
        patternSize: new Point(7, 5),
        patternSpacing: 20,
        patternOffset: 10,
    },
    // Level 6: white hole
    // Level 7: BRUTAL classic-style challenge
    // Level 8: white hole with screen wrapping
];

export function getObjects(level, viewportRect) {
    if (level > levels.length) {
        return;
    }
    const { getObjectKind, patternSize, patternSpacing, patternOffset } =
        levels[level - 1];
    const brickGap = new Point(3, 3);

    const brickSpacing = new Point(
        (viewportRect.size.x - brickGap.x * 2) / patternSize.x,
        patternSpacing + brickGap.y
    );
    const patternBottom = brickSpacing.y * patternSize.y;
    const brickSize = new Point(brickSpacing.x - brickGap.x, patternSpacing);

    const objects = [];

    for (let iy = 0; iy < patternSize.y; ++iy) {
        for (let ix = 0; ix < patternSize.x; ++ix) {
            const { kind, variant } = getObjectKind(ix, iy);
            if (!kind) {
                continue;
            }
            const object = {
                position: brickSpacing
                    .mul(new Point(ix, iy))
                    .add(brickGap)
                    .add(new Point(0, patternOffset))
                    .add(brickSpacing.div(new Point(2, 2))),
                size: kind == "blackHole" ? new Point(20, 20) : brickSize,
                kind,
                variant,
            };
            objects.push(object);
        }
    }

    if (level == 5) {
        const portalSize = new Point(4, viewportRect.size.y - brickGap.y*2);
        const portalY = brickGap.y + portalSize.y/2;
        objects.push({
            position: new Point(portalSize.x, portalY),
            size: portalSize,
            kind: "portal",
            variant: "left",
        });
        objects.push({
            position: new Point(viewportRect.size.x - portalSize.x, portalY),
            size: portalSize,
            kind: "portal",
        });
    }

    return objects;
}
