'use strict';

const marxist_branch = {
    _question:'The most efficient state is democratic and centralized. A democratic system, and after decisions are made, everyone must follow them.',
    'Yes.': {
        _question:'How much revolutionary potential is in the first world?',
        'Absolutely none.': {
            _answer:'Vulgar Third Worldism',
            _description:'This belief states that revolutionary struggles within the first world are completely invalid, rejecting the Marxist notion of revolution in developed capitalist society.',
        },
        'More than none.': {
            _question:'When will the class struggle be complete?',
            'When a worker\'s state has been established':{
                _answer:'Revisionism',
                _description:'Losing sight of the goal of communism, the Kruschev leadership prevented their country from reaching a higher stage of socialism, setting them on the long path back to capitalism. Doing little more than keeping the state in power, revisionists spell the downfall of socialism.',
            },
            'When society has become classless.':{
                _question:'Are there universal aspects to the revolutionary struggle?',
                'Yes, cultural revolution and onging people\'s war.': {
                    _answer:'Marxism-Leninism-Maoism',
                    _description:'Maoists are Marxist-Leninists who advance particular ideas of Stalin, and derive new set of strategies from Mao.',
                },
                'No.': {
                    _answer:'Marxism-Leninism',
                    _description:'This is most common and historically succesful variety of socialism, which was upheld by Stalin. Though not specifically Maoist, MLs still acknowledge Mao\'s contributions to socialism.',
                },
            },
            //            _answer:'Marxism-Leninism',
            //            _question:'What will the state be composed of?',
            //            'Worker\'s councils.': {
            //                _answer:'Marxism-Leninism (Stalinist/Hoxhaist)',
            //                _description:'Hoxhaists believe that the soviet system was the model socialist system, future socialist states should be based on it.'
            //            },
            //            'Local branches of the party.': {
            //            },
        },
    },
    'No, it should not be centralized.': {
        _answer:'Titoism',
        _description:'Yugoslavia followed some Marxist principles, but believed in decentralization and competetion, called worker self management. Their revolution fell to balkanization.',
    },
    'No, it should not be democratic.': {
        _answer:'National Bolshevism',
        _description:'A close cousin to the fascist, NazBols believe in some Marxist ideas, but do not believe in the democracy needed for a DoTP, and hold nationalist beliefs that run counter to marxism.',
    },
    'Yes, but abolish electoral democracy': {
        _answer:'Organic centralist ultra-leftism',
        _description:'Like Bordiga, these typically Italian people believe in an ideologically dissonant and non-democratic system, which gives power to people who get things done. This will make it very difficult to prevent abuses of power.',
    }
};

const anarchist_branch = {
    _answer: 'Anarchism',
    _description:'Seeing the individual as the most important unit of society, anarchists believe that the contradictory chaos of individual pursuits is somehow going to best serve the individuals involved.',
    _question:'How do you view the industrial revolution?',
    'The ruin of humanity.': {
        _answer:'Anarcho-Primitivism',
        _description:'Instead of advancing capitalism, AnPrims want to send us back in time. I don\'t look forward to this.',
    },
    'The advancement of humanity.': {
        _question:'How should things be decided?',
        'We will figure it out when we get there.': {
            _answer:'Anarchism without adjectives',
            _description:'Many anarchists believe we should support diverse ways of organizing, so long as they meet the critera of anarchism. This open-ended strategy trades away cohesion for popular support.',
        },
        'Councils of workers and everyday people.': {
            _answer:'Anarcho-Syndicalism',
            _description:'AnSynds believe that workers should run society, but that there should be an alternative power structure to replace the state based on transparency and public involevement.',
        },
        'Each community will decide what is in its best interests.': {
            _answer:'Anarcho-Communism',
            _description:'Beyond wanting communism right away, AnComs believe in a decentralized and self-managed system. This is similar to the goal of Marxism-Leninism, but I would argue that it is not currently feasible.',
        },
    },
};

