import { Board } from '../entities/table';
import { Game } from '../gameLogic/gameRules';
import { Piece } from '../entities/piece';
import { Session } from '../entities/session';

const INITIAL_TIME_MS = 5 * 60 * 1000;

export interface GameSession {
  board: Board;
  game: Game;
  session: Session;
  player1Id: number;
  player2Id?: number;
  currentTurn: 'white' | 'black';
  remainingTimeMs: {
    white: number;
    black: number;
  };
  turnStartedAt?: number;
  createdAt: Date;
}

class GameStateManager {
  private games: Map<string, GameSession> = new Map();
  private readonly MAX_WAITING_TIME_MS = 10 * 60 * 1000;

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
      remainingTimeMs: {
        white: INITIAL_TIME_MS,
        black: INITIAL_TIME_MS,
      },
      turnStartedAt: Date.now(),
      createdAt: new Date(),
    };
    this.games.set(gameId, gameSession);
    return gameSession;
  }

  getGame(gameId: string): GameSession | undefined {
    return this.games.get(gameId);
  }

  cleanupOldGames(): string[] {
    const expired: string[] = [];
    const now = Date.now();

    for (const [gameId, session] of this.games.entries()) {
      const age = now - session.createdAt.getTime();
      const isWaitingExpired = !session.player2Id && age > this.MAX_WAITING_TIME_MS;
      const isFinishedExpired = session.session.hasWinner() && age > this.MAX_WAITING_TIME_MS;

      if (isWaitingExpired || isFinishedExpired) {
        expired.push(gameId);
      }
    }

    for (const gameId of expired) {
      this.games.delete(gameId);
    }

    return expired;
  }

  setPlayer2(gameId: string, player2Id: number): void {
    const gameSession = this.games.get(gameId);
    if (gameSession) {
      gameSession.player2Id = player2Id;
      gameSession.turnStartedAt = Date.now();
    }
  }

  refreshClock(gameId: string): 'white' | 'black' | null {
    const gameSession = this.games.get(gameId);
    if (!gameSession) return null;

    return this.applyClock(gameSession);
  }

  makeMove(
    gameId: string,
    userId: number,
    from: [number, number],
    to: [number, number],
    promotionPiece?: "queen" | "rook" | "bishop" | "knight"
  ): boolean {
    const gameSession = this.games.get(gameId);
    if (!gameSession) return false;

    if (this.applyClock(gameSession)) {
      return false;
    }

    const { board, game, session, currentTurn } = gameSession;
    if (!board.isInsideBoard(from[0], from[1]) || !board.isInsideBoard(to[0], to[1])) {
      return false;
    }

    const isPracticeMode = !gameSession.player2Id && gameSession.player1Id === userId;
    if (!isPracticeMode) {
      if (gameSession.player1Id !== userId && gameSession.player2Id !== userId) {
        return false;
      }
    }

    const piece = board.pieces[from[0]][from[1]];
    if (!piece) {
      return false;
    }

    const userColor = userId === gameSession.player1Id ? 'white' : 'black';
    if (!isPracticeMode && piece.color !== userColor) {
      return false;
    }

    if (piece.color !== currentTurn) {
      return false;
    }

    const success = game.movePiece(board, session, from, to, promotionPiece);
    if (success) {
      piece.moved = true;
      gameSession.currentTurn = currentTurn === 'white' ? 'black' : 'white';
      gameSession.turnStartedAt = Date.now();
    }
    return success;
  }

  deleteGame(gameId: string): void {
    this.games.delete(gameId);
  }

  private applyClock(gameSession: GameSession): 'white' | 'black' | null {
    if (gameSession.session.hasWinner()) {
      return null;
    }

    if (!gameSession.player2Id) {
      return null;
    }

    if (!gameSession.turnStartedAt) {
      gameSession.turnStartedAt = Date.now();
      return null;
    }

    const now = Date.now();
    const elapsed = now - gameSession.turnStartedAt;
    const currentTurn = gameSession.currentTurn;
    gameSession.remainingTimeMs[currentTurn] = Math.max(
      0,
      gameSession.remainingTimeMs[currentTurn] - elapsed,
    );
    gameSession.turnStartedAt = now;

    if (gameSession.remainingTimeMs[currentTurn] > 0) {
      return null;
    }

    const winner = currentTurn === 'white' ? 'black' : 'white';
    gameSession.session._winner = winner;
    return winner;
  }
}

export const gameStateManager = new GameStateManager();
