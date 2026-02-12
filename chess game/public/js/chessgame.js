const socket = io();
const chess = new Chess();
const boardelement = document.getElementById("chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null; // "w" | "b"

/* ================= RENDER BOARD ================= */
const renderboard = () => {
  const board = chess.board();
  boardelement.innerHTML = "";

  board.forEach((row, rowIndex) => {
    row.forEach((square, colIndex) => {
      const squareElement = document.createElement("div");

      squareElement.classList.add(
        "square",
        (rowIndex + colIndex) % 2 === 0 ? "light" : "dark"
      );

      squareElement.dataset.row = rowIndex;
      squareElement.dataset.col = colIndex;

      if (square) {
        const pieceElement = document.createElement("div");

        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );

        pieceElement.innerText = getpieceUnicode(square);

        // ✅ white sirf white chala sakta, black sirf black
        pieceElement.draggable = square.color === playerRole;

        pieceElement.addEventListener("dragstart", () => {
          if (!pieceElement.draggable) return;
          draggedPiece = pieceElement;
          sourceSquare = { row: rowIndex, col: colIndex };
        });

        pieceElement.addEventListener("dragend", () => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener("dragover", (e) => e.preventDefault());

      squareElement.addEventListener("drop", () => {
        if (!draggedPiece || !sourceSquare) return;

        const targetSquare = { row: rowIndex, col: colIndex };
        handlemove(sourceSquare, targetSquare);
      });

      boardelement.appendChild(squareElement);
    });
  });
};

/* ================= MOVE HANDLER ================= */
const handlemove = (sourceSquare, targetSquare) => {
  const move = {
    from:
      String.fromCharCode(97 + sourceSquare.col) +
      (8 - sourceSquare.row),
    to:
      String.fromCharCode(97 + targetSquare.col) +
      (8 - targetSquare.row),
    promotion: "q",
  };

  socket.emit("move", move);
};

/* ================= UNICODE PIECES ================= */
const getpieceUnicode = (piece) => {
  const unicodePieces = {
    p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚",
    P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔",
  };

  const key =
    piece.color === "w"
      ? piece.type.toUpperCase()
      : piece.type;

  return unicodePieces[key];
};

/* ================= SOCKET EVENTS ================= */
socket.on("playerRole", (role) => {
  playerRole = role; // "w" or "b"
  renderboard();
});

socket.on("spectatorRole", () => {
  playerRole = null;
  renderboard();
});

socket.on("move", (move) => {
  chess.move(move);
  renderboard();
});

socket.on("boardState", (fen) => {
  chess.load(fen);
  renderboard();
});

renderboard();
