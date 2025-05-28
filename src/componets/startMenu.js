/**
 * Injects a modern glassmorphic overlay asking for skill level.
 * Calls `onStart(skill)` where skill 0‑20 maps to Stockfish skill level.
 */
export function showStartMenu(onStart) {
  const overlay = document.createElement('div');
  overlay.id = 'start-menu';

  overlay.innerHTML = `
    <div id="start-card">
      <h1>♟️ Epic Chess</h1>
      <label for="skill">Computer strength</label>
      <input id="skill" type="range" min="0" max="20" value="5" />
      <div style="text-align:center;font-size:.85rem">
        <span id="skill-val">5</span>/20
      </div>
      <button id="start-btn">Start game</button>
    </div>`;

  document.body.appendChild(overlay);

  // live update label
  const slider = overlay.querySelector('#skill');
  const out    = overlay.querySelector('#skill-val');
  slider.addEventListener('input', () => (out.textContent = slider.value));

  // start handler
  overlay.querySelector('#start-btn').addEventListener('click', () => {
    onStart(parseInt(slider.value, 10));
    overlay.remove();
  });
}
