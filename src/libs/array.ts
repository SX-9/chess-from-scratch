import { Square, Color, CastlingRights, Piece } from "./types.ts";

export class BoardArray {
  fen: string = "";
  board: Piece[] = [];
  turn: Color = "";
  castling: CastlingRights = {
    w: { k: false, q: false },
    b: { k: false, q: false },
  };
  enPassant: Square = null;
  halfMove: number = 0;
  fullMove: number = 0;

  constructor(fen: string | BoardArray | null) {
    if (!fen)
      this.fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0";
    else {
      if (fen instanceof BoardArray) {
        this.fen = Object.assign({}, fen.fen);
        this.board = Object.assign({}, fen.board);
        this.turn = Object.assign({}, fen.turn);
        this.castling = Object.assign({}, fen.castling);
        this.enPassant = Object.assign({}, fen.enPassant);
        this.halfMove = Object.assign({}, fen.halfMove);
        this.fullMove = Object.assign({}, fen.fullMove);
        return;
      } else this.fen = fen
    };

    this.fen.split(" ").forEach((part: any, i) => {
      switch (i) {
        case 0:
          if (!part.includes("K") || !part.includes("k"))
            throw new Error("No king on board");
          this.board = new Array(64).fill(false);
          let boardPointer = 0;
          for (let char of part
            .split(" ")[0]
            .split("")
            .filter((c: String) => c !== "/")) {
            if (isNaN(char)) {
              this.board[boardPointer] = char as Piece;
              boardPointer++;
            } else {
              boardPointer += parseInt(char);
            }
          }
          break;
        case 1:
          this.turn = part;
          break;
        case 2:
          this.castling = {
            w: { k: part.includes("K"), q: part.includes("Q") },
            b: { k: part.includes("k"), q: part.includes("q") },
          };
          break;
        case 3:
          if (part === "-") this.enPassant = null;
          else this.enPassant = part;
          break;
        case 4:
          this.halfMove = parseInt(part);
          break;
        case 5:
          this.fullMove = parseInt(part);
          break;
      }
    });
  }

  movePiece(from: Square, to: Square) {
    if (from === to || from === null || to === null) return;
    this.board[to] = this.board[from];
    this.board[from] = null;
  }

  setPiece(piece: Piece, square: Square) {
    if (square === null) return;
    this.board[square] = piece;
  }

  switchTurn() {
    this.turn = this.turn === "w" ? "b" : "w";
  }
}

export class Highlights {
  highlights: Boolean[];
  constructor() {
    this.highlights = new Array(64).fill(false);
  }

  toggleHighlight(square: Square) {
    if (square === null) return;
    this.highlights[square] = !this.highlights[square];
  }

  addHighlight(square: Square) {
    if (square === null) return;
    this.highlights[square] = true;
  }

  removeHighlight(square: Square) {
    if (square === null) return;
    this.highlights[square] = false;
  }

  clearHighlights() {
    this.highlights = new Array(64).fill(false);
  }
}
