'use strict';

const $ = (id) => document.getElementById(id);

let quiz;
let gender_id;

const result_threshold = 0.3;

const result_table = [
    [['Omega', "Both submissive and socially isolated, you are an embarrassment to your family and to the world."],
     ['Submissive', "You have a submissive personality somewhere between Beta and Omega. It's time to get your act together."],
     ['Beta', "Socially extraverted but submissive, you are the most annoying type of person. If you get your life together, you can become Alpha and make the world a better place."],
    ],
    [['Reclusive', "You are sort of a lone wolf, but its unclear whether you are a dominant person. You lie somewhere between Sigma and Omega."],
     ['Average', "You're just an average person."],
     ['Extraverted', "Somewhere between Alpha and Beta, you are friendly and probably nice to be around."],
    ],
    [['Sigma', "Dominant but socially isolated, you are a real lone wolf sigma that nobody can mess with."],
     ['Dominant', "Between Sigma and Alpha, you are dominant but socially ambiguous."],
     ['Alpha', "Dominant and extraverted, you are everyone's favorite type of person. Betas are jealous but you aren't bothered by the haters."],
    ],
];

let quiz_man = [
    ["I always hold the door open for women.", {social: 1, dominant: -0.5}],
    ["Women annoy me.", {social: -1}],
    ["I have a well-fitting suit.", {dominant: 1}],
    ["I lift weights and I'm proud of my body.", {dominant: 1}],
    ["I will physically defend women in trouble.", {dominant: 1, social: 1}],
    ["Strong men intimidate me.", {dominant: -1}],
    ["There is no woman in the world good enough for me.", {dominant: 1, social: -1}],
    ["I have stolen someone's woman before.", {social: -1, dominant: 2}],
    ["I want to be pegged by a woman.", {dominant: -2}],
    ["Women ignore me despite how nice I am.", {dominant: -2}],
]

let quiz_woman = [
    ["I do cute things to get men's attention.", {social: 1}],
    ["Men annoy me.", {social: -1}],
    ["I out-dress the women around me.", {dominant: 1}],
    ["I exercise so I can look and feel my best.", {dominant: 1}],
    ["I turn to men for physical protection.", {dominant: -1}],
    ["I hate it when men do things for me. I'll do it myself.", {dominant: 1, social: -0.5}],
    ["There is no man in the world good enough for me.", {dominant: 1, social: -1}],
    ["I have stolen someone's man before.", {social: -1, dominant: 2}],
    ["I would peg a man.", {dominant: 2}],
    ["Men ignore me despite how nice I am.", {dominant: -2}],
]

let quiz_unisex = [
    ["I have cried after breaking up with someone.", {social: 2}],
    ["After a conversation, I worry what people think of me.", {social: 1, dominant: -0.5}],
    ["I have close friends.", {social: 1}],
    ["I like to be in a long-term relationship.", {social: 1}],
    ["I'm a fun and likeable person.", {social: 1}],
    ["I have never been in a relationship and never will be.", {social: -2}],
    ["When people tell me I'm rude, it doesn't bother me.", {social: -1}],
    ["I would have no trouble firing an elderly woman from her job.", {social: -1}],
    ["I have never given money to the homeless or charity.", {social: -1}],
    ["Most people are stupid and fake.", {social: -1}],

    ["I have been in a physical fight and won.", {dominant: 2}],
    ["I know how to use a weapon to protect myself.", {dominant: 1}],
    ["I have mastered a particular skill.", {dominant: 1}],
    ["People are jealous of my financial success.", {dominant: 1}],
    ["When I'm in an organization, I naturally become a leader.", {dominant: 1}],
    ["I avoid drugs because they make me weak.", {dominant: 1}],
    ["When someone says something incorrect, it really bothers me.", {dominant: -1, social: 0.5}],
    ["When people have power over me, I do what they tell me.", {dominant: -1}],
    ["I would let someone else have sex with my partner.", {dominant: -2}],
    ["I don't like sports.", {dominant: -2, social: -1}],

    ["I often feel lonely.", {social: 1, dominant: -1}],

    ["The question isn’t who is going to let me; it’s who is going to stop me.", {social: -1, dominant: 1}],
    ["Nobody can insult me and get away with it.", {social: -1, dominant: 1}],
    ["I could kill without remorse.", {social: -2, dominant: 1}],

    // shrigma
    // ["I'm very down-to-earth.", {shrigma: 1}],
    // ["Sometimes I trip people out.", {shrigma: 1}],
    // ["I like to hang out in cool, damp places.", {shrigma: 1}],
    // ["I don't like wearing hats.", {shrigma: -1}],
]

