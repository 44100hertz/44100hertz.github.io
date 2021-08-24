'use strict';

const quiz = [
    // Imperialism
    ["We should apply the same ethical standards to every country.", 10],
    ["It is OK to invade another country to export liberal democracy.", 20],
    ["The US may be imperialist, but China is also.", 10],

    // Utopianism
    ["Start with the ideal society, and work from there.", 10],
    ["Socialism is primarily economic, not cultural.", 10, true],

    // Sex
    ["Bestiality should be made legal.", 10],
    ["Prostitution is liberating.", 5],
    ["Pornography can be harmful to society.", 5, true],
    ["We should not allow adults to have sex with children.", 10, true],
    ["We must dismantle the existing family structure.", 5],
    ["Fascism is the result of sexual repression.", 10],

    // Idpol
    ["We don't need to read books written by old dead white men.", 10],
    ["Karl Marx was thoroughly antisemitic.", 5],
    ["Socialism without LGBTQ+ rights is not socialism.", 5],
    ["The term 'Latinx' is preferable to Latino or Latina", 10],
    ["We can dismantle capitalism by dismantling patriarchy.", 10],
    ["White people in the US should go back to Europe.", 10],
    ["White and black people in the US are both suffering from poverty.", 5, true],

    // Reformism
    ["We can move towards socialism by voting for the lesser evil.", 5, true],
    ["The Nordic model is the best system to date.", 5],
    ["The Bolsheviks should have just ran for office instead of revolting.", 10],
    ["Revolution is immoral because it is violent.", 10],

    // Marxoid-ism
    ["Socialism can still have commodity production.", 10, true],
    ["Workers can benefit from profit.", 5, true],
    ["Vietnam can be considered socialist, even though it has markets.", 10, true],
    ["Venezuela can't be considered socialist, since it isn't explicitly Marxist.", 5],

    // Anarchism
    ["The black market is the way to freedom.", 10],
    ["It is good for some drugs to be illegal.", 10, true],
    ["Police and prisons must exist in every society.", 5, true],
    ["Abolish nations and borders.", 10],
    ["Politics only gets in the way of making real change.", 10],
    ["We must choose individualism over collectivism.", 10],
    ["To change the world, start by changing yourself.", 10],
    ["Kill and destroy whatever it is you hate, and others will follow.", 15],
    ["We don't need a state, we can just voluntarily exchange goods and services.", 10],

    // Primitivism
    ["Large industry has to be broken up to save the planet.", 10],
    ["We need to reduce the human population.", 10],

    // Vulgar materialism
    ["Religion is meaningless.", 10],
    ["Muslim faith leads to violent extremism.", 20],
    ["We should not always trust science.", 10, true],
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
                "You are based."]
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
                "Your politics is a complete joke. You probably struggle in everyday life."]
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
        e_question.innerHTML = `
<p>Result: ${result}</p>
<p>${description}</p>`;
        e_buttons.innerHTML = '';
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

    const btn_agree = document.getElementById('btn_agree');
    const btn_neutral = document.getElementById('btn_neutral');
    const btn_disagree = document.getElementById('btn_disagree');
    const btn_idk = document.getElementById('btn_idk');

    btn_agree.addEventListener('click', () => {
        total_weight += weight;
        if (!invert) score += weight;
        do_question(question_index + 1);
    })
    btn_neutral.addEventListener('click', () => {
        total_weight += weight / 2.0;
        do_question(question_index + 1);
    })
    btn_disagree.addEventListener('click', () => {
        total_weight += weight;
        if (invert) score += weight;
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
challenge the established US global order, or to offer a meaningful alternative. </p>

<p> The following questions will try to assess whether or not you are a leftoid,
and if so how severe of a problem it is.</p> `;
e_buttons.innerHTML = `<div><button class="quizbutton" id="btn_begin">Begin</div>`

const btn_begin = document.getElementById('btn_begin');
btn_begin.addEventListener('click', () => do_question(0));
