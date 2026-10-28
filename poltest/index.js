"use strict";

const antiCapitalistBranch = {};

const antiImperialistBranch = {
    _question: "What is imperialism?",
    "When a strong country invades a weak one": {
        _question: "Nazis invaded the USSR and lost. Therefore...?",
        "They were both imperialist": {
            _answer: "Pacifist",
            _description:
                "You want to end imperialism, but you're not willing to stand up to imperialism. Basically, you are not really political.",
        },
        "Russia only won because of the USA": {
            _answer: "No they didn't.",
            _description:
                "The west funded the rise of the Nazis and had close ties with the german industrialists who came to dominate the Nazi oligarchy, <a href=\"https://en.wikipedia.org/wiki/List_of_companies_involved_in_the_Holocaust\">such as Krupp</a>. They had full intention to use Germany as a battering ram against Communism, which was the catalyst for Hitler's rise. As Churchill said: 'Strangle the Bolshevik baby in its crib'. It wasn't until Pearl Harbor that the US even acted, 2 years after the war had started. Casualty-wise: half a million Americans, 25 million Soviets. Also, who planted the flag in Berlin? Lend-lease helped but Soviets did the main job. You can hit the back button now.",
        },
        "Good point": {
            _question: "I know. Hit the back button twice for me.",
        },
    },
    "A single global financial-military system based in the west.": {
        _question: "How will we end imperialism?",
        "Vote it out": {
            _question:
                "You really think your wishful pencil-marks will end the runaway military-industrial complex?",
            Yes: {
                _answer: "Naive Peacenik",
                _description:
                    "You've either convinced yourself that one of the big two parties cares about peace, or that your tiny third party stands a chance.",
            },
            No: {
                _answer: "Angry reformist",
                _description:
                    "You know that voting barely works, but your impulse is still to push the vote. You're on the right track, and Lenin's State and Revolution will get you there faster.",
            },
        },
        "Revolution in the first world": {
            _question: "How do you carry it out?",
            "Destroy the Commies": {
                _answer: "Dissident right",
                _description:
                    "Your heart is absolutely in the right place, but you've convinced yourself that the Communists are in power. In reality, the Communists are on your side and the anti-Communists are in power.",
            },
            "Destroy the conservatives": {
                _answer: "Radical Liberal",
                _description:
                    "The mirror image of the dissident right (your worst enemy), you blame conservatives for imperialism as opposed to 'Democrat Commies'. In reality, working-class conservatives are on your side and the 'liberals' in power are not.",
            },
            "Fight Capitalism": antiCapitalistBranch,
            "Rage against authority": {
                _answer: "Anarchist",
                _description:
                    "You're against the reality of Capitalism while believing its message about Communism. Disorganized action can never succeed more broadly. Look at the case of Mangione, what resulted? For this reason, anarchism is promoted widely in order to undermine Communism.",
            },
        },
        "Join the freedom fighters": {
            _answer: "Revolutionary defector",
            _description:
                "A rare breed: not just to agitate within your own country, but to work for the enemy. This is an extreme form of self-sacrifice, and few do it. Good luck and don't die.",
        },
    },
    "A capitalist country invading another country": {
        _answer: "Fake Leninist",
        _description:
            "For Lenin, imperialism is a unified system. To say that Russia has a mainly Capitalist economy does not therefore prove that it is part of this system. In fact, the Russian Communists wanted Putin to act sooner.",
    },
};

const sheeple = {
    _answer: "Pro-imperialist Sheep",
    _description:
        "How many millions of people have died at the hands of the US empire for you to go vote for an imperialist party? Did they deserve it? Did you forget?",
};

const humanistBranch = {
    _question: "What is best the humanity?",
    "End imperialism": antiImperialistBranch,
    "Tax the Rich": {
        _answer: "Social-Democrat",
        _description:
            "You really saw 'end imperialism' and still clicked on 'tax the rich' right below it. So you don't really know or care about genocide in Gaza, you just want free healthcare.",
    },
    "Preserve Pax Americana": {
        _answer: "Deluded Liberal",
        _description:
            "How many governments in the middle east and latin america does the US have to invade or overthrow before you realize this isn't a 'pax'?",
    },
    "America has to beat up the bad guys": {
        _answer: "Pro-imperialist",
        _description: "You're the bad guys.",
    },
};

const racist = {
    _answer: "Racist",
    _description:
        "You've let racial animosity get in the way of broader goals. You will most certainly be used as a tool of the ruling class in order to divide their enemies on racial lines.",
};

