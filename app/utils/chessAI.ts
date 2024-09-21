import { ChessPiece, PieceType, Color } from '../types/chess';
import { isValidMove, getPossibleMoves, isCheck, isCheckmate } from './chessLogic';

// Piece values for improved evaluation
const pieceValues: { [key in PieceType]: number } = {
  [PieceType.PAWN]: 100,
  [PieceType.KNIGHT]: 320,
  [PieceType.BISHOP]: 330,
  [PieceType.ROOK]: 500,
  [PieceType.QUEEN]: 900,
  [PieceType.KING]: 20000,
};
// Position bonuses for each piece type
const positionBonus: { [key in PieceType]: number[][] } = {
  [PieceType.PAWN]: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ],
  [PieceType.ROOK]: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
  ],
  [PieceType.KNIGHT]: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  [PieceType.BISHOP]: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  [PieceType.QUEEN]: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],
  [PieceType.KING]: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
  ],
};

// Opening book (simplified version)
const openingBook: { [key: string]: string } = {
  "": "e2e4",
  "e7e5": "g1f3",
  "e7e6": "d2d4",
  // Add more opening moves...
};

// Endgame tables (simplified version)
const endgameTables: { [key: string]: number } = {
  "KQk": 1000,
  "KRk": 800,
  "KBNk": 600,
  // Add more endgame evaluations...
};

export function evaluateBoard(board: (ChessPiece | null)[][], color: Color): number {
  let score = 0;
  let materialCount = 0;
  let pawnStructureScore = 0;
  let kingSafetyScore = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const pieceValue = pieceValues[piece.type];
        const positionValue = positionBonus[piece.type][piece.color === Color.WHITE ? row : 7 - row][col];
        score += (piece.color === color ? 1 : -1) * (pieceValue + positionValue);
        materialCount += pieceValue;

        // Evaluate pawn structure
        if (piece.type === PieceType.PAWN) {
          pawnStructureScore += evaluatePawnStructure(board, row, col, piece.color);
        }

        // Evaluate king safety
        if (piece.type === PieceType.KING) {
          kingSafetyScore += evaluateKingSafety(board, row, col, piece.color);
        }
      }
    }
  }

  // Apply endgame tables if applicable
  if (materialCount < 1500) {
    const endgameKey = getEndgameKey(board);
    if (endgameKey in endgameTables) {
      score += endgameTables[endgameKey] * (color === Color.WHITE ? 1 : -1);
    }
  }

  return score + pawnStructureScore + kingSafetyScore;
}

function evaluatePawnStructure(board: (ChessPiece | null)[][], row: number, col: number, color: Color): number {
  let score = 0;
  // Check for doubled pawns
  for (let r = 0; r < 8; r++) {
    if (r !== row && board[r][col]?.type === PieceType.PAWN && board[r][col]?.color === color) {
      score -= 10;
    }
  }
  // Check for isolated pawns
  const isIsolated = (board[row][col - 1]?.type !== PieceType.PAWN) && (board[row][col + 1]?.type !== PieceType.PAWN);
  if (isIsolated) {
    score -= 20;
  }
  // Add more pawn structure evaluations...
  return score;
}

function evaluateKingSafety(board: (ChessPiece | null)[][], row: number, col: number, color: Color): number {
  let score = 0;
  // Check pawn shield
  const pawnShieldDirection = color === Color.WHITE ? -1 : 1;
  if (board[row + pawnShieldDirection]?.[col - 1]?.type === PieceType.PAWN ||
      board[row + pawnShieldDirection]?.[col]?.type === PieceType.PAWN ||
      board[row + pawnShieldDirection]?.[col + 1]?.type === PieceType.PAWN) {
    score += 30;
  }
  // Add more king safety evaluations...
  return score;
}

function getEndgameKey(board: (ChessPiece | null)[][]): string {
  // Simplified endgame key generation
  let key = "";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type !== PieceType.PAWN) {
        key += piece.color === Color.WHITE ? piece.type.charAt(0).toUpperCase() : piece.type.charAt(0).toLowerCase();
      }
    }
  }
  return key;
}

