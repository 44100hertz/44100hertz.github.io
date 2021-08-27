'use strict';

const $ = (id) => document.getElementById(id);

let quiz = [
    // Imperialism
    ["We should apply the same moral standards to every country.", 10, false],
    ["It is OK to invade another country to export democracy.", 20, false],
    ["The US may be imperialist, but China is also.", 10, false],

    // Utopianism
    ["Start with the ideal society, and work from there.", 10, false],
    ["Socialism is more economic than cultural.", 10, true],
    ["Abolish nations and borders ASAP.", 10, false],

    // Sex
    ["Bestiality should be made legal.", 10, false],
    ["Prostitution is liberating.", 5, false],
    ["Pornography can be harmful to society.", 5, true],
    ["We should not allow adults to have sex with children.", 10, true],
    ["We must dismantle the existing family structure.", 5, false],
    ["Fascism is the result of sexual repression.", 10, false],

    // Idpol
    ["We don't need to read books written by old dead white men.", 10, false],
    ["Karl Marx was thoroughly antisemitic.", 5, false],
    ["Socialism without LGBTQ+ rights is not socialism.", 5, false],
    ["The term 'Latinx' is preferable to Latino or Latina", 10, false],
    ["We can dismantle capitalism by dismantling patriarchy.", 10, false],
    ["White people in the US should go back to Europe.", 10, false],
    ["White and black people in the US are both suffering from poverty.", 5, true],

    // Reformism
    ["We can move towards socialism by voting for the lesser evil.", 5, false],
    ["The Nordic model is the best system to date.", 5, false],
    ["The Bolsheviks should have just ran for office instead of revolting.", 10, false],
    ["Revolution is immoral because it is violent.", 10, false],

    // Marxoid-ism
    ["Socialism can still have commodity production.", 10, true],
    ["Worker co-ops should not try to make profit.", 5, false],
    ["Vietnam can be considered socialist, even though it has markets.", 10, true],
    ["Venezuela can't be considered socialist, since it isn't explicitly Marxist.", 5, false],

    // Anarchism
    ["The black market is the way to freedom.", 10, false],
    ["It is good for some drugs to be illegal.", 10, true],
    ["Police and prisons exist in every modern society.", 5, true],
    ["Real progress is made through non-political struggle.", 10, false],
    ["We must choose individualism over collectivism.", 10, false],
    ["Before trying to change the world, you must perfect your own lifestyle.", 10, false],
    ["Kill and destroy whatever it is you hate, and others will follow.", 15, false],
    ["We don't need a state, we can just voluntarily exchange goods and services.", 10, false],

    // Primitivism
    ["Large industry has to be broken up to save the planet.", 10, false],
    ["We need to reduce the human population.", 10, false],

    // Vulgar materialism
    ["Religion is meaningless.", 10, false],
    ["Muslim faith leads to violent extremism.", 20, false],
    ["We should not always trust science.", 10, true],
]

const shuffled = [];
while (quiz.length > 0) {
    const idx = Math.floor(Math.random() * quiz.length);
    shuffled.push(quiz[idx]);
    quiz.splice(idx, 1);
}
quiz = shuffled;

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
                "You are based."]
    } else if (score < 0.1) {
        return ["Slight leftoid",
                "You have leftoid tendencies, but it isn't that bad.", true]
    } else if (score < 0.2) {
        return ["Average leftoid",
                "You're kind of a leftoid.", true]
    } else if (score < 0.3) {
        return ["Acute leftoid",
                "You have gone over the deep end.", true]
    } else if (score < 0.4) {
        return ["Extreme leftoid",
                "Your mind has been thoroughly rotted by western leftism.", true]
    } else {
        return ["Terminal leftoid",
                "Your politics is a complete joke. You probably struggle in everyday life.", true]
    }
}

const e_question = $('question');
const e_buttons = $('buttons');

let score = 0
let total_weight = 0
let leftoid_answers = []

function do_question (question_index) {
    if (question_index === quiz.length) {
        const [result, description, is_leftoid] = get_result(score, total_weight);
        e_question.innerHTML = `
<p>Result: ${result}</p>
<p>${description}</p>`;
        if (is_leftoid) {
            e_buttons.innerHTML = '<button class="quizbutton" id="btn_why">Why am I a leftoid?';
            $('btn_why').addEventListener('click', () => {
                for (const i of leftoid_answers) {
                    e_question.innerHTML += `<p>You answered ${quiz[i][2] ? 'Disagree' : 'Agree'} to "${quiz[i][0]}"</p>`;
                }
                $('btn_why').disabled = true;
            })
        }
        return;
    }

    const [text, weight, invert] = quiz[question_index];

    e_question.innerHTML = text;
    e_buttons.innerHTML = `
<button class="quizbutton" id="btn_agree">Agree
<button class="quizbutton" id="btn_neutral">Neutral
<button class="quizbutton" id="btn_disagree">Disagree
<button class="quizbutton" id="btn_idk">Don't Know
`

    $('btn_agree').addEventListener('click', () => {
        total_weight += weight;
        if (!invert) {
            score += weight;
            leftoid_answers.push(question_index);
        }
        do_question(question_index + 1);
    })
    $('btn_neutral').addEventListener('click', () => {
        total_weight += weight / 2.0;
        do_question(question_index + 1);
    })
    $('btn_disagree').addEventListener('click', () => {
        total_weight += weight;
        if (invert) {
            score += weight;
            leftoid_answers.push(question_index);
        }
        do_question(question_index + 1);
    })
    $('btn_idk').addEventListener('click', () => {
        do_question(question_index + 1);
    })
}

e_question.innerHTML = `
<p>Introduction</p>

<p> Are you a leftoid? A leftoid is someone who has been set on the wrong path
by western leftism.</p>

<p> The following questions will try to assess whether or not you are a leftoid,
and if so how severe of a problem it is. <u>Think before you answer, and
if you are uncertain say 'Neutral' or 'I don't know'.</u></p>`;

e_buttons.innerHTML = `<div><button class="quizbutton" id="btn_begin">Begin</div>`

$('btn_begin').addEventListener('click', () => do_question(0));
