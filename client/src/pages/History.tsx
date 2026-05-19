function History() {
  const historial = [
    {
      id: 1,
      jugador1: "Jugador1",
      jugador2: "Jugador2",
      resultado: "1-0",
      ganador: "Jugador1",
      fecha: "2026-05-18",
      movimientos: 42,
    },
    {
      id: 2,
      jugador1: "Jugador3",
      jugador2: "Jugador1",
      resultado: "0-1",
      ganador: "Jugador1",
      fecha: "2026-05-17",
      movimientos: 35,
    },
    {
      id: 3,
      jugador1: "Jugador2",
      jugador2: "Jugador3",
      resultado: "½-½",
      ganador: "Empate",
      fecha: "2026-05-16",
      movimientos: 60,
    },
  ];

  return (
    <main className="history-container">
      <section className="history-header">
        <h1>Historial de partidas</h1>
        <p>Registro de partidas jugadas, resultados y cantidad de movimientos.</p>
      </section>

      <section className="history-list">
        {historial.map((partida) => (
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
        ))}
      </section>
    </main>
  );
}

export default History;