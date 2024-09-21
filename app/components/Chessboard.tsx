'use client'
import React, { useState, useEffect } from 'react';
import { ChessPiece, PieceType, Color } from '../types/chess';
import Square from './Square';
import MoveHistory from './MoveHistory';
import WinningRateProgress from './WinningRateProgress';
import { isValidMove, isCheck, isCheckmate, isPawnPromotion, getPossibleMoves } from '../utils/chessLogic';
import { getAIMove, AIDifficulty, evaluateBoard } from '../utils/chessAI';
import { CHESS_CONFIG } from '../constants/chessConfig';

const initialBoard: (ChessPiece | null)[][] = [
  [
    { type: PieceType.ROOK, color: Color.BLACK },
    { type: PieceType.KNIGHT, color: Color.BLACK },
    { type: PieceType.BISHOP, color: Color.BLACK },
    { type: PieceType.QUEEN, color: Color.BLACK },
    { type: PieceType.KING, color: Color.BLACK },
    { type: PieceType.BISHOP, color: Color.BLACK },
    { type: PieceType.KNIGHT, color: Color.BLACK },
    { type: PieceType.ROOK, color: Color.BLACK },
  ],
  Array(8).fill({ type: PieceType.PAWN, color: Color.BLACK }),
  ...Array(4).fill(Array(8).fill(null)),
  Array(8).fill({ type: PieceType.PAWN, color: Color.WHITE }),
  [
    { type: PieceType.ROOK, color: Color.WHITE },
    { type: PieceType.KNIGHT, color: Color.WHITE },
    { type: PieceType.BISHOP, color: Color.WHITE },
    { type: PieceType.QUEEN, color: Color.WHITE },
    { type: PieceType.KING, color: Color.WHITE },
    { type: PieceType.BISHOP, color: Color.WHITE },
    { type: PieceType.KNIGHT, color: Color.WHITE },
    { type: PieceType.ROOK, color: Color.WHITE },
  ],
];

interface Move {
  piece: string;
  from: string;
  to: string;
  player: Color;
}

