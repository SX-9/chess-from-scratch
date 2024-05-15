import { Move, Square, SquareXYoffset, Piece, AxisVal } from "./types";
import { BoardArray } from "./array";
import utils from "./utils";

export class MoveGenerator {
  board: BoardArray = new BoardArray(null);
  moves: Move[] = [];
  history: Move[] = [];

  load(board: BoardArray) {
    this.board = board;
    this.moves = [];
    this.history = [];
  }

  generate(square: Square, noReset?: boolean) {
    this.generatePseudo(square, noReset);

    return this.moves;
  }

  generateAll() {
    this.moves = [];
    for (let i = 0; i < 64; i++) {
      this.generate(i as Square, true);
    }
    return this.moves;
  }

  generatePseudo(square: Square, noReset?: boolean) {
    if (!noReset) this.moves = [];
    if (square === null) return this.moves;
    const piece = this.board.board[square];
    const turn = this.board.turn;
    const isWhiteTurn = turn === "w";
    if (!piece || utils.isWhitePiece(piece) !== isWhiteTurn) return this.move;

    switch (piece.toLowerCase()) {
      case "p":
        this.generatePawn(square);
        break;
      case "n":
        this.generateKnight(square);
        break;
      case "k":
        this.generateKing(square);
        break;
      default:
        this.generateSliding(square);
        break;
    }
    return this.moves;
  }

  generatePawn(square: Square) {
    if (square === null) return;
    const piece = this.board.board[square];
    if (!piece) return;
    debugger
    const direction = utils.isWhitePiece(piece) ? -8 : 8;
    const in1stRank = utils.getFileRank(square).rank === (utils.isWhitePiece(piece) ? 6 : 1);
    const squareInFrontFR = utils.getFileRank(square + direction as Square);
    const leftCapture = utils.getIndex(squareInFrontFR.file - 1 as AxisVal, squareInFrontFR.rank);
    const rightCapture = utils.getIndex(squareInFrontFR.file + 1 as AxisVal, squareInFrontFR.rank);

    if (in1stRank && !this.board.board[square + direction] && !this.board.board[square + (direction * 2)]) {
      const target = square + (direction * 2);
      this.addMoveInternal(square, target as Square);
      if ( (this.board.board[target + 1] && utils.isWhitePiece(this.board.board[target + 1]) !== (this.board.turn === 'w') && this.board.board[target + 1]?.toLowerCase() === "p") 
        || (this.board.board[target - 1] && utils.isWhitePiece(this.board.board[target - 1]) !== (this.board.turn === 'w') && this.board.board[target - 1]?.toLowerCase() === "p")) {
        this.board.enPassant = target - direction as Square;
      }
    }

    if (!this.board.board[square + direction]) {
      const target = square + direction;
      this.addMoveInternal(square, target as Square);
    }

    if (leftCapture !== null && this.board.board[leftCapture] && utils.isWhitePiece(this.board.board[leftCapture]) !== utils.isWhitePiece(piece)) {
      this.addMoveInternal(square, leftCapture as Square);
    }

    if (rightCapture !== null && this.board.board[rightCapture] && utils.isWhitePiece(this.board.board[rightCapture]) !== utils.isWhitePiece(piece)) {
      this.addMoveInternal(square, rightCapture as Square);
    }

    if ([leftCapture, rightCapture].includes(this.board.enPassant as Square)) {
      this.addMoveInternal(square, this.board.enPassant);
    }

    return this.moves;
  }

  generateKnight(square: Square) {
    if (square === null) return;
    const piece = this.board.board[square];
    if (!piece) return;

    const offsets: SquareXYoffset[] = [
      { file: -1, rank: -2 },
      { file: 1, rank: -2 },
      { file: -2, rank: -1 },
      { file: 2, rank: -1 },
      { file: -2, rank: 1 },
      { file: 2, rank: 1 },
      { file: -1, rank: 2 },
      { file: 1, rank: 2 },
    ];

    offsets.forEach((offset) => {
      const targetFile = utils.getFileRank(square).file + offset.file as AxisVal;
      const targetRank = utils.getFileRank(square).rank + offset.rank as AxisVal;
      const target = utils.getIndex(targetFile, targetRank);
      if (target === null) return;
      const targetPiece = this.board.board[target];
      if (targetPiece && utils.isWhitePiece(targetPiece) === utils.isWhitePiece(piece)) return;
      this.addMoveInternal(square, target);
    });

    return this.moves;
  }

  generateKing(square: Square) {
    if (square === null) return;
    const piece = this.board.board[square];
    if (!piece) return;
    const isWhite = utils.isWhitePiece(piece);
    const castlingRights = isWhite ? this.board.castling.w : this.board.castling.b;

    const offsets: SquareXYoffset[] = [
      { file: -1, rank: -1 },
      { file: 0, rank: -1 },
      { file: 1, rank: -1 },
      { file: -1, rank: 0 },
      { file: 1, rank: 0 },
      { file: -1, rank: 1 },
      { file: 0, rank: 1 },
      { file: 1, rank: 1 },
    ];

    offsets.forEach((offset) => {
      const target = utils.getIndex(
        utils.getFileRank(square).file + offset.file as AxisVal, 
        utils.getFileRank(square).rank + offset.rank as AxisVal
      );
      if (target === null) return;
      const targetPiece = this.board.board[target];
      if (targetPiece && utils.isWhitePiece(targetPiece) === isWhite) return;
      this.addMoveInternal(square, target);
    });

    if (!isWhite) {
      if (castlingRights.k && !this.board.board[5] && !this.board.board[6]) {
        this.addMoveInternal(square, 6);
      }
      if (castlingRights.q && !this.board.board[3] && !this.board.board[2] && !this.board.board[1]) {
        this.addMoveInternal(square, 2);
      }
    } else {
      if (castlingRights.k && !this.board.board[61] && !this.board.board[62]) {
        this.addMoveInternal(square, 62);
      }
      if (castlingRights.q && !this.board.board[59] && !this.board.board[58] && !this.board.board[57]) {
        this.addMoveInternal(square, 58);
      }
    }

    return this.moves;
  }

