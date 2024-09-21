export enum PieceType {
  PAWN = 'PAWN',
  ROOK = 'ROOK',
  KNIGHT = 'KNIGHT',
  BISHOP = 'BISHOP',
  QUEEN = 'QUEEN',
  KING = 'KING',
}

export enum Color {
  WHITE = 'WHITE',
  BLACK = 'BLACK',
}

export interface ChessPiece {
  type: PieceType;
  color: Color;
}