const Chessboard: React.FC = () => {
  const [board, setBoard] = useState<(ChessPiece | null)[][]>(initialBoard);
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [currentTurn, setCurrentTurn] = useState<Color>(Color.WHITE);
  const [gameStatus, setGameStatus] = useState<string>('');
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<{ from: [number, number]; to: [number, number] } | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<[number, number][]>([]);
  const [isAITurn, setIsAITurn] = useState(false);
  const [gameMode, setGameMode] = useState<'pvp' | 'ai'>('pvp');
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>(AIDifficulty.MEDIUM);
  const [winningRate, setWinningRate] = useState(50);

  useEffect(() => {
    if (gameMode === 'ai' && isAITurn && !gameStatus) {
      const aiMove = getAIMove(board, currentTurn, aiDifficulty, lastMove);
      if (aiMove) {
        setTimeout(() => makeMove(aiMove.from, aiMove.to), 500);
      }
    }
  }, [isAITurn, gameMode, currentTurn, board, lastMove, gameStatus, aiDifficulty]);

  useEffect(() => {
    const evaluation = evaluateBoard(board, Color.WHITE);
    const newWinningRate = 50 + (evaluation / 100);
    setWinningRate(Math.max(0, Math.min(100, newWinningRate)));
  }, [board]);

  const makeMove = (from: [number, number], to: [number, number]) => {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;
    const piece = board[fromRow][fromCol];
    const newBoard = board.map(row => [...row]);

    // Handle en passant capture
    if (piece?.type === PieceType.PAWN && toCol !== fromCol && !newBoard[toRow][toCol]) {
      newBoard[fromRow][toCol] = null; // Remove the captured pawn
    }

    // Handle castling
    if (piece?.type === PieceType.KING && Math.abs(toCol - fromCol) === 2) {
      const rookFromCol = toCol > fromCol ? 7 : 0;
      const rookToCol = toCol > fromCol ? toCol - 1 : toCol + 1;
      newBoard[toRow][rookToCol] = newBoard[fromRow][rookFromCol];
      newBoard[fromRow][rookFromCol] = null;
    }

    newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
    newBoard[fromRow][fromCol] = null;

    // Handle pawn promotion
    if (isPawnPromotion(board, from, to)) {
      newBoard[toRow][toCol] = { type: PieceType.QUEEN, color: currentTurn };
    }

    setBoard(newBoard);
    setLastMove({ from, to });

    // Add move to history
    const newMove: Move = {
      piece: piece!.type,
      from: `${String.fromCharCode(97 + fromCol)}${8 - fromRow}`,
      to: `${String.fromCharCode(97 + toCol)}${8 - toRow}`,
      player: currentTurn
    };
    setMoveHistory([...moveHistory, newMove]);

    const nextTurn = currentTurn === Color.WHITE ? Color.BLACK : Color.WHITE;
    setCurrentTurn(nextTurn);

    if (isCheck(newBoard, nextTurn)) {
      if (isCheckmate(newBoard, nextTurn)) {
        setGameStatus(`Checkmate! ${currentTurn} wins!`);
      } else {
        setGameStatus(`${nextTurn} is in check!`);
      }
    } else {
      setGameStatus('');
    }

    setSelectedSquare(null);
    setPossibleMoves([]);
    setIsAITurn(gameMode === 'ai' && nextTurn === Color.BLACK);
  };

  const handleSquareClick = (row: number, col: number) => {
    if (gameMode === 'ai' && currentTurn === Color.BLACK) return; // Prevent clicks during AI turn

    if (selectedSquare) {
      if (isValidMove(board, selectedSquare, [row, col], currentTurn, lastMove)) {
        makeMove(selectedSquare, [row, col]);
      } else {
        setSelectedSquare([row, col]);
        setPossibleMoves(getPossibleMoves(board, [row, col], currentTurn, lastMove));
      }
    } else if (board[row][col] && board[row][col]!.color === currentTurn) {
      setSelectedSquare([row, col]);
      setPossibleMoves(getPossibleMoves(board, [row, col], currentTurn, lastMove));
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4">


      <div className="flex flex-wrap justify-center gap-4 mb-4">
        <button
          className={`px-4 py-2 text-sm ${gameMode === 'pvp' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
          onClick={() => setGameMode('pvp')}
        >
          Player vs Player
        </button>
        <button
          className={`px-4 py-2 text-sm ${gameMode === 'ai' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
          onClick={() => {
            setGameMode('ai');
            setIsAITurn(currentTurn === Color.BLACK);
          }}
        >
          Player vs AI
        </button>
        {gameMode === 'ai' && (
          <select
            value={aiDifficulty}
            onChange={(e) => setAIDifficulty(Number(e.target.value) as AIDifficulty)}
            className="px-4 py-2 text-sm border rounded"
          >
            <option value={AIDifficulty.EASY}>Easy</option>
            <option value={AIDifficulty.MEDIUM}>Medium</option>
            <option value={AIDifficulty.HARD}>Hard</option>
          </select>
        )}
      </div>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="flex flex-col items-center">
          <div className={`grid grid-cols-8 ${CHESS_CONFIG.BOARD_SIZE} aspect-square border-4 border-amber-900`}>
            {Array(8).fill(null).map((_, rowIndex) =>
              Array(8).fill(null).map((_, colIndex) => (
                <div key={`${rowIndex}-${colIndex}`} className={CHESS_CONFIG.SQUARE_SIZE}>
                  <Square
                    piece={board[rowIndex][colIndex]}
                    isLight={(rowIndex + colIndex) % 2 === 0}
                    isSelected={selectedSquare?.[0] === rowIndex && selectedSquare?.[1] === colIndex}
                    isPossibleMove={possibleMoves.some(([r, c]) => r === rowIndex && c === colIndex)}
                    onClick={() => handleSquareClick(rowIndex, colIndex)}
                  />
                </div>
              ))
            )}
          </div>
          <div className="mt-4 text-xl font-bold">
            Current turn: {currentTurn === Color.WHITE ? 'WHITE' : 'BLACK'}
          </div>
          <div className="mt-2 text-lg text-red-600">{gameStatus}</div>
          <WinningRateProgress winningRate={winningRate} />
        </div>
        <MoveHistory moves={moveHistory} />
      </div>
      <div className="mt-8 text-sm text-gray-500">Powered by Cuvisoft</div>
    </div>
  );
};

export default Chessboard;
