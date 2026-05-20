import { AppDataSource } from '../database/connection';
import { Session } from '../entities/session';
import { User } from '../entities/user';

export interface RankingPlayer {
  posicion: number;
  nombre: string;
  partidas: number;
  victorias: number;
  derrotas: number;
  puntos: number;
}

export interface MatchHistory {
  id: string;
  jugador1: string;
  jugador2: string;
  resultado: string;
  ganador: string;
  fecha: string;
  movimientos: number;
}

class StatsService {
  private userRepository = AppDataSource.getRepository(User);
  private sessionRepository = AppDataSource.getRepository(Session);

  async getRanking(): Promise<RankingPlayer[]> {
    const [users, games] = await Promise.all([
      this.userRepository.find(),
      this.sessionRepository.find({
        where: { status: 'finished' },
      }),
    ]);

    const ranking = users.map((user) => {
      const userGames = games.filter(
        (game) => game.player1_id === user.id || game.player2_id === user.id,
      );
      const victorias = userGames.filter((game) => game.winner_id === user.id).length;
      const derrotas = userGames.filter(
        (game) => game.winner_id !== null && game.winner_id !== undefined && game.winner_id !== user.id,
      ).length;

      return {
        posicion: 0,
        nombre: user.username,
        partidas: userGames.length,
        victorias,
        derrotas,
        puntos: victorias * 3,
      };
    });

    return ranking
      .sort((a, b) => b.puntos - a.puntos || b.victorias - a.victorias || a.nombre.localeCompare(b.nombre))
      .map((player, index) => ({ ...player, posicion: index + 1 }));
  }

  async getHistory(): Promise<MatchHistory[]> {
    const games = await this.sessionRepository.find({
      relations: ['player1', 'player2'],
      order: { createdAt: 'DESC' },
      take: 50,
    });

    return games.map((game) => {
      const winnerName = this.getWinnerName(game);

      return {
        id: game.id,
        jugador1: game.player1?.username || 'Jugador 1',
        jugador2: game.player2?.username || 'Esperando rival',
        resultado: this.getResult(game),
        ganador: winnerName,
        fecha: game.createdAt.toISOString().slice(0, 10),
        movimientos: Array.isArray(game.moves) ? game.moves.length : 0,
      };
    });
  }

  private getResult(game: Session): string {
    if (game.status === 'waiting') return 'Esperando';
    if (game.status === 'active') return 'En curso';
    if (!game.winner_id) return 'Sin ganador';
    if (game.winner_id === game.player1_id) return '1-0';
    if (game.winner_id === game.player2_id) return '0-1';
    return 'Finalizada';
  }

  private getWinnerName(game: Session): string {
    if (game.status === 'waiting') return 'Pendiente';
    if (game.status === 'active') return 'En curso';
    if (!game.winner_id) return 'Sin ganador';
    if (game.winner_id === game.player1_id) return game.player1?.username || 'Jugador 1';
    if (game.winner_id === game.player2_id) return game.player2?.username || 'Jugador 2';
    return 'Sin ganador';
  }
}

export const statsService = new StatsService();
