let board = document.getElementById("board");

let positions = [0, 0];

let player = 0;

let gameOver = false;

// Snakes: Head -> Tail
let snakes = {
    99: 54,
    70: 55,
    52: 42,
    25: 2
};

// Ladders: Bottom -> Top
let ladders = {
    6: 25,
    11: 40,
    46: 90,
    60: 85
};

// Create board
function createBoard() {

    board.innerHTML = "";

    for (let i = 100; i >= 1; i--) {

        let cell = document.createElement("div");

        cell.className = "cell";
        cell.id = "box" + i;

        if (snakes[i]) {
            cell.classList.add("snake");
            cell.innerHTML = i + "<br>🐍";
        }

        else if (ladders[i]) {
            cell.classList.add("ladder");
            cell.innerHTML = i + "<br>🪜";
        }

        else {
            cell.innerHTML = i;
        }

        board.appendChild(cell);
    }

    updatePlayers();
}

// Update players
function updatePlayers() {

    // Reset board
    document.querySelectorAll(".cell").forEach(cell => {

        let number = cell.id.replace("box", "");

        if (snakes[number]) {
            cell.innerHTML = number + "<br>🐍";
        }

        else if (ladders[number]) {
            cell.innerHTML = number + "<br>🪜";
        }

        else {
            cell.innerHTML = number;
        }
    });

    // Show player positions
    positions.forEach((pos, index) => {

        if (pos > 0) {

            let cell = document.getElementById("box" + pos);

            cell.innerHTML += index === 0
                ? "<div class='players'>🔴 P1</div>"
                : "<div class='players'>🔵 P2</div>";
        }
    });
}

// Roll dice
function rollDice() {

    if (gameOver) return;

    let dice = Math.floor(Math.random() * 6) + 1;

    document.getElementById("dice").innerHTML =
        "Dice: " + dice;

    let newPosition = positions[player] + dice;

    if (newPosition > 100) {

        document.getElementById("turn").innerHTML =
            "Need exact number to reach 100!";

    }

    else {

        positions[player] = newPosition;

        // Check snake
        if (snakes[newPosition]) {

            positions[player] = snakes[newPosition];

            alert("Oh no! Snake bite! 🐍");
        }

        // Check ladder
        else if (ladders[newPosition]) {

            positions[player] = ladders[newPosition];

            alert("Great! You climbed a ladder! 🪜");
        }

        updatePlayers();

        // Check winner
        if (positions[player] === 100) {

            document.getElementById("turn").innerHTML =
                "🎉 Player " + (player + 1) + " Wins!";

            gameOver = true;

            return;
        }
    }

    // Change player
    player = player === 0 ? 1 : 0;

    if (!gameOver) {
        document.getElementById("turn").innerHTML =
            "Player " + (player + 1) + " Turn";
    }
}

// Restart game
function restartGame() {

    positions = [0, 0];

    player = 0;

    gameOver = false;

    document.getElementById("dice").innerHTML = "Dice: 0";

    document.getElementById("turn").innerHTML =
        "Player 1 Turn";

    createBoard();
}

// Start game
createBoard();
