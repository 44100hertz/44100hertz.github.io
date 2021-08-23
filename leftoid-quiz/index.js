'use strict';

const quiz = [
    ["It is sometimes OK to invade other countries for humanitarian reasons.", 20],
    ["Bestiality is sometimes acceptable.", 10],
    ["The age of consent is oppressive.", 10],
    ["We don't need to read books written by old dead white men.", 10],
    ["White genocide would benefit the world.", 10],
    ["We have an obligation to vote for the sake of harm reduction.", 5],
    ["The proper term for Latino or Latina people is Latinx", 5],
    ["Marx was antisemitic.", 5],
    ["Prostitution is liberating.", 5],
    ["Pornography is liberating.", 5],
    ["Selling or using drugs is liberating.", 5],
    ["The drinking age is oppressive.", 5],
    ["Socialism means the abolition of commodity production.", 5],
    ["Revolution isn't authoritarian, it is anti-authoritarian.", 5],
    ["Authority is the root of all evil.", 5],
    ["We do not need police and prisons.", 5],
    ["We have to choose individualism over collectivism.", 5],
    ["Abolish nations and borders.", 5],
    ["Poverty is virtuous.", 5],
    ["China was only socialist before Deng Xiaoping's reform.", 5],
    ["Cuba can't be considered socialist.", 5],
    ["Venezuela can't be considered socialist.", 5],
    ["We must dismantle the traditional family structure.", 5],
    ["Socialism without LGBTQ+ rights is not socialism.", 5],
    ["Profit harms workers.", 5],
    ["Large industry has to be broken up to save the planet.", 5],
    ["Socialism will eliminate all inequality.", 5],
    ["We need to re-examine our culture and weed out problematic elements.", 5],
    ["The Nordic model is the best governmental system to date.", 5],
    ["We can vote our way into socialism.", 5],
]

let default_weight = 0;
for (const [_, weight] of quiz) default_weight += weight;

function get_result(total_score, weight) {
    const score = total_score / weight;
    if (weight <= default_weight * 0.51) {
        return ["Apathetic",
                "You either don't know or don't care enough for me to give a good result."];
    }
    if (score <= 0) {
        return ["Non-Leftoid",
                "You either spam-clicked disagree, or you are actually based."]
    } else if (score < 0.1) {
        return ["Slight leftoid",
                "You have leftoid tendencies, but it isn't that bad."]
    } else if (score < 0.2) {
        return ["Average leftoid",
                "You're kind of a leftoid."]
    } else if (score < 0.3) {
        return ["Acute leftoid",
                "You have gone over the deep end."]
    } else if (score < 0.4) {
        return ["Extreme leftoid",
                "Your mind has been thoroughly rotted by western leftism."]
    } else {
        return ["Terminal leftoid",
                "Your politics is a complete joke. You are thoroughly divorced from all impactful leftist movements in the world."]
    }
}

const e_question = document.getElementById('question');
const e_buttons = document.getElementById('buttons');

let score = 0
let total_weight = 0

function do_question (question_index) {
    console.log(score, total_weight, score / total_weight);
    if (question_index === quiz.length) {
        const [result, description] = get_result(score, total_weight);
        e_question.innerHTML = '<p>Result: ' + result + '</p><p>' + description + '</p>';
        e_buttons.innerHTML = '';
        return;
    }

    const [text, weight] = quiz[question_index];

    e_question.innerHTML = text;
    e_buttons.innerHTML = `
<button class="quizbutton" id="btn_agree">Agree
<button class="quizbutton" id="btn_neutral">Neutral
<button class="quizbutton" id="btn_disagree">Disagree
<button class="quizbutton" id="btn_idk">Don't Know
`

    const btn_agree = document.getElementById('btn_agree');
    const btn_neutral = document.getElementById('btn_neutral');
    const btn_disagree = document.getElementById('btn_disagree');
    const btn_idk = document.getElementById('btn_idk');

    btn_agree.addEventListener('click', () => {
        total_weight += weight;
        score += weight;
        do_question(question_index + 1);
    })
    btn_neutral.addEventListener('click', () => {
        total_weight += weight / 2.0;
        do_question(question_index + 1);
    })
    btn_disagree.addEventListener('click', () => {
        total_weight += weight;
        do_question(question_index + 1);
    })
    btn_idk.addEventListener('click', () => {
        do_question(question_index + 1);
    })
}

e_question.innerHTML = `
<p>Introduction</p>

<p> Are you a leftoid? A leftoid is someone who has been set on the wrong path
by western leftism. Without a coherent view of Marxism or Socialism, these
people have been tricked into wasting their time and energy while failing to
challenge the established US global order, and to offer a meaningful alternative
that uplifts the people. </p>

<p> The following questions will try to assess whether or not you are a leftoid,
and if so how severe of a problem it is.</p> `;
e_buttons.innerHTML = `<div><button class="quizbutton" id="btn_begin">Begin</div>`

const btn_begin = document.getElementById('btn_begin');
btn_begin.addEventListener('click', () => do_question(0));
