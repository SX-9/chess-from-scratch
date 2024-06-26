import { Square, AxisVal, Piece, Move, Color } from './types';

export default {
  getSquareInfo(square: Square, board: Piece[]) {
    return { 
      ...this.getFileRank(square),
      index: square,
      piece: square !== null && board[square],
      color: square !== null && board[square] && this.isWhitePiece(board[square]) ? 'w' : 'b' as Color,
    };
  },

  nSquaresTillEdge(square: Square, direction: number): number {
    if (square === null) return 0;

    let edges = {
      "-8": [0,1,2,3,4,5,6,7],
      "8": [56,57,58,59,60,61,62,63],
      "-1": [0,8,16,24,32,40,48,56],
      "1": [7,15,23,31,39,47,55,63],
      "-9": [] as number [],
      "9": [] as number [],
      "-7": [] as number [],
      "7": [] as number []
    }

    edges["-9"] = [...edges["-8"], ...edges["-1"]];
    edges["9"] = [...edges["8"], ...edges["1"]];
    edges["-7"] = [...edges["-8"], ...edges["1"]];
    edges["7"] = [...edges["8"], ...edges["-1"]];

    let nSquares = 0, nextLoopBreak = false;
    while (true) {
      if (nextLoopBreak) break;
      if ((edges as any)[direction.toString()].includes(square + (direction * nSquares))) nextLoopBreak = true;
      nSquares++;
    }
    return nSquares;
  },

  asciiString(board: Piece[]) {
    let ascii = '';
    for (let i = 0; i < 64; i++) {
      ascii += board[i] || '-';
      if (i % 8 === 7) ascii += '\n';
    }
    return ascii;
  },

  asciiHighlights(highlights: boolean[]) {
    let ascii = '';
    for (let i = 0; i < 64; i++) {
      ascii += highlights[i] ? '+' : '-';
      if (i % 8 === 7) ascii += '\n';
    }
    return ascii;
  },

  moveIdentifier(move: Move, complete?: boolean) {
    if (!complete) return `${move.from}-${move.to}`;
    else if (move.castling) return `castle${[2, 58].includes(move.to as number) ? 'K' : 'Q'}`;
    else return `${move.piece?.toLocaleLowerCase()}${move.from}=>${move.capture ? 'x' : ''}${move.promotion || move.to}`;
  },

  getIndex(file: AxisVal, rank: AxisVal) {
    if (
      file === null || 
      rank === null || 
      file < 0 || 
      file > 7 || 
      rank < 0 || 
      rank > 7) return null as Square;
    return file + rank * 8 as Square;
  },

  getFileRank(index: Square) {
    if (!index) return {
      file: 0 as AxisVal,
      rank: 0 as AxisVal,
    };
    return {
      file: index % 8 as AxisVal,
      rank: Math.floor(index / 8) as AxisVal,
    };
  },

  isWhiteSquare(index: Square) {
    if (!index) return;
    return (index + Math.floor(index / 8)) % 2 === 0;
  },

  isWhitePiece(piece: Piece) {
    if (!piece) return;
    return piece === piece?.toUpperCase();
  },

  isSliding(piece: Piece) {
    if (!piece) return;
    return 'qrb'.includes(piece.toLowerCase());
  },
}