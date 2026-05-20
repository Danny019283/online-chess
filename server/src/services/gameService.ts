import { AppDataSource } from '../database/connection';
import { GameEntity } from '../entities/GameEntity';
import { gameStateManager, GameSession } from './gameStateManager';
import { v4 as uuidv4 } from 'uuid';

export class GameService {
  private gameRepository = AppDataSource.getRepository(GameEntity);

  async createGame(player1Id: number): Promise<string> {
    const gameId = uuidv4();

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

    game.player2_id = player2Id;
    game.status = 'active';

    gameStateManager.setPlayer2(gameId, player2Id);

    return this.gameRepository.save(game);
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

  makeMove(gameId: string, from: [number, number], to: [number, number]): boolean {
    return gameStateManager.makeMove(gameId, from, to);
  }

  getLegalMoves(gameId: string, position: [number, number]): [number, number][] {
    const session = gameStateManager.getGame(gameId);
    if (!session) return [];

    const piece = session.board.pieces[position[0]][position[1]];
    if (!piece) return [];

    const moves = piece.getValidMovements(session.board, position);
    return moves || [];
  }
}

export const gameService = new GameService();
