import { Chess } from "https://cdnjs.cloudflare.com/ajax/libs/chess.js/1.0.0/chess.mjs";

export class BoardUI {
  constructor(engine) {
    this.game   = new Chess();
    this.engine = engine;  // Worker wrapper
    this.board  = Chessboard('board', {
      position: 'start',
      draggable: true,
      onDrop:   this.onDrop.bind(this)
    });

    engine.onmessage = (e) => this.onEngineMsg(e.data);
  }

  onDrop(source, target) {
    const move = this.game.move({ from: source, to: target, promotion: 'q' });
    if (!move) return 'snapback';

    this.board.position(this.game.fen());
    this.think();
  }

  think() {
    // send FEN to Stockfish
    this.engine.postMessage(`position fen ${this.game.fen()}`);
    this.engine.postMessage('go depth 12'); // you could adapt depth to skill
  }

  onEngineMsg(msg) {
    if (msg.startsWith('bestmove')) {
      const [ , move ] = msg.split(' ');
      if (move === '(none)') return;
      this.game.move({ from: move.slice(0,2), to: move.slice(2,4), promotion:'q' });
      this.board.position(this.game.fen());
    }
  }
}
