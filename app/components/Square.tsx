import React from 'react';
import { ChessPiece, PieceType, Color } from '../types/chess';
import ChessPieceComponent from './ChessPieceComponent';
import { CHESS_CONFIG } from '../constants/chessConfig';

interface SquareProps {
  piece: ChessPiece | null;
  isLight: boolean;
  isSelected: boolean;
  isPossibleMove: boolean;
  onClick: () => void;
}

const Square: React.FC<SquareProps> = ({ piece, isLight, isSelected, isPossibleMove, onClick }) => {
  return (
    <div
      className={`w-full h-full flex items-center justify-center
        ${isLight ? 'bg-amber-200' : 'bg-amber-700'}
        ${isSelected ? 'bg-yellow-300' : ''}
        ${isPossibleMove ? 'bg-green-300' : ''}
        hover:bg-blue-200 cursor-pointer`}
      onClick={onClick}
    >
      {piece && (
        <ChessPieceComponent
          piece={piece}
          color={piece.type === PieceType.PAWN && piece.color === Color.BLACK ? CHESS_CONFIG.BLACK_PAWN_COLOR : undefined}
        />
      )}
    </div>
  );
};

export default Square;
