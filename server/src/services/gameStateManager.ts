import { Board } from '../../entities/table';
import { Game } from '../../gameLogic/gameRules';
import { Piece } from '../../entities/piece';

export interface GameSession {
  board: Board;
  game: Game;
  player1Id: number;
  player2Id?: number;
  currentTurn: 'white' | 'black';
  createdAt: Date;
}

class GameStateManager {
  private games: Map<string, GameSession> = new Map();

  createGame(gameId: string, player1Id: number): GameSession {
    const board = new Board();
    const game = new Game();
    const session: GameSession = {
      board,
      game,
      player1Id,
      currentTurn: 'white',
      createdAt: new Date(),
    };
    this.games.set(gameId, session);
    return session;
  }

  getGame(gameId: string): GameSession | undefined {
    return this.games.get(gameId);
  }

  setPlayer2(gameId: string, player2Id: number): void {
    const session = this.games.get(gameId);
    if (session) {
      session.player2Id = player2Id;
    }
  }

  makeMove(gameId: string, from: [number, number], to: [number, number]): boolean {
    const session = this.games.get(gameId);
    if (!session) return false;

    const { board, game, currentTurn } = session;
    const piece = board.pieces[from[0]][from[1]];

    if (!piece || piece.color !== currentTurn) {
      return false;
    }

    const success = game.movePiece(board, { _winner: null, hasWinner: () => false } as any, from, to);
    if (success) {
      piece.moved = true;
      session.currentTurn = currentTurn === 'white' ? 'black' : 'white';
    }
    return success;
  }

  deleteGame(gameId: string): void {
    this.games.delete(gameId);
  }
}

export const gameStateManager = new GameStateManager();
