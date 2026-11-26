let board = document.getElementById("chessboard");

// Apply CSS using JavaScript
board.style.width = "400px";
board.style.height = "400px";
board.style.display = "grid";
board.style.gridTemplateColumns = "repeat(8, 1fr)";
board.style.border = "3px solid black";
board.style.margin = "50px auto";

// Chess pieces
let pieces = [
    "♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜",
    "♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟",
    "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "",
    "♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙",
    "♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"
];

// Create 64 squares
for (let i = 0; i < 64; i++) {

    let square = document.createElement("div");

    // Add chess pieces
    square.innerText = pieces[i];

    // Set square size
    square.style.width = "50px";
    square.style.height = "50px";

    // Set square colors
    if (Math.floor(i / 8) % 2 === 0) {
        square.style.backgroundColor =
            i % 2 === 0 ? "white" : "gray";
    } else {
        square.style.backgroundColor =
            i % 2 === 0 ? "gray" : "white";
    }

    // Center chess pieces
    square.style.display = "flex";
    square.style.justifyContent = "center";
    square.style.alignItems = "center";

    // Piece size
    square.style.fontSize = "35px";

    // Add square to board
    board.appendChild(square);
}
