import { PieceDTO } from './pieceDTO';

export interface GameStateDTO {
  id: string;
  board: (PieceDTO | null)[][];
  turn: 'white' | 'black';
  player1: { id: number; username: string };
  player2: { id: number; username: string } | null;
  check: boolean;
  checkmate: boolean;
  winner: string | null;
  winnerName: string | null;
  status: 'waiting' | 'active' | 'finished';
  whiteTimeMs: number;
  blackTimeMs: number;
}
