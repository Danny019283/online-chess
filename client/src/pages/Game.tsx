import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ChessBoard from "../components/ChessBoard";
import { getGameState, makeMove, type GameStateDTO, type PieceDTO } from "../api";

const emptyBoard: string[][] = Array.from({ length: 8 }, () => Array(8).fill(""));

const pieceSymbols: Record<PieceDTO["color"], Record<PieceDTO["type"], string>> = {
  white: {
    King: "♔",
    Queen: "♕",
    Tower: "♖",
    Bishop: "♗",
    Knight: "♘",
    Pawn: "♙",
  },
  black: {
    King: "♚",
    Queen: "♛",
    Tower: "♜",
    Bishop: "♝",
    Knight: "♞",
    Pawn: "♟",
  },
};

function boardToSymbols(board: (PieceDTO | null)[][]) {
  return board.map((row) =>
    row.map((piece) => (piece ? pieceSymbols[piece.color][piece.type] : ""))
  );
}

function getStoredUser(): { userId: number; username: string } | null {
  const rawUser = localStorage.getItem("user");
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

function Game() {
  const { roomId } = useParams();
  const currentUser = useMemo(() => getStoredUser(), []);

  const [message, setMessage] = useState("Cargando partida...");
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [gameState, setGameState] = useState<GameStateDTO | null>(null);
  const [board, setBoard] = useState<string[][]>(emptyBoard);
  const [isMoving, setIsMoving] = useState(false);

  const playerColor = useMemo(() => {
    if (!gameState || !currentUser) return null;
    if (gameState.player1.id === currentUser.userId) return "white";
    if (gameState.player2?.id === currentUser.userId) return "black";
    return null;
  }, [currentUser, gameState]);

  const loadGame = useCallback(async (showErrors = false) => {
    if (!roomId) return;

    try {
      const response = await getGameState(roomId);
      setGameState(response.data);
      setBoard(boardToSymbols(response.data.board));

      if (response.data.checkmate) {
        setMessage("Jaque mate. La partida terminó.");
      } else if (response.data.check) {
        setMessage("Jaque.");
      } else if (response.data.status === "waiting") {
        setMessage("Esperando a que otro jugador se una.");
      } else {
        setMessage("Partida lista.");
      }
    } catch (error: any) {
      if (showErrors) {
        setMessage(error.response?.data?.error || "No se pudo cargar la partida.");
      }
    }
  }, [roomId]);

  useEffect(() => {
    loadGame(true);
    const intervalId = window.setInterval(() => loadGame(false), 2000);

    return () => window.clearInterval(intervalId);
  }, [loadGame]);

  async function handleSquareClick(row: number, col: number) {
    if (!roomId || !gameState || isMoving) return;

    const piece = gameState.board[row][col];

    if (selectedSquare === null) {
      if (!piece) {
        setMessage("Seleccione una pieza primero.");
        return;
      }

      if (gameState.status !== "active") {
        setMessage("La partida aún no está activa.");
        return;
      }

      if (!playerColor || piece.color !== playerColor || gameState.turn !== playerColor) {
        setMessage("No es su turno o esa pieza no le pertenece.");
        return;
      }

      setSelectedSquare([row, col]);
      setMessage(`Pieza seleccionada en fila ${row + 1}, columna ${col + 1}.`);
      return;
    }

    const [fromRow, fromCol] = selectedSquare;

    if (fromRow === row && fromCol === col) {
      setSelectedSquare(null);
      setMessage("Selección cancelada.");
      return;
    }

    setIsMoving(true);
    try {
      const response = await makeMove(roomId, {
        from: { row: fromRow, col: fromCol },
        to: { row, col },
      });

      if (response.data.gameState) {
        setGameState(response.data.gameState);
        setBoard(boardToSymbols(response.data.gameState.board));
      }

      setMessage(response.data.gameState?.check ? "Movimiento realizado. Jaque." : "Movimiento realizado.");
    } catch (error: any) {
      setMessage(error.response?.data?.reason || error.response?.data?.error || "Movimiento inválido.");
    } finally {
      setSelectedSquare(null);
      setIsMoving(false);
    }
  }

  const turnLabel = gameState ? (gameState.turn === "white" ? "Blancas" : "Negras") : "Cargando";
  const playerLabel = currentUser?.username || "Invitado";

  return (
    <main className="game-container">
      <section className="game-info">
        <h1>Partida 1 vs 1</h1>

        <div className="status-box">
          <p>
            <strong>Sala:</strong> {roomId}
          </p>

          <p>
            <strong>Jugador:</strong> {playerLabel}
          </p>

          <p>
            <strong>Color:</strong> {playerColor === "white" ? "Blancas" : playerColor === "black" ? "Negras" : "Espectador"}
          </p>

          <p>
            <strong>Turno:</strong> {turnLabel}
          </p>

          <p>
            <strong>Estado:</strong> {message}
          </p>
        </div>

        <div className="rules-box">
          <h3>Juego conectado</h3>
          <p>Los movimientos se validan en el backend y el tablero se actualiza automáticamente.</p>
        </div>

        <button onClick={() => loadGame(true)} disabled={isMoving}>
          Actualizar tablero
        </button>
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
