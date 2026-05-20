import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createGame, joinGame } from "../api";

function Lobby() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function crearPartida() {
    setIsLoading(true);
    try {
      const response = await createGame();
      navigate(`/game/${response.data.gameId}`);
    } catch (error) {
      alert("Error al crear partida");
      setIsLoading(false);
    }
  }

  async function unirsePartida(e: React.FormEvent) {
    e.preventDefault();

    if (roomId.trim() === "") {
      alert("Digite el código de la sala");
      return;
    }

    setIsLoading(true);
    try {
      await joinGame(roomId);
      navigate(`/game/${roomId}`);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Error al unirse a la partida";
      alert(errorMsg);
      setIsLoading(false);
    }
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
          <button onClick={crearPartida} disabled={isLoading}>
            {isLoading ? "Creando..." : "Crear nueva sala"}
          </button>
        </div>

        <div className="lobby-card">
          <h2>Unirse por código</h2>

          <form onSubmit={unirsePartida}>
            <input
              type="text"
              placeholder="Ejemplo: 1025"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              disabled={isLoading}
            />

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Uniéndose..." : "Unirse a sala"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Lobby;