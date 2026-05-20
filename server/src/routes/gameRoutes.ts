import { Router, Request, Response } from 'express';
import { gameController } from '../controllers/gameController';

const router = Router();

const authMiddleware = (req: Request, res: Response, next: any) => {
  if (!(req as any).session?.userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};

router.post('/', authMiddleware, (req, res) => gameController.createGame(req, res));
router.post('/:gameId/join', authMiddleware, (req, res) => gameController.joinGame(req, res));
router.post('/:gameId/move', authMiddleware, (req, res) => gameController.makeMove(req, res));
router.get('/:gameId', (req, res) => gameController.getGameState(req, res));
router.get('/:gameId/moves', authMiddleware, (req, res) => gameController.getLegalMoves(req, res));

export default router;
