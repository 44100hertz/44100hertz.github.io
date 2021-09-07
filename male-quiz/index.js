'use strict';

const $ = (id) => document.getElementById(id);

const RESULT_THRESHOLD = 0.3;
const FIELDS = ['social', 'dominant', 'mushroom'];

const result_table = [
    [{title: 'Omega', description: "Both submissive and socially isolated, you are an embarrassment to your family and to the world."},
     {title: 'Submissive', description: "You have a submissive personality somewhere between Beta and Omega. It's time to get your act together."},
     {title: 'Beta', description: "Socially extraverted but submissive, you are the most annoying type of person. If you get your life together, you can become Alpha and make the world a better place."},
    ],
    [{title: 'Antisocial', description: "You are sort of a lone wolf, but its unclear whether you are a dominant person. You lie somewhere between Sigma and Omega."},
     {title: 'Average', description: "You're probably just an average person."},
     {title: 'Social', description: "Somewhere between Alpha and Beta, you are friendly and probably nice to be around."},
    ],
    [{title: 'Sigma', description: "Dominant but socially isolated, you are a real lone wolf sigma that nobody can mess with."},
     {title: 'Dominant', description: "Between Sigma and Alpha, you are dominant but socially ambiguous."},
     {title: 'Alpha', description: "Dominant and extraverted, you are everyone's favorite type of person. Betas are jealous but you aren't bothered by the haters."},
    ],
];

const quiz_man = [
    ["I always hold the door open for women.", {social: 1}],
    ["I will defend women who are in trouble.", {social: 1}],
    ["Women annoy me.", {social: -1}],
    ["There is no woman in the world good enough for me.", {social: -1}],

    ["I have stolen someone's woman before.", {dominant: 2}],
    ["I have a well-fitting suit.", {dominant: 1}],
    ["I lift weights and I'm proud of my body.", {dominant: 1}],
    ["Strong men intimidate me.", {dominant: -1}],
    ["I have a high-pitched voice.", {dominant: -1}],
    ["Women ignore me despite how nice I am.", {dominant: -2}],
]

const quiz_woman = [
    ["I do cute things to get men's attention.", {social: 1}],
    ["I like to share fashion and beauty tips.", {social: 1}],
    ["Men annoy me.", {social: -1}],
    ["There is no man in the world good enough for me.", {social: -1}],

    ["I have stolen someone's man before.", {dominant: 2}],
    ["I out-dress the women around me.", {dominant: 1}],
    ["I exercise so I can look and feel my best.", {dominant: 1}],
    ["I hate it when men do things for me. I'll do it myself.", {dominant: 1}],
    ["I turn to men for physical protection.", {dominant: -1}],
    ["If I like a man, I will do just about whatever he says.", {dominant: -2}],
]

const quiz_unisex = [
    ["I have close friends.", {social: 2}],
    ["After a conversation, I wonder people think of me.", {social: 1}],
    ["I like to be in a long-term relationship.", {social: 1}],
    ["I'm a fun and likeable person.", {social: 1}],
    ["When people tell me I'm rude, I try to change my behavior.", {social: 1}],
    ["I have never given money to the homeless or charity.", {social: -1}],
    ["Most people are stupid and fake.", {social: -1}],
    ["I have never been in a relationship and never will be.", {social: -2}],
    ["I could kill without remorse.", {social: -2}],
    ["I would have no trouble firing an elderly woman from her job.", {social: -2}],

    ["I have been in a physical fight and won.", {dominant: 2}],
    ["I know how to use a weapon to protect myself.", {dominant: 1}],
    ["I have mastered a particular skill.", {dominant: 1}],
    ["People are jealous of my financial success.", {dominant: 1}],
    ["When I'm in an organization, I naturally become a leader.", {dominant: 1}],
    ["I rely heavily on fiction or other ways of escaping reality.", {dominant: -1}],
    ["I always do what my boss tells me to do.", {dominant: -1}],
    ["In school I assume the teacher is right.", {dominant: -1}],
    ["I prefer the internet to real life.", {dominant: -1}],

    // shrigma
    ["I'm not a human being.", {mushroom: 10}],
    ["I'm very down-to-earth.", {mushroom: 1}],
    ["Sometimes I trip people out.", {mushroom: 1}],
    ["I like to hang out in cool, damp places.", {mushroom: 1}],
    ["I don't like wearing hats.", {mushroom: -1}],
]

//
// Introduction Screen [rest is in .html]
//
const e_question = $('question');
const e_buttons = $('buttons');

e_question.innerHTML = `
<p>Introduction</p>

<p>There are many types of people in this world. Some are Sigma, some are Omega, and some are hard to classify. This test will put you into one of 9 categories based on your answers.</p>

<p>Real alphas and real sigmas answer these questions honestly. If you don't get an accurate result, you probably capped and thats sussy.</p>
`;


e_buttons.innerHTML = `
<div><button class="quizbutton" id="btn_man">Begin Male Quiz</div>
<div><button class="quizbutton" id="btn_woman">Begin Female Quiz</div>
<div><button class="quizbutton" id="btn_unisex">Begin Unisex Quiz</div>
`;
//<div><button class="quizbutton" id="btn_debug">Debug</div>

