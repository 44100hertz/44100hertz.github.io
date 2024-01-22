const filenames = [
    "wallbump",
    "paddlebump",
    "brickbump",
    "launch",
    "miss",
    "deathblock",
];

const sound = filenames.reduce((acc, filename) =>
    ({...acc, [filename]: new Audio(`sound/${filename}.wav`)}),
    {})

export function play(name) {
    sound[name].fastSeek(0);
    sound[name].play();
}
