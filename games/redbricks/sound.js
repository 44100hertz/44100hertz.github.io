const filenames = [
    "wallbump",
    "paddlebump",
    "brickbump",
    "launch",
    "miss",
    "deathblock",
    "portal",
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
    pitch_offset = Math.min(12*2, Math.max(-12*2, pitch_offset))
    sound[name].playbackRate = Math.pow(2, pitch_offset/12);
    sound[name].currentTime = 0;
    sound[name].play();
}
