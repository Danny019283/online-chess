import { Board } from '../core_entities/table';
import { Game } from '../gameLogic/gameRules';
import { Piece } from '../core_entities/piece';
import { Session } from '../core_entities/session';

export interface GameSession {
  board: Board;
  game: Game;
  session: Session;
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
    const session = new Session('player1', 'player2');
    const gameSession: GameSession = {
      board,
      game,
      session,
      player1Id,
      currentTurn: 'white',
      createdAt: new Date(),
    };
    this.games.set(gameId, gameSession);
    return gameSession;
  }

  getGame(gameId: string): GameSession | undefined {
    return this.games.get(gameId);
  }

  setPlayer2(gameId: string, player2Id: number): void {
    const gameSession = this.games.get(gameId);
    if (gameSession) {
      gameSession.player2Id = player2Id;
    }
  }

  makeMove(gameId: string, from: [number, number], to: [number, number]): boolean {
    const gameSession = this.games.get(gameId);
    if (!gameSession) return false;

    const { board, game, session, currentTurn } = gameSession;
    const piece = board.pieces[from[0]][from[1]];

    if (!piece || piece.color !== currentTurn) {
      return false;
    }

    const success = game.movePiece(board, session, from, to);
    if (success) {
      piece.moved = true;
      gameSession.currentTurn = currentTurn === 'white' ? 'black' : 'white';
    }
    return success;
  }

  deleteGame(gameId: string): void {
    this.games.delete(gameId);
  }
}

export const gameStateManager = new GameStateManager();
