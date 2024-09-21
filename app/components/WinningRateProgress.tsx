import React from 'react';

interface WinningRateProgressProps {
  winningRate: number;
}

const WinningRateProgress: React.FC<WinningRateProgressProps> = ({ winningRate }) => {
  const whiteWidth = `${winningRate}%`;
  const blackWidth = `${100 - winningRate}%`;

  const getWinningPlayer = () => {
    if (winningRate > 52) return 'White is winning';
    if (winningRate < 48) return 'Black is winning';
    return 'Equal position';
  };

  return (
    <div className="w-full mt-4">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-semibold">White</span>
        <span className="text-sm font-semibold">{getWinningPlayer()}</span>
        <span className="text-sm font-semibold">Black</span>
      </div>
      <div className="flex h-4 rounded-full overflow-hidden">
        <div
          className="bg-white border border-gray-300"
          style={{ width: whiteWidth }}
        ></div>
        <div
          className="bg-gray-800"
          style={{ width: blackWidth }}
        ></div>
      </div>
      <div className="text-center mt-2">
        <span className="text-sm font-semibold">
          Winning Rate: {winningRate.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

export default WinningRateProgress;
