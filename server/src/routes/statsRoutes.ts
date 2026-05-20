import { Router } from 'express';
import { statsController } from '../controllers/statsController';

const router = Router();

router.get('/ranking', (req, res) => statsController.getRanking(req, res));
router.get('/history', (req, res) => statsController.getHistory(req, res));

export default router;
