import { Request, Response } from 'express';
import { statsService } from '../services/statsService';

export class StatsController {
  async getRanking(req: Request, res: Response): Promise<void> {
    try {
      const ranking = await statsService.getRanking();
      res.status(200).json(ranking);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const history = await statsService.getHistory();
      res.status(200).json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const statsController = new StatsController();
