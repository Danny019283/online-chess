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
      const session = gameService.getGameState(gameId);

      if (!session) {
        res.status(404).json({ error: 'Game state not found' });
        return;
      }

      const gameState = GameMapper.gameSessionToStateDTO(session, game, session.game);
      res.status(200).json(gameState);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getGameState(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;

      const game = await gameService.getGame(gameId);
      const session = gameService.getGameState(gameId);

      if (!game || !session) {
        res.status(404).json({ error: 'Game not found' });
        return;
      }

      const gameState = GameMapper.gameSessionToStateDTO(session, game, session.game);
      res.status(200).json(gameState);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async makeMove(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const { from, to } = req.body;
      const userId = (req as any).session.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!from || !to || typeof from.row !== 'number' || typeof from.col !== 'number') {
        res.status(400).json({ error: 'Invalid move format' });
        return;
      }

      const success = gameService.makeMove(gameId, [from.row, from.col], [to.row, to.col]);

      const game = await gameService.getGame(gameId);
      const session = gameService.getGameState(gameId);

      const result: MoveResultDTO = {
        success,
      };

      if (success && game && session) {
        result.gameState = GameMapper.gameSessionToStateDTO(session, game, session.game);
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

      if (typeof row !== 'string' || typeof col !== 'string') {
        res.status(400).json({ error: 'Invalid position' });
        return;
      }

      const moves = gameService.getLegalMoves(gameId, [parseInt(row), parseInt(col)]);
      const position = { row: parseInt(row), col: parseInt(col) };
      const result = GameMapper.legalMovesToDTO(position, moves);

      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const gameController = new GameController();
