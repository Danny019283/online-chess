import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Lobby() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");

  const salasDisponibles = [
    { codigo: "1025", jugadores: "1/2", estado: "Esperando rival" },
    { codigo: "7841", jugadores: "1/2", estado: "Disponible" },
    { codigo: "3390", jugadores: "2/2", estado: "En partida" },
  ];

  function crearPartida() {
    const nuevaSala = Math.floor(1000 + Math.random() * 9000);
    navigate(`/game/${nuevaSala}`);
  }

  function unirsePartida(e: React.FormEvent) {
    e.preventDefault();

    if (roomId.trim() === "") {
      alert("Digite el código de la sala");
      return;
    }

    navigate(`/game/${roomId}`);
  }

  function entrarSala(codigo: string, estado: string) {
    if (estado === "En partida") {
      alert("Esta sala ya está llena");
      return;
    }

    navigate(`/game/${codigo}`);
  }

  return (
    <main className="lobby-container">
      <section className="lobby-header">
        <h1>Lobby de partidas</h1>
        <p>
          Cree una partida nueva o únase a una sala existente para jugar 1 vs 1.
        </p>
      </section>

      <section className="lobby-content">
        <div className="lobby-card">
          <h2>Crear partida</h2>
          <p>Genere una sala nueva y comparta el código con otro jugador.</p>
          <button onClick={crearPartida}>Crear nueva sala</button>
        </div>

        <div className="lobby-card">
          <h2>Unirse por código</h2>

          <form onSubmit={unirsePartida}>
            <input
              type="text"
              placeholder="Ejemplo: 1025"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />

            <button type="submit">Unirse a sala</button>
          </form>
        </div>

        <div className="lobby-card lobby-table-card">
          <h2>Salas disponibles</h2>

          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Jugadores</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {salasDisponibles.map((sala) => (
                <tr key={sala.codigo}>
                  <td>{sala.codigo}</td>
                  <td>{sala.jugadores}</td>
                  <td>{sala.estado}</td>
                  <td>
                    <button
                      className="small-button"
                      onClick={() => entrarSala(sala.codigo, sala.estado)}
                    >
                      Entrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default Lobby;