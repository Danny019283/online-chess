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
  'http://127.0.0.1',
  'http://127.0.0.1:80',
  'http://127.0.0.1:5173',
  process.env.CLIENT_ORIGIN,
].filter(Boolean) as string[];

// Add local network IPs (0.0.0.0 matches any interface)
const corsOptions = {
  origin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin) {
      callback(null, true);
      return;
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    // Allow any local network IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    try {
      const url = new URL(origin);
      const hostname = url.hostname;
      
      // Check if it's a local IP
      if (
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.') ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1'
      ) {
        callback(null, true);
        return;
      }
    } catch (e) {
      // Invalid URL, reject
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));
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
