'use strict';

const $ = (id) => document.getElementById(id);

let quiz = [
    // Imperialism
    ["We should apply the same moral standards to every country.", 10, false],
    ["It is OK to invade another country if that country is authoritarian.", 20, false],
    ["The US may be imperialist, but China is also.", 10, false],
    ["Hong Kong and Taiwan are part of China.", 10, true],

    // Utopianism
    ["Start with the ideal society, and work from there.", 10, false],
    ["Socialism is more economic than cultural.", 10, true],
    ["Abolish nations and borders ASAP.", 10, false],
    ["Instead of class struggle, we just need to convince everyone of the right ideas.", 10, false],

    // Sex
    ["Under socialism, all of our sexual impulses will be freed.", 20, false],
    ["Fascism is the result of sexual repression.", 10, false],
    ["Prostitution is liberating.", 5, false],
    ["Pornography can be harmful to society.", 5, true],
    ["We must dismantle the existing family structure.", 5, false],

    // Idpol
    ["All white workers in the US are labor aristocracy.", 15, false],
    ["White people in the US are colonisers and should go back to Europe.", 10, false],
    ["We can dismantle capitalism by dismantling patriarchy.", 10, false],
    ["We don't need to read books written by old dead white men.", 10, false],
    ["The term 'Latinx' is preferable to Latino or Latina", 5, false],
    ["Karl Marx was thoroughly antisemitic.", 5, false],
    ["Socialism without LGBTQ+ rights is not socialism.", 5, false],

    // Reformism
    ["Revolution is immoral because it is violent.", 10, false],
    ["The Bolsheviks should have just ran for office instead of revolting.", 10, false],
    ["We can move towards socialism by voting for the lesser evil.", 5, false],
    ["The Nordic model is the best system to date.", 5, false],

    // Marxoid-ism
    ["Socialism can still have commodity production.", 10, true],
    ["Vietnam can be considered socialist, even though it has markets.", 10, true],
    ["Worker co-ops should not try to make profit.", 5, false],
    ["Venezuela can't be considered socialist, since it isn't explicitly Marxist.", 5, false],

    // Anarchism
    ["Kill and destroy whatever it is you hate, and others will follow.", 15, false],
    ["The black market is the way to freedom.", 10, false],
    ["It is good for some drugs to be illegal.", 10, true],
    ["We must choose individualism over collectivism.", 10, false],
    ["We don't need a state, we can just voluntarily exchange goods and services.", 10, false],
    ["The best way to change the world is by changing your personal habits.", 5, false],
    ["Police and prisons exist in every modern society.", 5, true],

    // Primitivism
    ["Large industry has to be broken up to save the planet.", 10, false],
    ["We need to reduce the human population.", 10, false],
    ["Humanity will not return to a primitive lifestyle.", 5, true],
    ["It is good to be poor because that uses less resources.", 5, false],

    // Vulgar materialism
    ["Muslim faith leads to violent extremism.", 20, false],
    ["Religion is meaningless.", 10, false],
    ["We should not always trust science.", 10, true],
    ["Materialists do not rely on faith or assumptions.", 5, false],
    ["Everything that is true can be measured and scientifically proven.", 5, false],

    // Being a loser
    ["I have never had a boyfriend/girlfriend because of capitalism.", 40, false],
    ["It is pointless to try to get a good-paying job, because capitalism ruins everything.", 20, false],
    ["Nobody wants to work.", 5, false],
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
    } else if (score < 0.08) {
        return ["Slight leftoid",
                "You have leftoid tendencies, but it isn't that bad.", true]
    } else if (score < 0.16) {
        return ["Average leftoid",
                "You're kind of a leftoid.", true]
    } else if (score < 0.24) {
        return ["Acute leftoid",
                "You have gone over the deep end.", true]
    } else if (score < 0.32) {
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
        } else {
            e_buttons.innerHTML = '';
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
