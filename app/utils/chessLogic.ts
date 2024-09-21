import { ChessPiece, PieceType, Color } from '../types/chess';

export function isValidMove(
  board: (ChessPiece | null)[][],
  from: [number, number],
  to: [number, number],
  currentTurn: Color,
  lastMove: { from: [number, number]; to: [number, number] } | null = null
): boolean {
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;
  const piece = board[fromRow][fromCol];

  if (!piece || piece.color !== currentTurn) return false;
  if (board[toRow][toCol]?.color === currentTurn) return false;

  switch (piece.type) {
    case PieceType.PAWN:
      return isValidPawnMove(board, from, to, currentTurn) || isValidEnPassant(board, from, to, lastMove);
    case PieceType.ROOK:
      return isValidRookMove(board, from, to);
    case PieceType.KNIGHT:
      return isValidKnightMove(from, to);
    case PieceType.BISHOP:
      return isValidBishopMove(board, from, to);
    case PieceType.QUEEN:
      return isValidQueenMove(board, from, to);
    case PieceType.KING:
      return isValidKingMove(from, to) || isValidCastling(board, from, to, currentTurn);
    default:
      return false;
  }
}

function isValidPawnMove(
  board: (ChessPiece | null)[][],
  from: [number, number],
  to: [number, number],
  currentTurn: Color
): boolean {
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;
  const direction = currentTurn === Color.WHITE ? -1 : 1;

  // Move forward one square
  if (fromCol === toCol && toRow === fromRow + direction && !board[toRow][toCol]) {
    return true;
  }

  // Move forward two squares from starting position
  if (
    fromCol === toCol &&
    ((currentTurn === Color.WHITE && fromRow === 6 && toRow === 4) ||
      (currentTurn === Color.BLACK && fromRow === 1 && toRow === 3)) &&
    !board[fromRow + direction][fromCol] &&
    !board[toRow][toCol]
  ) {
    return true;
  }

  // Capture diagonally
  if (
    Math.abs(fromCol - toCol) === 1 &&
    toRow === fromRow + direction &&
    board[toRow][toCol] &&
    board[toRow][toCol]!.color !== currentTurn
  ) {
    return true;
  }

  return false;
}

function isValidRookMove(
  board: (ChessPiece | null)[][],
  from: [number, number],
  to: [number, number]
): boolean {
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;

  if (fromRow !== toRow && fromCol !== toCol) return false;

  const rowStep = fromRow === toRow ? 0 : (toRow - fromRow) / Math.abs(toRow - fromRow);
  const colStep = fromCol === toCol ? 0 : (toCol - fromCol) / Math.abs(toCol - fromCol);

  for (let i = 1; i < Math.max(Math.abs(toRow - fromRow), Math.abs(toCol - fromCol)); i++) {
    if (board[fromRow + i * rowStep][fromCol + i * colStep]) return false;
  }

  return true;
}

function isValidKnightMove(from: [number, number], to: [number, number]): boolean {
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;
  return (
    (Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 1) ||
    (Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 2)
  );
}

function isValidBishopMove(
  board: (ChessPiece | null)[][],
  from: [number, number],
  to: [number, number]
): boolean {
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;

  if (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol)) return false;

  const rowStep = (toRow - fromRow) / Math.abs(toRow - fromRow);
  const colStep = (toCol - fromCol) / Math.abs(toCol - fromCol);

  for (let i = 1; i < Math.abs(toRow - fromRow); i++) {
    if (board[fromRow + i * rowStep][fromCol + i * colStep]) return false;
  }

  return true;
}

function isValidQueenMove(
  board: (ChessPiece | null)[][],
  from: [number, number],
  to: [number, number]
): boolean {
  return isValidRookMove(board, from, to) || isValidBishopMove(board, from, to);
}

function isValidKingMove(from: [number, number], to: [number, number]): boolean {
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;
  return Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1;
}

export function isCheck(
  board: (ChessPiece | null)[][],
  kingColor: Color
): boolean {
  const kingPosition = findKing(board, kingColor);
  if (!kingPosition) return false;

  const opponentColor = kingColor === Color.WHITE ? Color.BLACK : Color.WHITE;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === opponentColor) {
        if (isValidMove(board, [row, col], kingPosition, opponentColor)) {
          return true;
        }
      }
    }
  }

  return false;
}

function findKing(board: (ChessPiece | null)[][], color: Color): [number, number] | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === PieceType.KING && piece.color === color) {
        return [row, col];
      }
    }
  }
  return null;
}

