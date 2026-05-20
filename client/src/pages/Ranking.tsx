import { useEffect, useState } from "react";
import { getRanking, type RankingPlayer } from "../api";

function Ranking() {
  const [ranking, setRanking] = useState<RankingPlayer[]>([]);
  const [message, setMessage] = useState("Cargando ranking...");

  useEffect(() => {
    async function loadRanking() {
      try {
        const response = await getRanking();
        setRanking(response.data);
        setMessage(response.data.length === 0 ? "Todavia no hay jugadores registrados." : "");
      } catch {
        setMessage("No se pudo cargar el ranking.");
      }
    }

    loadRanking();
  }, []);

  return (
    <main className="ranking-container">
      <section className="ranking-header">
        <h1>Ranking de jugadores</h1>
        <p>Clasificacion general segun el rendimiento en partidas 1 vs 1.</p>
      </section>

      <section className="ranking-card">
        {message ? (
          <p className="empty-state">{message}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Posicion</th>
                <th>Jugador</th>
                <th>Partidas</th>
                <th>Victorias</th>
                <th>Derrotas</th>
                <th>Puntos</th>
              </tr>
            </thead>

            <tbody>
              {ranking.map((jugador) => (
                <tr key={jugador.nombre}>
                  <td className="position-cell">
                    {jugador.posicion === 1
                      ? "1"
                      : jugador.posicion === 2
                      ? "2"
                      : jugador.posicion === 3
                      ? "3"
                      : jugador.posicion}
                  </td>
                  <td>{jugador.nombre}</td>
                  <td>{jugador.partidas}</td>
                  <td>{jugador.victorias}</td>
                  <td>{jugador.derrotas}</td>
                  <td>
                    <strong>{jugador.puntos}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

export default Ranking;
