import { AppDataSource } from '../database/connection';
import { Session, generateRoomId } from '../entities/session';
import { gameStateManager, GameSession } from './gameStateManager';

export class GameService {
  private gameRepository = AppDataSource.getRepository(Session);

  async createGame(player1Id: number): Promise<string> {
    const roomId = generateRoomId();
    gameStateManager.createGame(roomId, player1Id);
    return roomId;
  }

  async joinGame(gameId: string, player2Id: number): Promise<Session> {
    const gameSession = gameStateManager.getGame(gameId);
    if (!gameSession) throw new Error('Game not found');
    if (gameSession.player2Id) throw new Error('Game is not waiting for players');
    if (gameSession.player1Id === player2Id) throw new Error('Cannot join your own game');

    const game = this.gameRepository.create({
      id: gameId,
      player1_id: gameSession.player1Id,
      player2_id: player2Id,
      status: 'active',
    });

    await this.gameRepository.save(game);
    gameStateManager.setPlayer2(gameId, player2Id);

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

  async leaveGame(gameId: string, userId: number): Promise<void> {
    const gameSession = gameStateManager.getGame(gameId);
    if (!gameSession) return;

    const isPlayer1 = gameSession.player1Id === userId;
    const isPlayer2 = gameSession.player2Id === userId;
    if (!isPlayer1 && !isPlayer2) return;

    const game = await this.gameRepository.findOne({ where: { id: gameId } });

    if (!gameSession.player2Id) {
      gameStateManager.deleteGame(gameId);
      return;
    }

    const winner = isPlayer1 ? 'black' : 'white';
    gameSession.session._winner = winner;

    if (game) {
      game.status = 'finished';
      game.winner_id = this.getWinnerIdByColor(gameSession, winner);
      await this.gameRepository.save(game);
    }

    gameStateManager.deleteGame(gameId);
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
