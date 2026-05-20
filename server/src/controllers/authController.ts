import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { AuthResponseDTO } from '../dtos/authResponseDTO';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
      }

      const user = await authService.register(username, password);
      const response: AuthResponseDTO = {
        userId: user.id,
        username: user.username,
      };

      req.session.userId = user.id;
      res.status(201).json(response);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
      }

      const user = await authService.login(username, password);
      const response: AuthResponseDTO = {
        userId: user.id,
        username: user.username,
      };

      req.session.userId = user.id;
      res.status(200).json(response);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  logout(req: Request, res: Response): void {
    req.session.destroy(() => {
      res.status(200).json({ message: 'Logged out' });
    });
  }

  async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.session.userId;
      if (!userId) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      await authService.deleteAccount(userId);
      req.session.destroy(() => {
        res.status(200).json({ message: 'Account deleted' });
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const authController = new AuthController();
