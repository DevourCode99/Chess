import { showStartMenu } from './components/startMenu.js';
import { BoardUI }       from './components/board.js';

// 1) Ask for desired strength
showStartMenu((skill) => {
  // 2) Launch worker & configure engine
  const engine = new Worker('./engine/worker.js', { type: 'module' });
  engine.postMessage('uci');
  engine.postMessage(`setoption name Skill Level value ${skill}`);

  // 3) Fire up UI
  new BoardUI(engine);
});
