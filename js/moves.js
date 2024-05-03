export class MoveGeneration {
  constructor(config) {
    this.board = new Array(64);
    this.moves = new Array(64);
    this.config = config;
    this.config.offsets = [
      8, -8, -1, 1, 7, -7, 9, -9
    ];

    this.gameOver = false;
    this.turn = 'w';
    this.history = [];

    // this.history contains objects that has the following properties:
    // from and to: the indexes of the squares that the piece moved from and to
    // piece: the piece that moved
    // captured: the piece that was captured
    // promotion: the piece that the pawn was promoted to
    // castling: the rook that was moved in a castling move
    // enPassant: the square that the pawn moved to in an en passant move

    // this.moves contains arrays
    // the element index is the index on the board
    // if the element is undefined, there are no pieces that can move to that square
    // if the element is an array, the array contains the pieces square index that can move to that square
  }

  load(board, turn) {
    this.board = board ?? new Array(64);
    this.turn = turn ?? 'w';
    let isOver = false;

    if (isOver) {
      this.gameOver = true;
      this.config?.onEnd();
    }
  }

  generate() {
    this.initMovesArray();
    
    for (let squareIndex = 0; squareIndex < 64; squareIndex++) {
      const piece = this.board[squareIndex];
      if (!piece) continue;

      const color = this.utils.isWhitePiece(piece) ? 'w' : 'b';
      if (color !== this.turn) continue;

      if (this.utils.isSliding(piece)) {
        this.generateSliding(squareIndex);
      } else {
        switch (piece.toLowerCase()) {
          case 'p':
            this.generatePawn(squareIndex);
            break;
          case 'n':
            this.generateKnight(squareIndex);
            break;
          case 'k':
            this.generateKing(squareIndex);
            break;
        }
      }
    }

    return this.moves;
  }

  generateSliding(squareIndex) {
    const piece = this.board[squareIndex];
    if (!piece) return;
    const [dirStart, dirEnd] = [
      'qr'.includes(piece.toLowerCase()) ? 0 : 4,
      'qb'.includes(piece.toLowerCase()) ? 8 : 4,
    ];

    // if (piece.toLowerCase() === 'r') debugger
    this.config.offsets.slice(dirStart, dirEnd).forEach(dir => this.generateSlidingDirection(squareIndex, dir));
  }

  generateSlidingDirection(squareIndex, direction) {
    const piece = this.board[squareIndex];
    if (!piece) return;
    const isWhite = this.utils.isWhitePiece(piece);
    
    const nSquaresTillEdge = this.utils.nSquaresTillEdge(squareIndex, direction);

    for (let i = 1; i <= nSquaresTillEdge; i++) {
      const targetIndex = squareIndex + direction * i;
      if (this.board[targetIndex] && isWhite === this.utils.isWhitePiece(this.board[targetIndex])) break;
      this.addMoves(targetIndex, squareIndex);
      if (this.board[targetIndex] && isWhite !== this.utils.isWhitePiece(this.board[targetIndex])) break;
    }
  }

  generatePawn(squareIndex) {
    const piece = this.board[squareIndex];
    if (!piece) return;
    const isWhite = this.utils.isWhitePiece(piece);
    const direction = this.config.offsets[isWhite?1:0];
    
    const rank = this.utils.getFileRank(squareIndex).rank;
    const onFirstRank = isWhite ? rank === 6 : rank === 1;
    if (!this.board[squareIndex + direction]) {
      this.addMoves(squareIndex + direction, squareIndex);
      if (onFirstRank && !this.board[squareIndex + direction * 2]) {
        this.addMoves(squareIndex + direction * 2, squareIndex);
      }
    }

    const rightCapture = squareIndex + direction + 1;
    if (
      this.board[rightCapture] && 
      isWhite !== this.utils.isWhitePiece(this.board[rightCapture])
    ) this.addMoves(rightCapture, squareIndex);
    
    const leftCapture = squareIndex + direction - 1;
    if (
      this.board[leftCapture] &&
      isWhite !== this.utils.isWhitePiece(this.board[leftCapture])
    ) this.addMoves(leftCapture, squareIndex);
  }

  generateKnight(squareIndex) {
    const piece = this.board[squareIndex];
    if (!piece) return;
    const isWhite = this.utils.isWhitePiece(piece);
    const directions = [
      6, 10, 15, 17, -6, -10, -15, -17
    ];

    for (const direction of directions) {
      const targetIndex = squareIndex + direction;
      if (targetIndex < 0 || targetIndex > 63) continue;
      if (this.board[targetIndex] && isWhite === this.utils.isWhitePiece(this.board[targetIndex])) continue;
      this.addMoves(targetIndex, squareIndex);
    }
  }

  generateKing(squareIndex) {
    const piece = this.board[squareIndex];
    if (!piece) return;
    const isWhite = this.utils.isWhitePiece(piece);
    const directions = this.config.offsets;

    for (const direction of directions) {
      const targetIndex = squareIndex + direction;
      if (targetIndex < 0 || targetIndex > 63) continue;
      if (this.board[targetIndex] && isWhite === this.utils.isWhitePiece(this.board[targetIndex])) continue;
      this.addMoves(targetIndex, squareIndex);
    }
  }

  initMovesArray() {
    for (let i = 0; i < 64; i++) {
      this.moves[i] = [];
    }
  }

  addMoves(targetIndex, squareIndex) {
    try {
      this.moves[targetIndex].push(squareIndex);
    } catch (e) {
      console.error(`addMoves(${targetIndex}, ${squareIndex}) // ${e.message}`);
    }
  }
  
  removePiece(index) {
    this.board[index] = false;
  }
  
  utils = {
    nSquaresTillEdge(index, direction) {
      const edges = [
        0, 7, 56, 63, // corners
        1, 2, 3, 4, 5, 6, // up
        8, 16, 24, 32, 40, 48, // left
        57, 58, 59, 60, 61, 62, // down
        15, 23, 31, 39, 47, 55, // right
      ];

      let count = 0;
      while (!edges.includes(index)) {
        index += direction;
        count++;
      }
      return count;
    },

    asciiString(board) {
      let ascii = '';
      for (let i = 0; i < 64; i++) {
        ascii += board[i] || '.';
        if (i % 8 === 7) ascii += '\n';
      }
      return ascii;
    },
  
    invertTurn(currentTurn) {
      return currentTurn === 'b' ? 'w' : 'b';
    },
    
    getIndex(file, rank) {
      return file + rank * 8;
    },

    getFileRank(index) {
      return {
        file: index % 8,
        rank: Math.floor(index / 8)
      };
    },

    isWhiteSquare(index) {
      return (index + Math.floor(index / 8)) % 2 === 0;
    },

    isWhitePiece(piece) {
      try {
        return piece === piece?.toUpperCase() ?? false;
      } catch {
        return false;
      }
    },

    isSliding(piece) {
      return 'qrb'.includes(piece.toLowerCase());
    }
  }
}