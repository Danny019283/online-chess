import axios from "axios";

const API_URL = "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
});

export type LoginData = {
  username: string;
  password: string;
};

export type RegisterData = {
  username: string;
  password: string;
};

export type RankingPlayer = {
  posicion: number;
  nombre: string;
  partidas: number;
  victorias: number;
  derrotas: number;
  puntos: number;
};

export type MatchHistory = {
  id: number;
  jugador1: string;
  jugador2: string;
  resultado: string;
  ganador: string;
  fecha: string;
  movimientos: number;
};

export async function loginUser(data: LoginData) {
  return api.post("/auth/login", data);
}

export async function registerUser(data: RegisterData) {
  return api.post("/auth/register", data);
}

export async function getRanking() {
  return api.get<RankingPlayer[]>("/ranking");
}

export async function getHistory() {
  return api.get<MatchHistory[]>("/history");
}