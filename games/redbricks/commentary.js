export function getScoreMessage(seconds, maxStreak) {
    const message = [];
    message.push(getScoreComment(seconds, maxStreak));
    const minutes = Math.floor(seconds / 60);
    const justSeconds = String(seconds % 60).padStart(2, "0");
    const exclaim = "!";
    message.push(`Level time: ${minutes}:${justSeconds}`);
    if (maxStreak > 5) {
        message.push(
            `Brick streak: ${maxStreak}${exclaim.repeat(Math.floor(maxStreak / 5))}`,
        );
    }
    return message.join("\n");
}

function getScoreComment(seconds, maxStreak) {
    const secondScore = Math.max(0, 4 - Math.floor(seconds / 30));
    const streakScore = Math.min(4, Math.floor(maxStreak / 5));
    return praise[secondScore + streakScore];
}

export function getDeathMessage(deathCount) {
    const message = [];
    message.push(taunts[(deathCount - 1) % taunts.length]);
    message.push("");
    message.push(`deaths: ${deathCount}`);
    return message.join("\n");
}

export function getEndMessage() {
    return `
You won...kind of. This game is WIP!
If you'd like, email ${"ssaammpzz@gmail.com".replace("zz", "")} with feedback.
Thanks for playing.
    `;
}

const taunts = [
    "try again",
    "try again again",
    "try again again again",
    "are you trying yet?",
    "this game is not easy",
    "finesse is everything",
    "you didn't use enough finesse",
    "try to use finesse",
    "hang in there, buddy",
    "you got this",
    "this time",
    "this time",
    "for REAL this time",
    "try using finesse",
    "ya blew it",
    "ya screwed it",
    "ya lost it",
    "you couldn't make it",
    "just DO it",
    "finesse it.",
    "finesse it!",
    "oof",
    "dang it!",
    "rats!",
    "shucks!",
    "aw, heck!",
    "drat!",
    "fricking frick!",
    "argh!",
    "grrrr!",
    "reeeeeee!",
    "L",
    "another L",
    "another one",
    "and another one",
    "another L on the board",
    "better luck next time",
    "is this the one?",
    "when will you win?",
    "perhaps...",
    "alas!",
    "curses!",
    "oh my!",
    "how unfortunate!",
    "unsatisfactory!",
    "chalk it up to bad luck.",
    "you gonna cry?",
    "you'll get it next time.",
    "if there even is a next time.",
    "dude wheres my W?",
    "alone",
    "alone.",
    "alone...",
    "alone!",
    "nah just kidding.",
    "you're doing fine...",
    "just kidding",
    "what were we doing again?",
    "the ball needs to hit all the boxes to win.",
    "didn't you get the memo?",
    "y'know the memo.",
    "the memo about hitting the boxes to win?",
    "gotta move that mouse faster.",
    "try adjusting your chair.",
    "too hard? ill turn down the difficulty",
    "oh whoops i'll turn down the difficulty now.",
    "still too hard? i've got this thing on baby mode.",
    "i don't think i can turn the difficulty down any further.",
    "Ahhh $!*%",
    "you'll get it this time.",
    "i mean this time.",
    "whoops",
    "ahhhh dang",
    "its all in the wrists",
    "patience is a virtue",
    "breath...",
    "practice mindfulness",
];

const praise = [
    "You survived!",
    "Level complete!",
    "Nice job!",
    "Good work!",
    "Great!",
    "Excellent!",
    "You killed it!",
    "AMAZING!!",
    "IMPOSSIBLE!!",
];

