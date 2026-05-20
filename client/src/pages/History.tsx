import { useEffect, useState } from "react";
import { getHistory, type MatchHistory } from "../api";

function History() {
  const [historial, setHistorial] = useState<MatchHistory[]>([]);
  const [message, setMessage] = useState("Cargando historial...");

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await getHistory();
        setHistorial(response.data);
        setMessage(response.data.length === 0 ? "Todavia no hay partidas registradas." : "");
      } catch {
        setMessage("No se pudo cargar el historial.");
      }
    }

    loadHistory();
  }, []);

  return (
    <main className="history-container">
      <section className="history-header">
        <h1>Historial de partidas</h1>
        <p>Registro de partidas jugadas, resultados y cantidad de movimientos.</p>
      </section>

      <section className="history-list">
        {message ? (
          <article className="history-card">
            <p className="empty-state">{message}</p>
          </article>
        ) : (
          historial.map((partida) => (
            <article className="history-card" key={partida.id}>
              <div className="history-title">
                <h2>
                  {partida.jugador1} vs {partida.jugador2}
                </h2>
                <span>{partida.resultado}</span>
              </div>

              <div className="history-details">
                <p>
                  <strong>Ganador:</strong> {partida.ganador}
                </p>

                <p>
                  <strong>Fecha:</strong> {partida.fecha}
                </p>

                <p>
                  <strong>Movimientos:</strong> {partida.movimientos}
                </p>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

export default History;