const revnatlib = {
    _answer: "Revolutionary Nationalist",
    _description: "Godspeed, brother. One day the chains will be broken.",
};

const nationalistBranch = {
    _question: "Who oppresses your nation?",
    Imperialists: antiImperialistBranch,
    Immigrants: {
        _question: "What is the issue with immigration?",
        "It infects our pure and virtuous blood": racist,
        "It is modern slavery": {
            _question: "How do we fight immigration, then?",
            "End imperialism": antiImperialistBranch,
            "Deport everyone": {
                _answer: "Immigration Extremist",
                _description:
                    "You'd prefer to deal with a symptom rather than the cause. Immigration will never disappear until you figure out who is behind it.",
            },
        },
    },
    Jews: {
        _question: "Which Jews?",
        "The Zionist Powers": {
            _answer: "Anti-Zionist",
            _description: "Inshallah you will be free.",
        },
        "All Jews": {
            _answer: "Antisemite",
            _description:
                "You correctly oppose Zionist influence, then turn around and blame innocent Jews. This behavior serves the Zionists, it makes anti-Zionism out to be some extreme conspiracy. How can you oppose even the Jews who oppose Zionism?",
        },
    },
    "A different race": {
        _question: "Why not band together and focus on a greater enemy?",
        Ok: humanistBranch,
        No: racist,
    },
};

const quizdata = {
    _question: "Who should politics serve?",
    Me: {
        _answer: "Narcissist",
        _description: "I hope you're just being provocative.",
    },
    "My Nation": {
        _question: "At the expense of others?",
        "Only oppressors.": nationalistBranch,
        "Yes, we are superior and must dominate.": {
            _answer: "Hyper-Nationalist",
            _description:
                "Resigned to be a flash in the pan of history, you will live and die for a single nation. Most of humanity will remember you as a shit stain, if they do at all.",
        },
    },
    Proletarians: {
        _answer: "'Identity' Marxist",
        _description:
            "It seems you're trying to be Marxist, but saying that politics should merely serve proletarians (often a minority) is wrong. A worker's dictatorship is as such because workers, collectively, are the most revolutionary class. Not because workers are good and the rest are evil.",
    },
    Humanity: humanistBranch,
    "Every living being": {
        _question: "This includes humans?",
        Yes: {
            _question:
                "For purposes of this quiz, assume the humans are vegan.",
            Ok: humanistBranch,
        },
        No: {
            _answer: "Animal Liberation",
            _description:
                "You're resigned to a permanent fringe of anti-humanism within a human society. Of course the ruling class funds these ideas, they want you to be useless and not care for the suffering of fellow man.",
        },
    },
};

const intro = {
    _question: `
<h1>Introduction</h1>
<p>The fastest and most correct political test in the universe. F*ck the compass. F*ck the axis tests. Politics isn't a spectrum, it is the science and the living logic of society.
<p>This is directed at Americans. If you're in the west, it's probably still relevant. If you're Russian — no idea.
`,
    "Begin Quiz": quizdata,
};

const e_question = document.getElementById("question");
const e_buttons = document.getElementById("buttons");
const e_back = document.getElementById("back");

let eb;
let question_list = [];

function do_quiz(quizdata) {
    // Questions
    let qhtml = "";

    if (quizdata._answer) {
        qhtml +=
            "<h1>Result: " +
            quizdata._answer +
            "</h1>" +
            quizdata._description +
            "";
    }
    if (quizdata._question) {
        qhtml += "<h2>" + quizdata._question + "</h2>";

        const buttonHTML = [];
        for (const answer in quizdata) {
            if (answer.charAt(0) === "_") continue;
            buttonHTML.push(
                `<div><button class="quizbutton" id="${answer + "button"}">${answer}</button></div>`,
            );
        }
        e_buttons.innerHTML = buttonHTML.join("");
        for (const answer in quizdata) {
            if (answer.charAt(0) === "_") continue;
            document
                .getElementById(answer + "button")
                .addEventListener("click", () => do_quiz(quizdata[answer]));
        }
    } else {
        e_buttons.innerHTML = "";
    }

    e_question.innerHTML = qhtml;

    // Back button
    question_list.push(quizdata);
    e_back.removeEventListener("click", eb);
    if (question_list.length > 1) {
        eb = () => {
            question_list.pop(); // remove current question
            do_quiz(question_list.pop());
        };
        e_back.addEventListener("click", eb);
        e_back.disabled = false;
    } else {
        e_back.disabled = true;
    }
}

do_quiz(intro);
