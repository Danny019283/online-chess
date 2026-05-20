import { AppDataSource } from '../database/connection';
import { GameEntity } from '../entities/GameEntity';
import { gameStateManager, GameSession } from './gameStateManager';

export class GameService {
  private gameRepository = AppDataSource.getRepository(GameEntity);

  async createGame(player1Id: number): Promise<string> {
    const game = this.gameRepository.create({
      player1_id: player1Id,
      status: 'waiting',
    });

    await this.gameRepository.save(game);
    gameStateManager.createGame(game.id, player1Id);

    return game.id;
  }

  async joinGame(gameId: string, player2Id: number): Promise<GameEntity> {
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

  async getGame(gameId: string): Promise<GameEntity | null> {
    return this.gameRepository.findOne({
      where: { id: gameId },
      relations: ['player1', 'player2'],
    });
  }

  getGameState(gameId: string): GameSession | undefined {
    return gameStateManager.getGame(gameId);
  }

  async makeMove(gameId: string, userId: number, from: [number, number], to: [number, number]): Promise<boolean> {
    const success = gameStateManager.makeMove(gameId, userId, from, to);
    if (!success) return false;

    const game = await this.gameRepository.findOne({ where: { id: gameId } });
    const session = gameStateManager.getGame(gameId);

    if (game && session?.session.hasWinner()) {
      game.status = 'finished';
      game.winner_id = session.session.getWinner() === 'white' ? session.player1Id : session.player2Id;
      await this.gameRepository.save(game);
    }

    return true;
  }

  getLegalMoves(gameId: string, position: [number, number]): [number, number][] {
    const session = gameStateManager.getGame(gameId);
    if (!session) return [];
    if (!session.board.isInsideBoard(position[0], position[1])) return [];

    const piece = session.board.pieces[position[0]][position[1]];
    if (!piece) return [];

    const moves = piece.getValidMovements(session.board, position);
    return moves || [];
  }

  async getWinner(gameId: string): Promise<number | null> {
    const game = await this.getGame(gameId);
    return game?.winner_id || null;
  }
}

export const gameService = new GameService();
