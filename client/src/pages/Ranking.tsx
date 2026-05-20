function Ranking() {
  const ranking = [
    { posicion: 1, nombre: "Jugador1", partidas: 8, victorias: 6, derrotas: 2, puntos: 18 },
    { posicion: 2, nombre: "Jugador2", partidas: 7, victorias: 4, derrotas: 3, puntos: 12 },
    { posicion: 3, nombre: "Jugador3", partidas: 5, victorias: 2, derrotas: 3, puntos: 6 },
  ];

  return (
    <main className="ranking-container">
      <section className="ranking-header">
        <h1>Ranking de jugadores</h1>
        <p>Clasificación general según el rendimiento en partidas 1 vs 1.</p>
      </section>

      <section className="ranking-card">
        <table>
          <thead>
            <tr>
              <th>Posición</th>
              <th>Jugador</th>
              <th>Partidas</th>
              <th>Victorias</th>
              <th>Derrotas</th>
              <th>Puntos</th>
            </tr>
          </thead>

          <tbody>
            {ranking.map((jugador) => (
              <tr key={jugador.posicion}>
                <td className="position-cell">
                  {jugador.posicion === 1
                    ? "🥇"
                    : jugador.posicion === 2
                    ? "🥈"
                    : jugador.posicion === 3
                    ? "🥉"
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
      </section>
    </main>
  );
}

export default Ranking;
