'use strict';

const $ = (id) => document.getElementById(id);

const e_question = $('question');
const e_buttons = $('buttons');

const RESULT_THRESHOLD = 0.3;

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

$('btn_man').addEventListener('click', () => load_quiz('male'));
$('btn_woman').addEventListener('click', () => load_quiz('female'));
$('btn_unisex').addEventListener('click', () => load_quiz('unisex'));
//$('btn_debug').addEventListener('click', () => do_quiz([], ''));

function load_quiz(gender) {
    e_question.innerHTML = 'Loading Questions...';
    e_buttons.innerHTML = '';
    const request_url = `http://44100.xyz:7777/sigma_quiz/quizdata?gender=${gender}`;
    const req = new XMLHttpRequest();
    req.addEventListener('load', () => do_quiz(JSON.parse(req.responseText), gender));
    req.open('GET', request_url);
    req.send();
}

function do_quiz(quizdata, gender_id) {
    const q = new Quiz(quizdata, gender_id);
    q.do_question(0);
}

class Quiz {
    constructor (quizdata, gender_id) {
        // Shuffle the quiz data
        let shuffled = [];
        const qs = quizdata.questions;
        while (qs.length > 0) {
            const idx = Math.floor(Math.random() * qs.length);
            shuffled.push(qs[idx]);
            qs.splice(idx, 1);
        }
        this.revision = quizdata.revision;
        this.questions = shuffled;
        this.gender_id = gender_id;
        this.answers = [];
    }

    do_question (question_index) {
        if (question_index === this.questions.length) {
            this.give_result();
            return;
        }

        const [index, text] = this.questions[question_index];

        e_question.innerHTML = text;
        e_buttons.innerHTML = `
<button class="quizbutton" id="btn_0">Agree
<button class="quizbutton" id="btn_1">Slight Agree
<button class="quizbutton" id="btn_2">Maybe
<button class="quizbutton" id="btn_3">Slight Disagree
<button class="quizbutton" id="btn_4">Disagree
`;

        for (let i=0; i<5; ++i) {
            $('btn_' + i).addEventListener('click', () => {
                this.answers.push([index, 5-i]);
                this.do_question(question_index + 1);
            });
        }
    }

    give_result () {
        e_question.innerHTML = 'Loading Result...';
        e_buttons.innerHTML = '';

        const answer_arr = [];
        for (let i in this.questions) answer_arr[i] = 0;
        for (let [i, r] of this.answers) {
            answer_arr[i] = r;
        }
        const answer_str = answer_arr.join('');
        const request_url = `
http://44100.xyz:7777/sigma_quiz/results?gender=${this.gender_id}&answers=${answer_str}&rev=${this.revision}`;

        const req = new XMLHttpRequest();
        req.addEventListener('load', () => {
            let {title, description, scores_w} = JSON.parse(req.responseText);
            if (this.gender_id != 'unisex') title += ' ' + this.gender_id;
            e_question.innerHTML = `
<p>Result: ${title}</p>
<p>${description}</p>
<p><canvas width="1000" height="1000" id="compass"></canvas></p>
`;
            const renderer = $('compass').getContext('2d');
            render_compass(renderer, scores_w);
        });

        req.open('GET', request_url);
        req.send();
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

    const result_table = [
        ['Omega', null, 'Beta'],
        [null, null, null],
        ['Sigma', null, 'Alpha'],
    ];

    for (let x=0; x<3; ++x) {
        for (let y=0; y<3; ++y) {
            rdr.fillStyle = `hsl(${x * -30 + y * 100 + 30}, 90%, 90%)`;
            rdr.fillRect(rr*x, rr*y, rr,rr);
            const label = result_table[2-y][x];
            if (label) {
                rdr.font = "24px serif";
                rdr.fillStyle = `#000`;
                rdr.fillText(result_table[2-y][x], rr*x, rr*y + 20);
            }
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

