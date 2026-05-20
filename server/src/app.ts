import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import authRoutes from './routes/authRoutes';
import gameRoutes from './routes/gameRoutes';
import statsRoutes from './routes/statsRoutes';
import { Pool } from 'pg';

const app = express();

const allowedOrigins = [
  'http://localhost',
  'http://localhost:80',
  'http://localhost:5173',
  process.env.CLIENT_ORIGIN,
].filter(Boolean) as string[];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

const pgSession = connectPgSimple(session);
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'chess_db',
});

app.use(
  session({
    store: new pgSession({ pool, createTableIfMissing: true }),
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
app.use('/api', statsRoutes);

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
