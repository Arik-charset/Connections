const COLORS = [
    {
        buttonGreen: "soon"
    }
]

const GROUPS = [
    {
        subject: "KIND OF PIANOS",
        words: ['ELECTRONIC', 'GRAND', 'PLAYER', 'UPRIGHT'],
        difficulty: 'yellow'
    },
    {
        subject: "DEEM",
        words: ['CONSIDER', 'COUNT', 'JUDGE', 'REGARD'],
        difficulty: 'green'
    },
        {
        subject: "U.S COLLEGES/UNIVERSITIES",
        words: ['BROWN', 'DUKE', 'HOWARD', 'SMITH'],
        difficulty: 'blue'
    },
        {
        subject: "PALINDROMES",
        words: ['KAYAK', 'LEVEL', 'MOM', 'RACE CAR'],
        difficulty: 'purple'
    },
]

const randomInt = (k) => Math.floor((k + 1) * Math.random());
const fisherYatesShuffle = (arr) => { // https://dev.to/asayerio_techblog/forever-functional-shuffling-an-array-not-as-trivial-as-it-sounds-2a3b
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const board = document.getElementById('board');

let allWords = GROUPS.flatMap(c => c.words);
allWords = fisherYatesShuffle(allWords);

let selectedButtons = [];

const previousGuesses = new Set();

let remainingLives = 4;

allWords.forEach(word => { // Create word elements
    const button = document.createElement('button');
    button.classList.add('word_button', 'color_default');
    button.textContent = word;
    button.onclick = () => wordSelect(button);
    board.appendChild(button);
})

function getGroup(button) { // Find group of word
    return GROUPS.find(c => c.words.includes(button.textContent));
}

document.getElementById('guess-button').disabled = true; // at start
document.getElementById('deselect-button').disabled = true; // at start

let guessKey;

function wordSelect(button) {
    const index = selectedButtons.indexOf(button);

    if (index > -1) { // If selected, deselect
        selectedButtons.splice(index, 1);
        button.classList.remove('selected_button');
    } else if (selectedButtons.length < 4) { // Select
        selectedButtons.push(button);
        button.classList.add('selected_button');
    }
    guessKey = selectedButtons.map(b => b.textContent).sort().join(',');
    document.getElementById('guess-button').disabled = selectedButtons.length !== 4 || previousGuesses.has(guessKey);
    document.getElementById('deselect-button').disabled = selectedButtons.length === 0;
}

async function animateSelectedButtons(success) {
    const buttons = [...selectedButtons].sort((a, b) => 
        a.getBoundingClientRect().left - b.getBoundingClientRect().left
    );
    return new Promise(resolve => {
        buttons.forEach((button, i) => {
            setTimeout(() => {
                button.classList.add('pop');
                button.addEventListener('animationend', () => {
                    button.classList.remove('pop');
                    if (i === buttons.length - 1) {
                        if (!success) {
                            setTimeout(() => {
                                buttons.forEach(b => {
                                    b.classList.add('shake');
                                    b.addEventListener('animationend', () => b.classList.remove('shake'), { once: true });
                                });
                                resolve();
                            }, 400);
                        } else {
                            resolve();
                        }
                    }
                }, { once: true });
            }, i * 120);
        });
    });
}
document.getElementById('guess-button').onclick = async () => {

    const matchingGroup = GROUPS.find(group => {
        return selectedButtons.every(button => group.words.includes(button.textContent))
    });

    await animateSelectedButtons(!!matchingGroup);

    if (matchingGroup) {
        solveButtons();
    } else {
        previousGuesses.add(guessKey);
        remainingLives--;
        document.querySelectorAll('.mark')[remainingLives].classList.add('guessed');

        document.getElementById('guess-button').disabled = true; // Gray out guess
    }
}


function solveButtons() {
    const currentGroup = getGroup(selectedButtons[0]); // Lasy with index, but works :)

    const solvedRow = document.createElement('div');
    solvedRow.classList.add('solved_row', currentGroup.difficulty);

    solvedRow.innerHTML = `
        <div class="group-info">
            <h3>${currentGroup.subject}</h3>
            <p>${currentGroup.words.join(', ')}</p>
        </div>
    `;

    selectedButtons.forEach(button => {
        button.remove();
    });
    selectedButtons = [];
    document.getElementById('guess-button').disabled = true; // Gray out guess button
    document.getElementById('deselect-button').disabled = true // Gray out deselect button
    document.getElementById('solved').appendChild(solvedRow);
}

document.getElementById('shuffle-button').addEventListener('click', () => {
    const buttons = [...board.children];
    const unselected = buttons.filter(b => !b.classList.contains('selected_button'));
    const selected = buttons.filter(b => b.classList.contains('selected_button'));
    fisherYatesShuffle(unselected).concat(selected).forEach(button => board.appendChild(button));
});

document.getElementById('deselect-button').onclick = () => {
    selectedButtons.forEach(button => {
        button.classList.remove('selected_button');
    });
    selectedButtons = [];
    document.getElementById('deselect-button').disabled = true;
};