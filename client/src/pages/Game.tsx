import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../socket";
import ChessBoard from "../components/ChessBoard";

function Game() {
  const { roomId } = useParams();

  const [mensaje, setMensaje] = useState("Esperando conexión con el servidor...");
  const [turno, setTurno] = useState("Blancas");
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(
    null
  );

  const [board, setBoard] = useState<string[][]>([
    ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
    ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
    ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
  ]);

  const user = localStorage.getItem("user");

  useEffect(() => {
    socket.connect();

    socket.emit("joinRoom", {
      roomId,
      username: user,
    });

    socket.on("playerJoined", (data: { message: string }) => {
      setMensaje(data.message);
    });

    socket.on(
      "boardUpdated",
      (data: { board: string[][]; turn?: string; message?: string }) => {
        setBoard(data.board);

        if (data.turn) {
          setTurno(data.turn);
        }

        if (data.message) {
          setMensaje(data.message);
        }
      }
    );

    socket.on("invalidMove", (data: { message: string }) => {
      setMensaje(data.message);
    });

    return () => {
      socket.off("playerJoined");
      socket.off("boardUpdated");
      socket.off("invalidMove");
      socket.disconnect();
    };
  }, [roomId, user]);

  function handleSquareClick(row: number, col: number) {
    const piece = board[row][col];

    if (selectedSquare === null) {
      if (piece === "") {
        setMensaje("Seleccione una pieza primero");
        return;
      }

      setSelectedSquare([row, col]);
      setMensaje(`Pieza seleccionada en fila ${row + 1}, columna ${col + 1}`);
      return;
    }

    const [fromRow, fromCol] = selectedSquare;

    if (fromRow === row && fromCol === col) {
      setSelectedSquare(null);
      setMensaje("Selección cancelada");
      return;
    }

    socket.emit("makeMove", {
      roomId,
      username: user,
      from: [fromRow, fromCol],
      to: [row, col],
      piece: board[fromRow][fromCol],
    });

    moverPiezaTemporal(fromRow, fromCol, row, col);

    setSelectedSquare(null);
    setTurno(turno === "Blancas" ? "Negras" : "Blancas");
    setMensaje("Movimiento enviado al servidor");
  }

  function moverPiezaTemporal(
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number
  ) {
    const nuevoTablero = board.map((row) => [...row]);

    nuevoTablero[toRow][toCol] = nuevoTablero[fromRow][fromCol];
    nuevoTablero[fromRow][fromCol] = "";

    setBoard(nuevoTablero);
  }

  function reiniciarTablero() {
    setBoard([
      ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
      ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
      ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
    ]);

    setTurno("Blancas");
    setSelectedSquare(null);
    setMensaje("Tablero reiniciado visualmente");
  }

  return (
    <main className="game-container">
      <section className="game-info">
        <h1>Partida 1 vs 1</h1>

        <div className="status-box">
          <p>
            <strong>Sala:</strong> {roomId}
          </p>

          <p>
            <strong>Jugador:</strong> {user}
          </p>

          <p>
            <strong>Turno:</strong> {turno}
          </p>

          <p>
            <strong>Estado:</strong> {mensaje}
          </p>
        </div>

        <div className="rules-box">
          <h3>Modo frontend</h3>
          <p>
            El tablero permite seleccionar piezas y enviar movimientos. La
            validación real queda para el backend.
          </p>
        </div>

        <button onClick={reiniciarTablero}>Reiniciar tablero visual</button>
      </section>

      <section className="board">
        <ChessBoard
          board={board}
          selectedSquare={selectedSquare}
          onSquareClick={handleSquareClick}
        />
      </section>
    </main>
  );
}

export default Game;