function quiescenceSearch(
  board: (ChessPiece | null)[][],
  alpha: number,
  beta: number,
  color: Color,
  depth: number
): number {
  const standPat = evaluateBoard(board, color);
  if (depth === 0) return standPat;
  if (standPat >= beta) return beta;
  if (alpha < standPat) alpha = standPat;

  const captureMoves = getAllPossibleMoves(board, color, null).filter(move =>
    board[move.to[0]][move.to[1]] !== null
  );

  for (const move of captureMoves) {
    const newBoard = makeMove(board, move.from, move.to);
    const score = -quiescenceSearch(newBoard, -beta, -alpha, color === Color.WHITE ? Color.BLACK : Color.WHITE, depth - 1);
    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }

  return alpha;
}

function iterativeDeepeningSearch(
  board: (ChessPiece | null)[][],
  color: Color,
  timeLimit: number
): { from: [number, number]; to: [number, number] } {
  let bestMove: { from: [number, number]; to: [number, number] } | null = null;
  let depth = 1;
  const startTime = Date.now();

  while (Date.now() - startTime < timeLimit) {
    const move = getBestMoveAtDepth(board, color, depth);
    if (move) bestMove = move;
    depth++;
  }

  return bestMove!;
}

function getBestMoveAtDepth(
  board: (ChessPiece | null)[][],
  color: Color,
  depth: number
): { from: [number, number]; to: [number, number] } | null {
  const moves = getAllPossibleMoves(board, color, null);
  let bestMove = null;
  let bestScore = color === Color.WHITE ? -Infinity : Infinity;

  for (const move of moves) {
    const newBoard = makeMove(board, move.from, move.to);
    const score = minimax(newBoard, depth - 1, -Infinity, Infinity, color === Color.BLACK, color, move);

    if (color === Color.WHITE && score > bestScore) {
      bestScore = score;
      bestMove = move;
    } else if (color === Color.BLACK && score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function minimax(
  board: (ChessPiece | null)[][],
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  color: Color,
  lastMove: { from: [number, number]; to: [number, number] } | null
): number {
  if (depth === 0) {
    return quiescenceSearch(board, alpha, beta, color, 3); // Quiescence search with depth 3
  }

  const moves = getAllPossibleMoves(board, maximizingPlayer ? color : (color === Color.WHITE ? Color.BLACK : Color.WHITE), lastMove);
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move.from, move.to);
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, false, color, move);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move.from, move.to);
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, true, color, move);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function getAIMove(
  board: (ChessPiece | null)[][],
  color: Color,
  difficulty: AIDifficulty,
  lastMove: { from: [number, number]; to: [number, number] } | null
): { from: [number, number]; to: [number, number] } {
  // Check opening book
  const boardString = boardToString(board);
  if (boardString in openingBook) {
    const move = openingBook[boardString];
    return { from: [parseInt(move[1]), parseInt(move[0])], to: [parseInt(move[3]), parseInt(move[2])] };
  }

  const timeLimit = difficulty === AIDifficulty.EASY ? 1000 :
                    difficulty === AIDifficulty.MEDIUM ? 3000 :
                    5000; // HARD difficulty

  return iterativeDeepeningSearch(board, color, timeLimit);
}

function boardToString(board: (ChessPiece | null)[][]): string {
  return board.map(row =>
    row.map(piece =>
      piece ? (piece.color === Color.WHITE ? piece.type.charAt(0).toUpperCase() : piece.type.charAt(0).toLowerCase()) : '-'
    ).join('')
  ).join('');
}

// Get all possible moves for a given color
function getAllPossibleMoves(
  board: (ChessPiece | null)[][],
  color: Color,
  lastMove: { from: [number, number]; to: [number, number] } | null
): { from: [number, number]; to: [number, number] }[] {
  const moves: { from: [number, number]; to: [number, number] }[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const possibleMoves = getPossibleMoves(board, [row, col], color, lastMove);
        possibleMoves.forEach(to => moves.push({ from: [row, col], to }));
      }
    }
  }
  return moves;
}

// Make a move on a new board (without modifying the original)
function makeMove(
  board: (ChessPiece | null)[][],
  from: [number, number],
  to: [number, number]
): (ChessPiece | null)[][] {
  const newBoard = board.map(row => [...row]);
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;
  newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
  newBoard[fromRow][fromCol] = null;
  return newBoard;
}

export enum AIDifficulty {
  EASY,
  MEDIUM,
  HARD,
}
