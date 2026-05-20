import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { AppDataSource } from './database/connection';
import authRoutes from './routes/authRoutes';
import gameRoutes from './routes/gameRoutes';

const app = express();

app.use(cors({ origin: 'http://localhost', credentials: true }));
app.use(express.json());

const pgSession = connectPgSimple(session);

app.use(
  session({
    store: new pgSession({
      pool: AppDataSource.getRepository('').manager.connection.driver.pool,
    }),
    secret: process.env.SESSION_SECRET || 'dev_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    },
  }),
);

app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Chess API' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(
  (error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  },
);

export default app;
