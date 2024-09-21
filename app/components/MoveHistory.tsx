import React from 'react';
import { Color } from '../types/chess';

interface Move {
  piece: string;
  from: string;
  to: string;
  player: Color;
}

interface MoveHistoryProps {
  moves: Move[];
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ moves }) => {
  return (
    <div className="w-full md:w-64 h-64 md:h-[480px] overflow-y-auto bg-gray-100 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Move History</h2>
      <ul className="space-y-2 text-sm">
        {moves.map((move, index) => (
          <li key={index} className={`${move.player === Color.WHITE ? 'text-black' : 'text-gray-600'}`}>
            {index + 1}. {move.player === Color.WHITE ? 'White' : 'Black'} - {move.piece} {move.from} to {move.to}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MoveHistory;