function get_result(scores) {
    const get_index = (value) => {
        if (value < -result_threshold) return 0;
        if (value > result_threshold) return 2;
        return 1;
    }

    const extreme = (Math.abs(scores.dominant) > 0.6 || Math.abs(scores.social) > 0.6);

    const social_index = get_index(scores.social);
    const dominant_index = get_index(scores.dominant);

    let res = result_table[dominant_index][social_index].slice();
    res[0] += gender_id;
    if (extreme) res[0] += ' (extreme)';
    return res;
}

const e_question = $('question');
const e_buttons = $('buttons');

let total_score = {social: 0, dominant: 0};
let total_weight = {social: 0, dominant: 0};

function do_question (question_index) {
    if (question_index === quiz.length) {
        const scores = {};
        for (let k in total_score) scores[k] = total_score[k] / total_weight[k];
        const [result, description] = get_result(scores);
        e_question.innerHTML = `
<p>Result: ${result}</p>
<p>${description}</p>
<p><canvas width="1000" height="1000" id="compass"></canvas></p>
`;
        const renderer = $('compass').getContext('2d');
        render_compass(renderer, scores);
        e_buttons.innerHTML = '';
        return;
    }

    const [text, table_effect] = quiz[question_index];

    e_question.innerHTML = text;
    e_buttons.innerHTML = `
<button class="quizbutton" id="btn_0">Agree
<button class="quizbutton" id="btn_1">Slight Agree
<button class="quizbutton" id="btn_2">Maybe
<button class="quizbutton" id="btn_3">Slight Disagree
<button class="quizbutton" id="btn_4">Disagree
`;

    const add_to_total = (score, weight = 1) => {
        for (const k in table_effect) {
            total_score[k] += table_effect[k] * score;
            total_weight[k] += Math.abs(table_effect[k] * weight);
        }
    }

    for (let i=0; i<5; ++i) {
        $('btn_' + i).addEventListener('click', () => {
            let score = ((i / 4) - 0.5) * -2;
            add_to_total(score, 1);
            console.log(total_score, total_weight);
            do_question(question_index + 1);
        });
    }
}

function shuffle(quiz) {
    let shuffled = [];
    while (quiz.length > 0) {
        const idx = Math.floor(Math.random() * quiz.length);
        shuffled.push(quiz[idx]);
        quiz.splice(idx, 1);
    }
    return shuffled;
}

function render_compass(rdr, scores) {
    const rr = result_threshold * 1000;
    const comp_size = rr * 3;
    const offset = (1000 - comp_size) / 2.0;
    for (let x=0; x<3; ++x) {
        for (let y=0; y<3; ++y) {
            rdr.fillStyle = `hsl(${x * -30 + y * 100 + 30}, 90%, 90%)`;
            rdr.fillRect(offset+rr*x, offset+rr*y, rr,rr);
            rdr.font = "24px serif";
            rdr.fillStyle = `#000`;
            rdr.fillText(result_table[2-y][x][0], offset+rr*x, offset+rr*y + 20);
        }
    }
    rdr.strokeStyle = `#777`;
    rdr.lineWidth = 2.0;
    rdr.beginPath();
    rdr.moveTo(500, 0);
    rdr.lineTo(500, 1000);
    rdr.moveTo(0, 500);
    rdr.lineTo(1000, 500);
    rdr.stroke();

    rdr.strokeStyle = `#000`;
    rdr.fillStyle = `#e00`;
    rdr.beginPath();
    rdr.arc(scores.social * 500 + 500, scores.dominant * -500 + 500, 25, 0, 2 * Math.PI);
    rdr.fill();
    rdr.stroke();

    console.log(scores);
}

e_question.innerHTML = `
<p>Introduction</p>

<p>There are many types of people in this world. Some are Sigma, some are Omega, and some are hard to classify. This test will put you into one of 9 categories based on your answers.</p>

<p>Real alphas and real sigmas answer these questions honestly. If you don't get an accurate result, you probably capped and thats sussy.</p>
`;


e_buttons.innerHTML = `
<div><button class="quizbutton" id="btn_man">Begin Male Quiz</div>
<div><button class="quizbutton" id="btn_woman">Begin Female Quiz</div>
<div><button class="quizbutton" id="btn_unisex">Begin Unisex Quiz</div>
`

//<div><button class="quizbutton" id="btn_debug">Begin Unisex Quiz</div>

$('btn_man').addEventListener('click', () => {
    quiz = shuffle([...quiz_unisex, ...quiz_man]);
    gender_id = ' male';
    do_question(0);
});

$('btn_woman').addEventListener('click', () => {
    quiz = shuffle([...quiz_unisex, ...quiz_woman]);
    gender_id = ' female';
    do_question(0);
});

$('btn_unisex').addEventListener('click', () => {
    quiz = shuffle([...quiz_unisex]);
    gender_id = '';
    do_question(0);
});

// $('btn_debug').addEventListener('click', () => {
//     quiz = shuffle([...quiz_unisex]);
//     gender_id = '';
//     do_question(15);
// });