const socdem_branch = {
    _answer:'Social-democracy',
    _description:'SocDems believe that we need some permutation of welfare programs, trade unions, taxation, regulation, etc. to keep capitalism in check. These policies are reversible and the capitalist class will overturn them over time, especially during one of the inevitable crises of capitalism.',
    _question:'How should capitalism be reformed?',
    'Give everyone money.': {
        _answer:'Universal Basic Income',
        _description:'UBI is the theory that giving everyone money, regardless of employment status, would create a fairer society. Unlike the claims made by some futurists, since UBI effectively lowers the minimum wage, it reduces automation because human laborers become less expensive than machines. Rent controls would also be required in order to prevent landlords from soaking up the added money. Employment insurance, sometimes called unemployment, is a more common system that does not have these problems.',
    },
    'The state should own some firms, or part of firms.': {
        _answer:'State Capitalism',
        _description:'This is capitalism with partial state ownership, maybe like Russia. This is going to be better or worse depending on the accountability of the state, and also on which firms are owned by the state, whether they are profit-driven, etc.',
    },
    'The state should provide free services to the people, feed the hungry, etc.': {
        _answer:'Welfare Capitalism',
        _description:'We can soften the blow of poverty and unemployment by giving to the victims of capitalism. It doesn\'t solve the problem, but it can reduce suffering.',
    },
    'A single tax based on unimproved land rent.': {
        _answer:'Georgism',
        _description:'Congratulations, you have seen the cat! This early theory about regulation of capitalism using land value tax has never been proven.',
    },
    'Provide government jobs for the unemployed and pay for it by printing money.': {
        _answer:'MMT',
        _description:'Modern Monetary Theory attemps to describe how money currently works, stating that it is possible to create social programs by printing money while curbing inflation. This rejects some aspects of Marxism, specifically the labor theory of value and currency arising from the commodity-form.',
    },
};

const quizdata = {
    _question:'Which type of economy better serves the people?',
    'A capitalist economy.': {
        _question:'How should we deal with the threat of communist revolution?',
        'Make capitalism more humanitarian.': {
            _question:'Who will hold the capitalist class accountable?',
            'The working class.': socdem_branch,
            'It will hold itself accountable.': {
                _answer:'Free-market capitalism',
                _description:'The capitalist class cannot be trusted to act against their own interests. This will create monopolies and a powerful oligarchy.',
            },
        },
        'Protect private property.': {
            _question:'Who will protect the property?',
            'The state.': {
                _question:'How will the state protect private property?',
                'Through dictatorship.': {
                    _answer:'Fascism',
                    _description:'When the ruling class is backed into a corner, they will undermine their "democracy" and begin political repression in order to stay in power. There will always be a point where this is the only way for capitalism to continue.',
                },
                'Through democracy.': {
                    _answer:'Liberalism',
                    _description:'Bourgeoise democracy only works as long as revolutionaries lack public support. If you want to protect private property, you must also protect the laws of the state from democracy, otherwise revolutionaries can vote themselves into power.',
                },
            },
            'The owners of the property.': {
                _answer:'Anarcho-Capitalism',
                _description:"An uncoordinated and uncentralized bourgeoise cannot repel a revolution. This ideology is based on the factually incorrect idea that capitalism can exist without a state. I can guarantee that you will not find examples of AnCap beliefs being put into practice, because they are a fantasy.",
            },
        },
    },
    'A semi-capitalist economy.': {
        _question:'Ok, what will happen with private property?',
        'Distribute it among the people.': {
            _answer:'Distributism',
            _description:'A Christian-influenced ideology, distributists believe that we need to distribute private property among people. This runs antithetical to the laws of capitalism, so I suppose it takes a little faith.',
        },
        'Let private property exist, but only when people are using it.': {
            _answer:'Mutualism',
            _description:'A synthesis of conflicting ideas, communism and the free market, Mutualism has never been proven in practice. Mutualists believe that everyone is entitled to the full product of their labor, and that private property should simply become public when not in use.',
        },
        'We will loan public property as private property for 50 years at a time.': {
            _answer:'Market Socialism',
            _description:'In China, they state that a partially state owned capitalist system paves an effective road to future socialism. This theory, established by Deng Xiaoping, is also called Socialism with Chinese Characteristics. China\'s main task is eliminating poverty and building productive forces.',
        },
    },
    'A non-capitalist economy.': {
        _question:'How will we abolish private property, which enables the minority rule of the capitalists?',
        'Change the law within capitalist systems.': {
            _question:'After our electoral victory, what will be done?',
            'That\'s it.': {
                _question:'You cannot achieve an end to capitalism just by changing who is in power. It is likely that you have misidentified social-democracy as socialism or as non-capitalistic.',
                'Ok.': socdem_branch,
            },
            'Workers unions must take over the state.': {
                _answer:'De Leonism',
                _description:'Similar to an anarcho-syndicalist, De Leonists believe a state composed of workers will arise if power is conceded to worker\'s unions through law. This relies on the existence of broad and powerful unions, which the state will always stop from becoming too powerful.',
            },
            'Reform the government to become socialist.': {
                _answer:'Democratic socialism',
                _description:'DemSocs want radical change to occur, but do not strike at the root of the problem. Though their goals are noble, they concede power to the capitalist class, who will prevent their success.',
            },
            'Anarchy!': {
                _question:'Most anarchists aren\'t foolish enough to think they can succeed in bourgeoise politics.',
                'Let me be anarchist anyway.': anarchist_branch,
            },
        },
        'Overthrow the capitalist class.': {
            _question:'What will be established in place of the capitalist state?',
            'A working-class government.': {
                _question:'What should the socialist state do first?',
                'Overthrow capitalist governments abroad.': {
                    _answer:'Trotskyism',
                    _description:'Believing that only a worldwide revolution is sustainable, Trots would hollow out their own country for the purpose of international warfare.',
                },
                'Build up their own country.': marxist_branch,
            },
            'A classless government.': {
                _answer:'Ultra-leftism',
                _description:'Not all ultra-leftists believe this, but the belief in instant communism is one type of it. Communism cannot happen right away, it would lead to labor shortages and a revolution incapable of defending itself.',
            },
            'Little to no government.': anarchist_branch,
        },
        'Do not abolish private property, because inequality is good.': {
            _answer:'Capitalism',
            _description:'Inequality is good for who? While acknowledging in back rooms that private property does not serve the people, capitalists selfishly insist that their minority rule must be preserved.',
        },
        'Wait for the inevitable nuclear warfare.': {
            _answer:'Posadism',
            _description:'Posadas, an Argentinian Trotskyist and noted organizer, thought that nuclear war was inevitable, and that traditional ideas about socialist revolution were foolishly optimistic.',
        },
    },
};

