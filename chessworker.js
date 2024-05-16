// chessWorker.js

self.onmessage = function(event) {
    const { board, depth, isMaximizingPlayer } = event.data;

    const bestMove = minimax(board, depth, isMaximizingPlayer, -Infinity, Infinity);
    self.postMessage(bestMove);
};

function minimax(board, depth, isMaximizingPlayer, alpha, beta) {
    if (depth === 0) {
        return { score: evaluateBoard(board) };
    }

    const moves = getAllPossibleMoves(board, isMaximizingPlayer);
    orderMoves(moves);
    let bestMove = null;

    if (isMaximizingPlayer) {
        let maxEval = -Infinity;
        for (const move of moves) {
            const boardCopy = JSON.parse(JSON.stringify(board));
            movePieceOnBoard(boardCopy, move.fromRow, move.fromCol, move.toRow, move.toCol);
            const evaluation = minimax(boardCopy, depth - 1, false, alpha, beta).score;
            if (evaluation > maxEval) {
                maxEval = evaluation;
                bestMove = move;
            }
            alpha = Math.max(alpha, evaluation);
            if (beta <= alpha) {
                break;
            }
        }
        return { ...bestMove, score: maxEval };
    } else {
        let minEval = Infinity;
        for (const move of moves) {
            const boardCopy = JSON.parse(JSON.stringify(board));
            movePieceOnBoard(boardCopy, move.fromRow, move.fromCol, move.toRow, move.toCol);
            const evaluation = minimax(boardCopy, depth - 1, true, alpha, beta).score;
            if (evaluation < minEval) {
                minEval = evaluation;
                bestMove = move;
            }
            beta = Math.min(beta, evaluation);
            if (beta <= alpha) {
                break;
            }
        }
        return { ...bestMove, score: minEval };
    }
}

function evaluateBoard(board) {
    const pieceValues = {
        'p': -1, 'n': -3, 'b': -3, 'r': -5, 'q': -9, 'k': -900,
        'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 900
    };
    const pieceSquareTables = {
        'P': [/* piece-square table values for white pawn */],
        'N': [/* piece-square table values for white knight */],
        'B': [/* piece-square table values for white bishop */],
        'R': [/* piece-square table values for white rook */],
        'Q': [/* piece-square table values for white queen */],
        'K': [/* piece-square table values for white king */],
        'p': [/* piece-square table values for black pawn */],
        'n': [/* piece-square table values for black knight */],
        'b': [/* piece-square table values for black bishop */],
        'r': [/* piece-square table values for black rook */],
        'q': [/* piece-square table values for black queen */],
        'k': [/* piece-square table values for black king */],
    };
    let evaluation = 0;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece !== ' ') {
                const pieceValue = pieceValues[piece] || 0;
                const pieceSquareValue = pieceSquareTables[piece][row * 8 + col] || 0;
                evaluation += pieceValue + pieceSquareValue;
            }
        }
    }
    return evaluation;
}

function getAllPossibleMoves(board, isWhite) {
    const moves = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece !== ' ' && isWhitePiece(piece) === isWhite) {
                const possibleMoves = getPossibleMoves(board, row, col, piece);
                possibleMoves.forEach(move => {
                    if (!causesCheck(board, row, col, move[0], move[1], isWhite)) {
                        moves.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: move[0],
                            toCol: move[1],
                        });
                    }
                });
            }
        }
    }
    return moves;
}

function isWhitePiece(piece) {
    return piece === piece.toUpperCase();
}

function movePieceOnBoard(board, fromRow, fromCol, toRow, toCol) {
    const piece = board[fromRow][fromCol];
    board[fromRow][fromCol] = ' ';
    board[toRow][toCol] = piece;
}

function causesCheck(board, fromRow, fromCol, toRow, toCol, isWhite) {
    const boardCopy = JSON.parse(JSON.stringify(board));
    movePieceOnBoard(boardCopy, fromRow, fromCol, toRow, toCol);
    return isInCheck(boardCopy, isWhite);
}

function isInCheck(board, isWhite) {
    let kingRow, kingCol;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col] === (isWhite ? 'K' : 'k')) {
                kingRow = row;
                kingCol = col;
            }
        }
    }
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece !== ' ' && isWhitePiece(piece) !== isWhite) {
                const possibleMoves = getPossibleMovesNoCheck(board, row, col, piece);
                if (possibleMoves.some(move => move[0] === kingRow && move[1] === kingCol)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function getPossibleMovesNoCheck(board, row, col, piece) {
    const moves = [];
    const directions = {
        'p': [[1, 0], [1, 1], [1, -1], [2, 0]],
        'P': [[-1, 0], [-1, 1], [-1, -1], [-2, 0]],
        'r': [[1, 0], [-1, 0], [0, 1], [0, -1]],
        'b': [[1, 1], [1, -1], [-1, 1], [-1, -1]],
        'q': [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]],
        'k': [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]],
        'n': [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]]
    };

    function addMoveIfValid(row, col, newRow, newCol, piece) {
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetPiece = board[newRow][newCol];
            if (targetPiece === ' ' || isWhitePiece(targetPiece) !== isWhitePiece(piece)) {
                moves.push([newRow, newCol]);
            }
        }
    }

    function addMovesForDirection(row, col, directions, piece) {
        directions.forEach(([dx, dy]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dx * i;
                const newCol = col + dy * i;
                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    if (board[newRow][newCol] === ' ') {
                        moves.push([newRow, newCol]);
                    } else {
                        if (isWhitePiece(board[newRow][newCol]) !== isWhitePiece(piece)) {
                            moves.push([newRow, newCol]);
                        }
                        break;
                    }
                } else {
                    break;
                }
            }
        });
    }

    switch (piece.toLowerCase()) {
        case 'p':
            const direction = isWhitePiece(piece) ? -1 : 1;
            const startRow = isWhitePiece(piece) ? 6 : 1;
            if (board[row + direction][col] === ' ') {
                moves.push([row + direction, col]);
                if (row === startRow && board[row + 2 * direction][col] === ' ') {
                    moves.push([row + 2 * direction, col]);
                }
            }
            if (col > 0 && board[row + direction][col - 1] !== ' ' && isWhitePiece(board[row + direction][col - 1]) !== isWhitePiece(piece)) {
                moves.push([row + direction, col - 1]);
            }
            if (col < 7 && board[row + direction][col + 1] !== ' ' && isWhitePiece(board[row + direction][col + 1]) !== isWhitePiece(piece)) {
                moves.push([row + direction, col + 1]);
            }
            break;
        case 'r':
            addMovesForDirection(row, col, directions['r'], piece);
            break;
        case 'n':
            directions['n'].forEach(([dx, dy]) => addMoveIfValid(row, col, row + dx, col + dy, piece));
            break;
        case 'b':
            addMovesForDirection(row, col, directions['b'], piece);
            break;
        case 'q':
            addMovesForDirection(row, col, directions['q'], piece);
            break;
        case 'k':
            directions['k'].forEach(([dx, dy]) => addMoveIfValid(row, col, row + dx, col + dy, piece));
            break;
    }
    return moves;
}
