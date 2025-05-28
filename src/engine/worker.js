/**
 * Wrapper worker → Stockfish WASM (bundled file).
 * Accepts and relays raw UCI strings.
 */
importScripts('https://cdn.jsdelivr.net/npm/stockfish.wasm@0.10.0/stockfish.js');

self.onmessage = (e) => stockfish.postMessage(e.data);
stockfish.onmessage = (e) => postMessage(e.data);
