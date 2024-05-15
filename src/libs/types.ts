export type AxisVal = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type Square = null | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63;
export type Turn = "w" | "b" | "";
export type Piece = null | "P" | "N" | "B" | "R" | "Q" | "K" | "p" | "n" | "b" | "r" | "q" | "k";
export type Move = {
  from: Square;
  to: Square;
  turn: Turn;
  piece?: Piece;
  promotion?: Piece;
  enPassant?: boolean;
  castling?: boolean;
  capture?: boolean;
};
export type SquareXYoffset = {
  file: number;
  rank: number;
}
export type CastlingRights = {
  w: { k: boolean; q: boolean };
  b: { k: boolean; q: boolean };
};