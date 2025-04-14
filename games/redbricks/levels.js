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
        patternSize: new Point(9, 8),
        patternSpacing: 19,
        patternOffset: 0,
    },
    {
        getObjectKind: (x, y) => {
            if (x == 1 || x == 5 || y == 0 || y == 4) {
                return { kind: "brick" };
            } else {
                if (x == 3 && y == 2) {
                    return { kind: "blackHole", size: new Point(20, 20) };
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
        enablePortals: "x",
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
                    return {
                        kind: "blackHole",
                        variant: "reverse",
                        size: new Point(20, 20),
                    };
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
            if (x == 1 && y == 2) {
                return {
                    kind: "brick",
                    variant: "dividing",
                    size: new Point(180, 60),
                    remainingDivisions: 5,
                };
            } else if (y == 0) {
                return {
                    kind: "brick",
                    variant: "solid",
                };
            }
            return {};
        },
        patternSize: new Point(3, 3),
        patternSpacing: 40,
        patternOffset: 10,
    },
    {
        getObjectKind: (x, y) => {
            if (x == 3 && y == 2) {
                return {
                    kind: "blackHole",
                    variant: "reverse",
                    size: new Point(20, 20),
                };
            }
            if (y !== 5) {
                return {
                    kind: "brick",
                    variant: y > 4 ? "solid" : "killer",
                };
            }
            return {};
        },
        enablePortals: "y",
        patternSize: new Point(7, 7),
        patternSpacing: 20,
        patternOffset: 20,
    },
    // Level 9: scrolling
    {
        getObjectKind: (x, y) =>
            y % 2 == 0 && (x !== 3 || y % 3 == 0)
                ? {
                      kind: "brick",
                      enableScrolling: true,
                      velocity: new Point(0, 25),
                  }
                : {},
        patternSize: new Point(7, 12),
        patternSpacing: 20,
        patternOffset: -72,
    },
];

export function getObjects(level, viewportRect) {
    if (level > levels.length) {
        return;
    }
    const {
        getObjectKind,
        patternSize,
        patternSpacing,
        patternOffset,
        enablePortals,
    } = levels[level - 1];
    const brickGap = new Point(3, 3);

    const brickSpacing = new Point(
        (viewportRect.size.x - brickGap.x * 2) / patternSize.x,
        patternSpacing + brickGap.y,
    );
    const brickSize = new Point(brickSpacing.x - brickGap.x, patternSpacing);

    const objects = [];

    for (let iy = 0; iy < patternSize.y; ++iy) {
        for (let ix = 0; ix < patternSize.x; ++ix) {
            const { kind, variant, ...props } = getObjectKind(ix, iy);
            if (!kind) {
                continue;
            }
            let size = "size" in props ? props.size : brickSize;
            const object = {
                position: brickSpacing
                    .mul(new Point(ix, iy))
                    .add(brickGap)
                    .add(new Point(0, patternOffset))
                    .add(brickSpacing.div(new Point(2, 2))),
                size,
                kind,
                variant,
                ...props,
            };
            objects.push(object);
        }
    }

    if (enablePortals) {
        const dim = enablePortals;
        const odim = dim == "y" ? "x" : "y";
        const portalLength = viewportRect.size[odim] - 4;
        const portalWidth = 4;
        let portalSize = new Point(portalWidth, portalLength);
        if (dim == "y") portalSize = portalSize.swap();
        let portalPos1 = new Point(portalWidth, viewportRect.size[odim] / 2);
        if (dim == "y") portalPos1 = portalPos1.swap();
        let portalPos2 = new Point(
            viewportRect.size[dim] - portalWidth,
            viewportRect.size[odim] / 2,
        );
        if (dim == "y") portalPos2 = portalPos2.swap();

        objects.push({
            position: portalPos1,
            size: portalSize,
            kind: "portal",
            variant: dim == "x" ? "left" : "top",
        });
        objects.push({
            position: portalPos2,
            size: portalSize,
            kind: "portal",
            variant: dim == "x" ? "right" : "bottom",
        });
    }

    return objects;
}
