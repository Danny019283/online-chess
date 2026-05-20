import axios from "axios";

// In Docker: /api proxies to backend:3000/api
// Locally: http://localhost:3000/api
const API_URL = import.meta.env.PROD ? "/api" : "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies with requests
});

// Auth Types
export type LoginData = {
  username: string;
  password: string;
};

export type RegisterData = {
  username: string;
  password: string;
};

export type AuthResponse = {
  userId: number;
  username: string;
};

// Game Types
export type PositionDTO = {
  row: number;
  col: number;
};

export type PieceDTO = {
  type: 'King' | 'Queen' | 'Bishop' | 'Knight' | 'Tower' | 'Pawn';
  color: 'white' | 'black';
};

export type GameStateDTO = {
  id: string;
  board: (PieceDTO | null)[][];
  turn: 'white' | 'black';
  player1: { id: number; username: string };
  player2: { id: number; username: string } | null;
  check: boolean;
  checkmate: boolean;
  winner: string | null;
  winnerName: string | null;
  status: 'waiting' | 'active' | 'finished';
  whiteTimeMs: number;
  blackTimeMs: number;
};

export type MoveDTO = {
  from: PositionDTO;
  to: PositionDTO;
};

export type MoveResultDTO = {
  success: boolean;
  reason?: string;
  gameState?: GameStateDTO;
};

export type LegalMovesDTO = {
  position: PositionDTO;
  moves: PositionDTO[];
};

// Legacy types (keep for compatibility)
export type RankingPlayer = {
  posicion: number;
  nombre: string;
  partidas: number;
  victorias: number;
  derrotas: number;
  puntos: number;
};

export type MatchHistory = {
  id: string;
  jugador1: string;
  jugador2: string;
  resultado: string;
  ganador: string;
  fecha: string;
  movimientos: number;
};

// Auth Endpoints
export async function loginUser(data: LoginData) {
  return api.post<AuthResponse>("/auth/login", data);
}

export async function registerUser(data: RegisterData) {
  return api.post<AuthResponse>("/auth/register", data);
}

export async function logoutUser() {
  return api.post("/auth/logout");
}

export async function deleteAccount() {
  return api.delete("/auth/me");
}

// Game Endpoints
export async function createGame() {
  return api.post<{ gameId: string }>("/games");
}

export async function joinGame(gameId: string) {
  return api.post<GameStateDTO>(`/games/${gameId}/join`);
}

export async function getGameState(gameId: string) {
  return api.get<GameStateDTO>(`/games/${gameId}`);
}

export async function makeMove(gameId: string, move: MoveDTO) {
  return api.post<MoveResultDTO>(`/games/${gameId}/move`, move);
}

export async function getLegalMoves(gameId: string, row: number, col: number) {
  return api.get<LegalMovesDTO>(`/games/${gameId}/moves`, {
    params: { row, col },
  });
}

// Legacy endpoints (keep for compatibility)
export async function getRanking() {
  return api.get<RankingPlayer[]>("/ranking");
}

export async function getHistory() {
  return api.get<MatchHistory[]>("/history");
}
