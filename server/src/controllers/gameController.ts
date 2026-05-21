import { Request, Response } from 'express';
import { gameService } from '../services/gameService';
import { GameMapper } from '../mappers/gameMapper';
import { MoveResultDTO } from '../dtos/moveResultDTO';

export class GameController {
  async createGame(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).session.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const gameId = await gameService.createGame(userId);
      res.status(201).json({ gameId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async joinGame(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const userId = (req as any).session.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const game = await gameService.joinGame(gameId, userId);
      const gameSession = gameService.getGameState(gameId);

      if (!gameSession) {
        res.status(404).json({ error: 'Game state not found' });
        return;
      }

      const gameState = GameMapper.gameSessionToStateDTO(gameSession, game);
      res.status(200).json(gameState);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getGameState(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;

      await gameService.refreshClock(gameId);
      const game = await gameService.getGame(gameId);
      const gameSession = gameService.getGameState(gameId);

      if (!game || !gameSession) {
        res.status(404).json({ error: 'Game not found' });
        return;
      }

      const gameState = GameMapper.gameSessionToStateDTO(gameSession, game);
      res.status(200).json(gameState);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async makeMove(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const { from, to, promotionPiece } = req.body;
      const userId = (req as any).session.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (
        !from ||
        !to ||
        typeof from.row !== 'number' ||
        typeof from.col !== 'number' ||
        typeof to.row !== 'number' ||
        typeof to.col !== 'number'
      ) {
        res.status(400).json({ error: 'Invalid move format' });
        return;
      }

      const validPromotions = ['queen', 'rook', 'bishop', 'knight'];
      const promotion = promotionPiece && validPromotions.includes(promotionPiece)
        ? promotionPiece
        : undefined;

      const success = await gameService.makeMove(
        gameId,
        userId,
        [from.row, from.col],
        [to.row, to.col],
        promotion
      );

      const game = await gameService.getGame(gameId);
      const gameSession = gameService.getGameState(gameId);

      const result: MoveResultDTO = {
        success,
      };

      if (success && game && gameSession) {
        result.gameState = GameMapper.gameSessionToStateDTO(gameSession, game);
      } else if (!success) {
        result.reason = 'Invalid move';
      }

      res.status(success ? 200 : 400).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getLegalMoves(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const { row, col } = req.query;
      const userId = (req as any).session.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await gameService.refreshClock(gameId);

      if (typeof row !== 'string' || typeof col !== 'string') {
        res.status(400).json({ error: 'Invalid position' });
        return;
      }

      const moves = gameService.getLegalMoves(gameId, userId, [parseInt(row), parseInt(col)]);
      const position = { row: parseInt(row), col: parseInt(col) };
      const result = GameMapper.legalMovesToDTO(position, moves);

      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const gameController = new GameController();
