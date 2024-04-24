import { Board } from './js/board.js';

const boardEl = document.querySelector('#board');
const board = new Board(boardEl, {
  isLegalMove(board, from, to) {
    return true;
  }
});

board.load('starting');

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}