import { AppDataSource } from '../database/connection';
import { Session, generateRoomId } from '../entities/session';
import { gameStateManager, GameSession } from './gameStateManager';

export class GameService {
  private gameRepository = AppDataSource.getRepository(Session);

  async createGame(player1Id: number): Promise<string> {
    const roomId = generateRoomId();
    const game = this.gameRepository.create({
      id: roomId,
      player1_id: player1Id,
      status: 'waiting',
    });

    await this.gameRepository.save(game);
    gameStateManager.createGame(roomId, player1Id);

    return roomId;
  }

  async joinGame(gameId: string, player2Id: number): Promise<Session> {
    const game = await this.gameRepository.findOne({ where: { id: gameId } });
    if (!game) throw new Error('Game not found');
    if (game.status !== 'waiting') throw new Error('Game is not waiting for players');
    if (game.player1_id === player2Id) throw new Error('Cannot join your own game');

    game.player2_id = player2Id;
    game.status = 'active';

    if (!gameStateManager.getGame(gameId)) {
      gameStateManager.createGame(gameId, game.player1_id);
    }
    gameStateManager.setPlayer2(gameId, player2Id);

    await this.gameRepository.save(game);
    const updatedGame = await this.getGame(gameId);
    if (!updatedGame) throw new Error('Game not found');
    return updatedGame;
  }

  async getGame(gameId: string): Promise<Session | null> {
    return this.gameRepository.findOne({
      where: { id: gameId },
      relations: ['player1', 'player2'],
    });
  }

  async refreshClock(gameId: string): Promise<void> {
    const winner = gameStateManager.refreshClock(gameId);
    if (!winner) return;

    await this.finishGameByWinnerColor(gameId, winner);
  }

  getGameState(gameId: string): GameSession | undefined {
    return gameStateManager.getGame(gameId);
  }

  async makeMove(
    gameId: string,
    userId: number,
    from: [number, number],
    to: [number, number],
    promotionPiece?: "queen" | "rook" | "bishop" | "knight"
  ): Promise<boolean> {
    await this.refreshClock(gameId);
    const gameSession = gameStateManager.getGame(gameId);
    if (gameSession?.session.hasWinner()) return false;

    const movingColor = gameSession?.currentTurn;
    const success = gameStateManager.makeMove(gameId, userId, from, to, promotionPiece);
    if (!success) return false;

    const game = await this.gameRepository.findOne({ where: { id: gameId } });
    const session = gameStateManager.getGame(gameId);

    if (game && movingColor) {
      const moves = Array.isArray(game.moves) ? game.moves : [];
      game.moves = [
        ...moves,
        {
          from: { row: from[0], col: from[1] },
          to: { row: to[0], col: to[1] },
          userId,
          color: movingColor,
          movedAt: new Date().toISOString(),
          promotion: promotionPiece,
        },
      ];
    }

    if (game && session?.session.hasWinner()) {
      game.status = 'finished';
      game.winner_id = this.getWinnerIdByColor(session, session.session.getWinner() as 'white' | 'black');
    }

    if (game) {
      await this.gameRepository.save(game);
    }

    return true;
  }

  getLegalMoves(gameId: string, userId: number, position: [number, number]): [number, number][] {
    const session = gameStateManager.getGame(gameId);
    if (!session) return [];
    if (!session.board.isInsideBoard(position[0], position[1])) return [];

    const piece = session.board.pieces[position[0]][position[1]];
    if (!piece) return [];

    const isPracticeMode = !session.player2Id && session.player1Id === userId;
    if (!isPracticeMode) {
      if (userId !== session.player1Id && userId !== session.player2Id) return [];
      const userColor = userId === session.player1Id ? 'white' : 'black';
      if (piece.color !== userColor || userColor !== session.currentTurn) return [];
    }

    return session.game.getLegalMovements(session.board, position);
  }

  async getWinner(gameId: string): Promise<number | null> {
    const game = await this.getGame(gameId);
    return game?.winner_id || null;
  }

  private async finishGameByWinnerColor(gameId: string, winner: 'white' | 'black'): Promise<void> {
    const game = await this.gameRepository.findOne({ where: { id: gameId } });
    const session = gameStateManager.getGame(gameId);
    if (!game || !session) return;

    game.status = 'finished';
    game.winner_id = this.getWinnerIdByColor(session, winner);
    await this.gameRepository.save(game);
  }

  private getWinnerIdByColor(session: GameSession, winner: 'white' | 'black'): number {
    if (winner === 'white') return session.player1Id;
    return session.player2Id || session.player1Id;
  }
}

export const gameService = new GameService();
