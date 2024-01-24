const filenames = [
    "wallbump",
    "paddlebump",
    "brickbump",
    "launch",
    "miss",
    "deathblock",
];

const sound = filenames.reduce((acc, filename) => {
    const audio = new Audio(`sound/${filename}.wav`);
    audio.preservesPitch = false;
    return {
        ...acc,
        [filename]: audio,
    };
}, {});

export function play(name, pitch_offset = 0) {
    sound[name].playbackRate = Math.pow(2, pitch_offset/12);
    sound[name].currentTime = 0;
    sound[name].play();
}