  generateSliding(square: Square) {
    if (square === null) return;
    const piece = this.board.board[square];
    if (!piece) return;
    const start = 'qr'.includes(piece.toLowerCase()) ? 0 : 4;
    const end = 'qb'.includes(piece.toLowerCase()) ? 8 : 4;
    const offsets = [
      8, -8, 1, -1, 7, -7, 9, -9,
    ].slice(start, end);

    offsets.forEach((offset) => this.generateSlidingDirection(square, offset));

    return this.moves;
  }

  generateSlidingDirection(square: Square, direction: number) {
    if (square === null) return;
    const nSquaresTillEdge = utils.nSquaresTillEdge(square, direction);
    if (nSquaresTillEdge === 0) return;
    for (let i = 1; i < nSquaresTillEdge; i++) {
      const target = square + (direction * i);
      const piece = this.board.board[target];
      if (piece) {
        if (utils.isWhitePiece(piece) === utils.isWhitePiece(this.board.board[square])) return;
        this.addMoveInternal(square, target as Square);
        return;
      }
      this.addMoveInternal(square, target as Square);
    }
  }

  addMoveInternal(from: Square, to: Square) {
    if (from === null || to === null) return;
    const move: Move = { 
      from, to,
      turn: this.board.turn,
      piece: this.board.board[from],
      enPassant: this.board.enPassant === to,
      castling: this.board.board[from]?.toLowerCase() === "k" && [2, 6, 58, 62].includes(to),
      capture: !!this.board.board[to] || this.board.enPassant === to,
      // kingCapture: this.board.board[to]?.toLowerCase() === "k",
    };
    this.moves.push(move);
  }

  changeDetails() {
    const lastMove = this.history[this.history.length - 1];
    const isWhite = lastMove.piece ? utils.isWhitePiece(lastMove.piece) : false;
    
    this.board.halfMove++;
    if (this.board.turn === "w") this.board.fullMove++;

    switch (lastMove.piece?.toLocaleLowerCase()) {
      case "p":
        this.board.halfMove = 0;
        break;
      case "k":
        if (isWhite) {
          this.board.castling.w.k = false;
          this.board.castling.w.q = false;
        } else {
          this.board.castling.b.k = false;
          this.board.castling.b.q = false;
        }
        break;
      case "r":
        if (isWhite) {
          if (lastMove.from === 56) this.board.castling.w.q = false;
          if (lastMove.from === 63) this.board.castling.w.k = false;
        } else {
          if (lastMove.from === 0) this.board.castling.b.q = false;
          if (lastMove.from === 7) this.board.castling.b.k = false;
        }
        break;
    }

    if (lastMove.capture) {
      this.board.halfMove = 0;
      switch (lastMove.to) {
        case 0:
          this.board.castling.b.q = false;
          break;
        case 7:
          this.board.castling.b.k = false;
          break;
        case 56:
          this.board.castling.w.q = false;
          break;
        case 63:
          this.board.castling.w.k = false;
          break;
      }
    }
  }

  move(move: Move, pseudoLegalCheck?: boolean) {
    if (!pseudoLegalCheck) this.generate(move.from);
    else this.generatePseudo(move.from);

    const legalMoves = this.moves.map((e) => utils.moveIdentifier(e));
    if (!legalMoves.includes(utils.moveIdentifier(move))) return false;
    const index = legalMoves.indexOf(utils.moveIdentifier(move));
    const moveComplete = this.moves[index];
    this.board.movePiece(move.from, move.to);
    
    if (moveComplete.castling) {
      switch (move.to) {
        case 2:
          this.board.movePiece(0, 3);
          break;
        case 6:
          this.board.movePiece(7, 5);
          break;
        case 58:
          this.board.movePiece(56, 59);
          break;
        case 62:
          this.board.movePiece(63, 61);
          break;
      }
    }
    
    if (moveComplete.piece?.toLowerCase() === "p" && moveComplete.to !== null && (moveComplete.to < 8 || moveComplete.to > 55)) {
      const isWhiteTurn = this.board.turn === "w";
      const queen = isWhiteTurn ? "Q" : "q";
      const promotion = isWhiteTurn ? move.promotion?.toUpperCase() as Piece : move.promotion || queen;
      this.board.setPiece(promotion, moveComplete.to);
      moveComplete.promotion = promotion;
    }

    if (moveComplete.enPassant) {
      const backPawn = this.board.enPassant as number - (this.board.turn === 'b' ? 8 : -8);
      this.board.setPiece(null, backPawn as Square);
      this.board.enPassant = null;
    } else if (this.board.enPassant && moveComplete.piece?.toLowerCase() !== "p") {
      this.board.enPassant = null;
    }
    this.history.push(moveComplete);
    this.board.switchTurn();
    this.changeDetails();
    return true;
  }
}