export function isCheckmate(
  board: (ChessPiece | null)[][],
  currentTurn: Color
): boolean {
  if (!isCheck(board, currentTurn)) return false;

  for (let fromRow = 0; fromRow < 8; fromRow++) {
    for (let fromCol = 0; fromCol < 8; fromCol++) {
      const piece = board[fromRow][fromCol];
      if (piece && piece.color === currentTurn) {
        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            if (isValidMove(board, [fromRow, fromCol], [toRow, toCol], currentTurn)) {
              const newBoard = board.map(row => [...row]);
              newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
              newBoard[fromRow][fromCol] = null;
              if (!isCheck(newBoard, currentTurn)) {
                return false;
              }
            }
          }
        }
      }
    }
  }

  return true;
}

// New function to check if castling is valid
export function isValidCastling(
  board: (ChessPiece | null)[][],
  from: [number, number],
  to: [number, number],
  color: Color
): boolean {
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;
  const king = board[fromRow][fromCol];

  if (king?.type !== PieceType.KING || king.color !== color) return false;
  if (fromRow !== toRow || Math.abs(fromCol - toCol) !== 2) return false;
  if (isCheck(board, color)) return false;

  const rookCol = toCol > fromCol ? 7 : 0;
  const rook = board[fromRow][rookCol];
  if (!rook || rook.type !== PieceType.ROOK || rook.color !== color) return false;

  const direction = toCol > fromCol ? 1 : -1;
  for (let col = fromCol + direction; col !== rookCol; col += direction) {
    if (board[fromRow][col] !== null) return false;
    if (isSquareUnderAttack(board, [fromRow, col], color)) return false;
  }

  return true;
}

// New function to check if a square is under attack
function isSquareUnderAttack(
  board: (ChessPiece | null)[][],
  square: [number, number],
  defendingColor: Color
): boolean {
  const attackingColor = defendingColor === Color.WHITE ? Color.BLACK : Color.WHITE;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === attackingColor) {
        if (isValidMove(board, [row, col], square, attackingColor)) {
          return true;
        }
      }
    }
  }
  return false;
}

// New function to check if en passant is valid
export function isValidEnPassant(
  board: (ChessPiece | null)[][],
  from: [number, number],
  to: [number, number],
  lastMove: { from: [number, number]; to: [number, number] } | null
): boolean {
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;
  const piece = board[fromRow][fromCol];

  if (!piece || piece.type !== PieceType.PAWN) return false;
  if (!lastMove) return false;

  const [lastFromRow, lastFromCol] = lastMove.from;
  const [lastToRow, lastToCol] = lastMove.to;
  const lastPiece = board[lastToRow][lastToCol];

  if (!lastPiece || lastPiece.type !== PieceType.PAWN) return false;
  if (Math.abs(lastFromRow - lastToRow) !== 2) return false;
  if (lastToCol !== toCol) return false;
  if (Math.abs(fromCol - lastToCol) !== 1) return false;

  const direction = piece.color === Color.WHITE ? -1 : 1;
  return toRow === lastToRow + direction;
}

// New function to check if pawn promotion is possible
export function isPawnPromotion(
  board: (ChessPiece | null)[][],
  from: [number, number],
  to: [number, number]
): boolean {
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;
  const piece = board[fromRow][fromCol];

  if (!piece || piece.type !== PieceType.PAWN) return false;

  return (piece.color === Color.WHITE && toRow === 0) || (piece.color === Color.BLACK && toRow === 7);
}

export function getPossibleMoves(
  board: (ChessPiece | null)[][],
  from: [number, number],
  currentTurn: Color,
  lastMove: { from: [number, number]; to: [number, number] } | null
): [number, number][] {
  const possibleMoves: [number, number][] = [];
  const [fromRow, fromCol] = from;
  const piece = board[fromRow][fromCol];

  if (!piece || piece.color !== currentTurn) return [];

  for (let toRow = 0; toRow < 8; toRow++) {
    for (let toCol = 0; toCol < 8; toCol++) {
      if (isValidMove(board, from, [toRow, toCol], currentTurn, lastMove)) {
        // Check if the move doesn't put the king in check
        const newBoard = board.map(row => [...row]);
        newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
        newBoard[fromRow][fromCol] = null;
        if (!isCheck(newBoard, currentTurn)) {
          possibleMoves.push([toRow, toCol]);
        }
      }
    }
  }

  return possibleMoves;
}