const intro = {
    _question:`
<p>Introduction</p>

<p>Hello, this is a quick political sorting test. It aims to differentiate
ideology from an opinionated Marxist-Leninist perspective in as few questions as
possible. This test is tree-structured, fundamentally different than a more
common slider or compass test. Each answer that you give will reveal a different
set of questions, and/or reveal a unqiue result. The <u>Back</u> button will
undo the previous response. If you do not like your result, utilize this
button.</p>

<p>If you have anything to change or add in this quiz, give feedback using the
email in the footer below. Before adding an ideology, it must have either have
some distinct group of adherents, or help to illustrate the differences between
ideologies.</p>

<a href="./info.txt">Some background and thought processes that went into this
quiz.</a>`,
    'Begin Quiz': quizdata,
};

const e_question = document.getElementById('question');
const e_buttons = document.getElementById('buttons');
const e_back = document.getElementById('back');

let eb
let question_list = [];

function do_quiz (quizdata) {
    // Questions
    let qhtml = '';

    if (quizdata._answer) {
        qhtml += '<p>You have just described ' + quizdata._answer + ': ' + quizdata._description + '</p>';
    }
    if (quizdata._question) {
        qhtml += quizdata._question;

        const buttonHTML = [];
        for (const answer in quizdata) {
            if (answer.charAt(0) === '_') continue;
            buttonHTML.push(`<div><button class="quizbutton" id="${answer + 'button'}">${answer}</button></div>`);
        }
        e_buttons.innerHTML = buttonHTML.join('');
        for (const answer in quizdata) {
            if (answer.charAt(0) === '_') continue;
            document.getElementById(answer + 'button').addEventListener('click', () => do_quiz(quizdata[answer]));
        }
    } else {
        e_buttons.innerHTML = '';
    }

    e_question.innerHTML = qhtml;

    // Back button
    question_list.push(quizdata);
    e_back.removeEventListener('click', eb);
    if (question_list.length > 1) {
        eb = () => {
            question_list.pop(); // remove current question
            do_quiz(question_list.pop());
        }
        e_back.addEventListener('click', eb);
        e_back.disabled = false;
    } else {
        e_back.disabled = true;
    }
}

do_quiz(intro);
