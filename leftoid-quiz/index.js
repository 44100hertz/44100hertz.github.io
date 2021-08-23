'use strict';

const quiz = [
    // Imperialism
    ["I apply the same ethical standard to every country on Earth.", 10],
    ["It is OK to invade other countries for humanitarian reasons.", 20],
    ["The US is may be imperialist, but China is also imperialist.", 10],

    // Utopianism
    ["Start with the ideal society, and work from there.", 10],
    ["Socialism starts with a critique of norms and culture.", 10],

    // Sex
    ["Bestiality is sometimes acceptable.", 10],
    ["Prostitution is liberating.", 5],
    ["Pornography is liberating.", 5],
    ["The age of consent is oppressive.", 10],
    ["We must dismantle the traditional family structure.", 5],
    ["Fascism is the result of sexual repression.", 10],

    // Idpol
    ["We don't need to read books written by old dead white men.", 10],
    ["Marx was antisemitic.", 5],
    ["Socialism without LGBTQ+ rights is not socialism.", 5],
    ["The proper term for Latino or Latina people is Latinx.", 10],
    ["We can dismantle capitalism by dismantling patriarchy.", 10],
    ["White people in the US need to go back to Europe.", 10],
    ["White people in the US are labor aristocracy, not workers.", 5],

    // Reformism
    ["We have an obligation to vote for the sake of harm reduction.", 5],
    ["The Nordic model is the best system to date.", 5],
    ["The Bolsheviks should have just ran for office instead of revolting.", 10],
    ["Revolution is immoral because it is violent.", 10],

    // Marxoid-ism
    ["Socialism means the abolition of commodity production.", 10],
    ["Profit harms workers.", 5],
    ["Vietnam can't be considered socialist, since it has markets.", 10],
    ["Venezuela can't be considered socialist, since it isn't explicitly Marxist.", 5],

    // Anarchism
    ["The black market is the way to freedom.", 10],
    ["Selling or using drugs is liberating.", 10],
    ["We do not need police and prisons.", 5],
    ["Abolish nations and borders.", 10],
    ["Politics only gets in the way of making real change.", 10],
    ["We must choose individualism over collectivism.", 10],
    ["To change the world, start by changing yourself.", 10],
    ["Kill and destroy whatever it is you hate, and others will follow.", 15],
    ["We don't need a state, we can just voluntarily exchange goods and services.", 10],

    // Primitivism
    ["Large industry has to be broken up to save the planet.", 10],
    ["We need to reduce the population.", 10],
    ["The human lifestyle has become too costly for the planet.", 5],

    // Vulgar materialism
    ["Religion is meaningless.", 10],
    ["Muslim faith leads to violent extremism.", 20],
    ["We should always trust science.", 10],
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
challenge the established US global order, or to offer a meaningful alternative. </p>

<p> The following questions will try to assess whether or not you are a leftoid,
and if so how severe of a problem it is.</p> `;
e_buttons.innerHTML = `<div><button class="quizbutton" id="btn_begin">Begin</div>`

const btn_begin = document.getElementById('btn_begin');
btn_begin.addEventListener('click', () => do_question(0));