$('btn_man').addEventListener('click', () => do_quiz([...quiz_unisex, ...quiz_man], ' male'));
$('btn_woman').addEventListener('click', () => do_quiz([...quiz_unisex, ...quiz_woman], ' female'));
$('btn_unisex').addEventListener('click', () => do_quiz([...quiz_unisex], ''));
//$('btn_debug').addEventListener('click', () => do_quiz([], ''));

function do_quiz(quizdata, gender_id) {
    const q = new Quiz(quizdata, gender_id);
    q.do_question(0);
}

class Quiz {
    constructor (quizdata, gender_id) {
        // Shuffle the quiz data
        let shuffled = [];
        while (quizdata.length > 0) {
            const idx = Math.floor(Math.random() * quizdata.length);
            shuffled.push(quizdata[idx]);
            quizdata.splice(idx, 1);
        }
        this.quizdata = shuffled;

        this.scores = {};
        this.weights = {};
        for (let k of FIELDS) {
            this.scores[k] = 0;
            this.weights[k] = 0;
        }

        this.gender_id = gender_id;
    }

    do_question (question_index) {
        if (question_index === this.quizdata.length) {
            const {title, description, scores_w} = this.get_result();
            e_question.innerHTML = `
<p>Result: ${title}</p>
<p>${description}</p>
<p><canvas width="1000" height="1000" id="compass"></canvas></p>
`;
            const renderer = $('compass').getContext('2d');
            render_compass(renderer, scores_w);
            e_buttons.innerHTML = '';
            return;
        }

        const [text, table_effect] = this.quizdata[question_index];

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
                this.scores[k] += table_effect[k] * score;
                this.weights[k] += Math.abs(table_effect[k] * weight);
            }
        }

        for (let i=0; i<5; ++i) {
            $('btn_' + i).addEventListener('click', () => {
                let score = ((i / 4) - 0.5) * -2;
                add_to_total(score, 1);
                this.do_question(question_index + 1);
            });
        }
    }

    get_result() {
        let scores_w = []; // Weighted scores
        for (let k of FIELDS) scores_w[k] = this.scores[k] / this.weights[k];
        if (scores_w.mushroom === 1) {
            return {title: 'Shrigma', description: ".rellevart emit wollef a era uoy fi em liame esaelP .8302 fo raw PME taerg eht ni deyortsed neeb evah dluohs ziuq siht dna 3503 raey eht litnu seiceps a sa egreme ton od samgirhs ecnis ,ziuq siht deniatbo gnieb amgirhs a woh si noitseuq tsrif yM .tluser ytilanosrep a evig ot tpmetta ton lliw I os ,smret namuh ni ebircsed ot tluciffid ytilanosrep a evah samgirhs taht dias si tI .moorhsum dna namuh neewteb dirbyh a si hcihw seiceps tnereffid a yllautca era uoy ,gnieb namuh a ton era uoY".split('').reverse().join(''), scores_w};
        }

        const get_index = (value) => {
            if (value < -RESULT_THRESHOLD) return 0;
            if (value > RESULT_THRESHOLD) return 2;
            return 1;
        }

        const social_index = get_index(scores_w.social);
        const dominant_index = get_index(scores_w.dominant);

        let {title, description} = result_table[dominant_index][social_index];
        title = title.slice();
        title += this.gender_id;
        if (Math.abs(scores_w.dominant) > 0.8 || Math.abs(scores_w.social) > 0.8)
            title += ' (extreme)';
        return {title, description, scores_w};
    }
}

function render_compass(rdr, scores) {
    if (scores.mushroom === 1) {
        const f = (h) => {
            rdr.fillStyle = `hsl(${h + 180}, 100%, 50%)`;
            rdr.fillRect(0, 0, 1000, 1000);
            rdr.fillStyle = `hsl(${h}, 100%, 50%)`;
            rdr.font = "600px serif";
            rdr.fillText("????", 100, 700);
            window.requestAnimationFrame(() => f(h+10));
        }
        f(0);
        return;
    }

    const rr = RESULT_THRESHOLD * 1000;
    const comp_size = rr * 3;
    const offset = (1000 - comp_size) / 2.0;
    // Draw compass squares
    rdr.translate(offset, offset);

    for (let x=0; x<3; ++x) {
        for (let y=0; y<3; ++y) {
            rdr.fillStyle = `hsl(${x * -30 + y * 100 + 30}, 90%, 90%)`;
            rdr.fillRect(rr*x, rr*y, rr,rr);
            rdr.font = "24px serif";
            rdr.fillStyle = `#000`;
            rdr.fillText(result_table[2-y][x][0], rr*x, rr*y + 20);
        }
    }
    rdr.translate(-offset, -offset);

    // draw +
    rdr.strokeStyle = `#777`;
    rdr.lineWidth = 2.0;
    rdr.beginPath();
    rdr.moveTo(500, 0);
    rdr.lineTo(500, 1000);
    rdr.moveTo(0, 500);
    rdr.lineTo(1000, 500);
    rdr.stroke();

    // draw user position
    rdr.strokeStyle = `#000`;
    rdr.fillStyle = `#e00`;
    rdr.beginPath();
    rdr.arc(scores.social * 500 + 500, scores.dominant * -500 + 500, 25, 0, 2 * Math.PI);
    rdr.fill();
    rdr.stroke();

    console.log(scores);
}

