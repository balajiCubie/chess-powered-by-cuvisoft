import React from 'react';
import { ChessPiece, PieceType, Color } from '../types/chess';
import { CHESS_CONFIG } from '../constants/chessConfig';

const pieceUnicode: { [key in PieceType]: { [key in Color]: string } } = {
  [PieceType.PAWN]: { [Color.WHITE]: '♙', [Color.BLACK]: '♟' },
  [PieceType.ROOK]: { [Color.WHITE]: '♖', [Color.BLACK]: '♜' },
  [PieceType.KNIGHT]: { [Color.WHITE]: '♘', [Color.BLACK]: '♞' },
  [PieceType.BISHOP]: { [Color.WHITE]: '♗', [Color.BLACK]: '♝' },
  [PieceType.QUEEN]: { [Color.WHITE]: '♕', [Color.BLACK]: '♛' },
  [PieceType.KING]: { [Color.WHITE]: '♔', [Color.BLACK]: '♚' },
};

const ChessPieceComponent: React.FC<{ piece: ChessPiece; color?: string }> = ({ piece, color }) => {
  let pieceColor: string = color || '';

  if (!pieceColor) {
    switch (piece.type) {
      case PieceType.PAWN:
        pieceColor = piece.color === Color.WHITE ? CHESS_CONFIG.WHITE_PAWN_COLOR : CHESS_CONFIG.BLACK_PAWN_COLOR;
        break;
      case PieceType.ROOK:
        pieceColor = piece.color === Color.WHITE ? CHESS_CONFIG.WHITE_ROOK_COLOR : CHESS_CONFIG.BLACK_ROOK_COLOR;
        break;
      case PieceType.KNIGHT:
        pieceColor = piece.color === Color.WHITE ? CHESS_CONFIG.WHITE_KNIGHT_COLOR : CHESS_CONFIG.BLACK_KNIGHT_COLOR;
        break;
      case PieceType.BISHOP:
        pieceColor = piece.color === Color.WHITE ? CHESS_CONFIG.WHITE_BISHOP_COLOR : CHESS_CONFIG.BLACK_BISHOP_COLOR;
        break;
      case PieceType.QUEEN:
        pieceColor = piece.color === Color.WHITE ? CHESS_CONFIG.WHITE_QUEEN_COLOR : CHESS_CONFIG.BLACK_QUEEN_COLOR;
        break;
      case PieceType.KING:
        pieceColor = piece.color === Color.WHITE ? CHESS_CONFIG.WHITE_KING_COLOR : CHESS_CONFIG.BLACK_KING_COLOR;
        break;
      default:
        pieceColor = piece.color === Color.WHITE ? CHESS_CONFIG.WHITE_PIECE_COLOR : CHESS_CONFIG.BLACK_PIECE_COLOR;
    }
  }

  return (
    <span className={`${CHESS_CONFIG.PIECE_SIZE} ${pieceColor} leading-none`}>
      {pieceUnicode[piece.type][piece.color]}
    </span>
  );
};

export default ChessPieceComponent;
