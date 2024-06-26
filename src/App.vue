<script lang="ts">
import { Highlights, BoardArray } from './libs/array'
import { Square, Move } from './libs/types';
import { MoveGenerator } from './libs/moves';
import { Engine } from './libs/engine';
import utils from './libs/utils';

export default {
  name: 'App',
  methods: {
    ...utils,

    highlightAllMoves() {
      this.moveGen.generateAll();
      this.moveGen.moves.forEach(m => this.highlights.addHighlight(m.to));
    },

    showFen() {
      prompt('FEN:', this.board.fen as string);
    },

    highlightMoves(square: Square) {
      this.highlights.clearHighlights();
      this.moveGen.generate(square);
      this.moveGen.moves.forEach(m => this.highlights.addHighlight(m.to));
    },

    squareClick(i: Square) {
      if (i === null) return;
      if (this.lastClicked === -1) {
        this.lastClicked = i;
        this.highlightMoves(i as Square);
      } else {
        this.highlights.clearHighlights();
        if (!this.moveGen.move({
          from: this.lastClicked as Square,
          to: i,
          promotion: this.promotion,
        } as Move)) return this.lastClicked = -1;
        this.lastClicked = -1;
      }
    },

    pieceDrag(e: DragEvent, i: number) {
      this.dragged = i;
      this.dropped = -1;
      e?.dataTransfer?.setData('text/plain', i.toString());
      this.highlightMoves(i as Square)
    },

    pieceDrop(e: DragEvent, i: number) {
      this.highlights.clearHighlights();
      const from = parseInt(e?.dataTransfer?.getData('text/plain') ?? '') as Square;
      if (from === i) return this.dragged = -1;
      if (!this.moveGen.move({
        from, to: i,
        promotion: this.promotion,
      } as Move)) return this.dragged = -1;
      this.dropped = i;
      this.highlights.addHighlight(i as Square);
      this.highlights.addHighlight(from);
    },

    initialize() {
      this.board = new BoardArray(null);
      this.moveGen.load(this.board);
      this.engine.load(this.board, this.moveGen);
      this.eval = 0;
    },
  },
  data() {
    return {
      board: new BoardArray(null),
      moveGen: new MoveGenerator(),
      highlights: new Highlights(),
      engine: new Engine(),
      numbered: location.hostname === "localhost",
      flipped: false,
      promotion: 'q',
      lastSel: -1,
      dragged: -1,
      dropped: -1,
      lastClicked: -1,
      eval: 0,
    }
  },
  mounted() {
    document.onselectstart = () => false;
    this.initialize();
  },
}
</script>

<template>
  <div id="board" :class="board.turn === 'b' && flipped ? 'flipped' : ''">
    <div 
      @dragover.prevent 
      @drop.prevent="(e) => pieceDrop(e, i)" 
      @dragstart="(e) => pieceDrag(e, i)" 
      @mouseover="() => lastSel = i" 
      @contextmenu.prevent="() => highlights.toggleHighlight(i as Square)"
      @click="() => squareClick(i as Square)"
      role="button" :draggable="!!piece"
      :class="((getFileRank(i as Square).file + getFileRank(i as Square).rank) % 2 === 0 ? 'white' : 'black') + (highlights.highlights[i] ? ' highlight' : '')"
      :style="{ opacity: moveGen.kingCaptured ? 0.7 : 1 }"
      v-for="[i, piece] in board.board.entries()">
      <p v-if="numbered">{{ i }}</p>
      <img v-if="piece" :src="'./assets/' + piece + '.png'">
    </div>
  </div>
  <div :style="{ display: 'flex', gap: '1em', justifyContent: 'space-between' }">
    <div id="controls">
      <label for="numbered">square indexes:</label>
      <input type="checkbox" id="numbered" v-model="numbered">
      <label for="flipped">auto flip:</label>
      <input type="checkbox" id="flipped" v-model="flipped">
      <p>{{ dragged }} => {{ dropped }}</p>
      <p class="word-wrap">{{ Array.from(highlights.highlights.entries()).filter(c => c[1]).map(c => c[0]).join(' ') || 'none selected' }}</p>
      <button @click="highlights.clearHighlights()">clear highlights</button>
      <hr>
      <ul>
        <li v-for="[k,v] in Object.entries({
          enPassant: board.enPassant,
          halfMove: board.halfMove,
          fullMove: board.fullMove,
          gameOver: !!moveGen.kingCaptured,
        })">
          <strong>{{ k }}:</strong> {{ v || 'none' }}
        </li>
      </ul>
      <div :style="{ display: 'flex', gap: '1em' }">
        <pre>{{ asciiString(board.board) }}</pre>
        <pre>{{ asciiHighlights(highlights.highlights as boolean[]) }}</pre>
      </div>
      <table>
        <tr>
          <th>castling</th>
          <th>king</th>
          <th>queen</th>
        </tr>
        <tr>
          <th>white</th>
          <td>{{ board.castling.w.k }}</td>
          <td>{{ board.castling.w.q }}</td>
        </tr>
        <tr>
          <th>black</th>
          <td>{{ board.castling.b.k }}</td>
          <td>{{ board.castling.b.q }}</td>
        </tr>
      </table>
      <hr>
      <ul>
        <li>index: {{ lastSel }}</li>
        <li v-for="[k,v] in Object.entries(getFileRank(lastSel as Square))">{{ k }}: {{ v }}</li>
        <li>piece: {{ board.board[lastSel] || 'empty' }}</li>
        <li>last: {{ lastClicked }}</li>
      </ul>
    </div>
    <div id="history">
      <h2>{{ board.turn === 'w' ? 'White' : 'Black' }}{{ !!moveGen.kingCaptured ? ' Lost' : '\'s Turn' }}</h2>
      <button @click="showFen()">show starting fen</button>
      <br><br>
      <button @click="highlightAllMoves()">show all moves</button>
      <br><br>
      <label for="promotion">promotion: </label>
      <select id="promotion" v-model="promotion">
        <option value="q">queen</option>
        <option value="r">rook</option>
        <option value="b">bishop</option>
        <option value="n">knight</option>
      </select>
      <br>
      <div>
        <div :class="move.turn" v-for="move in moveGen.history">
          <p>
            {{ moveIdentifier(move, true) }}
          </p>
        </div>
      </div>
    </div>
    <div id="engine">
      <p>engine eval: {{ eval }}</p>
      <button @click="eval = engine.evaluate()">evaluate</button>
    </div>
  </div>
</template>