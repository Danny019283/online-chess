import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ChessBoard from "../components/ChessBoard";
import { getGameState, makeMove, type GameStateDTO, type PieceDTO } from "../api";

const emptyBoard: string[][] = Array.from({ length: 8 }, () => Array(8).fill(""));

const pieceSymbols: Record<PieceDTO["color"], Record<PieceDTO["type"], string>> = {
  white: {
    King: String.fromCharCode(9812),
    Queen: String.fromCharCode(9813),
    Tower: String.fromCharCode(9814),
    Bishop: String.fromCharCode(9815),
    Knight: String.fromCharCode(9816),
    Pawn: String.fromCharCode(9817),
  },
  black: {
    King: String.fromCharCode(9818),
    Queen: String.fromCharCode(9819),
    Tower: String.fromCharCode(9820),
    Bishop: String.fromCharCode(9821),
    Knight: String.fromCharCode(9822),
    Pawn: String.fromCharCode(9823),
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

function formatTime(ms: number) {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.ceil(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function Game() {
  const { roomId } = useParams();
  const currentUser = useMemo(() => getStoredUser(), []);
  const winnerAlertedRef = useRef<string | null>(null);

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

  const isPracticeMode = Boolean(
    gameState &&
      currentUser &&
      gameState.status === "waiting" &&
      !gameState.player2 &&
      gameState.player1.id === currentUser.userId
  );

  const isParticipant = Boolean(
    gameState &&
      currentUser &&
      (gameState.player1.id === currentUser.userId || gameState.player2?.id === currentUser.userId)
  );

  const loadGame = useCallback(async (showErrors = false) => {
    if (!roomId) return;

    try {
      const response = await getGameState(roomId);
      setGameState(response.data);
      setBoard(boardToSymbols(response.data.board));

      if (response.data.checkmate) {
        setMessage(response.data.winnerName ? `Jaque mate. Ganador: ${response.data.winnerName}.` : "Jaque mate.");
      } else if (response.data.status === "finished" && response.data.winnerName) {
        setMessage(`Partida finalizada. Ganador: ${response.data.winnerName}.`);
      } else if (response.data.check) {
        setMessage("Jaque.");
      } else if (response.data.status === "waiting") {
        setMessage("Modo prueba activo hasta que otro jugador se una.");
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
    const intervalId = window.setInterval(() => loadGame(false), 1000);

    return () => window.clearInterval(intervalId);
  }, [loadGame]);

  useEffect(() => {
    if (!gameState?.winnerName || winnerAlertedRef.current === gameState.id) {
      return;
    }

    winnerAlertedRef.current = gameState.id;
    window.alert(`Ganador: ${gameState.winnerName}`);
  }, [gameState]);

  async function handleSquareClick(row: number, col: number) {
    if (!roomId || !gameState || isMoving) return;

    const piece = gameState.board[row][col];

    if (selectedSquare === null) {
      if (!piece) {
        setMessage("Seleccione una pieza primero.");
        return;
      }

      if (gameState.status !== "active" && !isPracticeMode) {
        setMessage("La partida aun no esta activa.");
        return;
      }

      const canMovePiece = isPracticeMode || isParticipant
        ? piece.color === gameState.turn
        : playerColor === piece.color && gameState.turn === playerColor;

      if (!canMovePiece) {
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
      setMessage("Seleccion cancelada.");
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

      const nextState = response.data.gameState;
      if (nextState?.winnerName) {
        setMessage(`Partida finalizada. Ganador: ${nextState.winnerName}.`);
      } else {
        setMessage(nextState?.check ? "Movimiento realizado. Jaque." : "Movimiento realizado.");
      }
    } catch (error: any) {
      setMessage(error.response?.data?.reason || error.response?.data?.error || "Movimiento invalido.");
    } finally {
      setSelectedSquare(null);
      setIsMoving(false);
    }
  }

  const turnLabel = gameState ? (gameState.turn === "white" ? "Blancas" : "Negras") : "Cargando";
  const playerLabel = currentUser?.username || "Invitado";
  const colorLabel = isPracticeMode
    ? "Modo prueba"
    : playerColor === "white"
    ? "Blancas"
    : playerColor === "black"
    ? "Negras"
    : "Espectador";

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
            <strong>Color:</strong> {colorLabel}
          </p>

          <p>
            <strong>Turno:</strong> {turnLabel}
          </p>

          <p>
            <strong>Tiempo blancas:</strong> {formatTime(gameState?.whiteTimeMs ?? 5 * 60 * 1000)}
          </p>

          <p>
            <strong>Tiempo negras:</strong> {formatTime(gameState?.blackTimeMs ?? 5 * 60 * 1000)}
          </p>

          <p>
            <strong>Estado:</strong> {message}
          </p>
        </div>

        <div className="rules-box">
          <h3>Juego conectado</h3>
          <p>Los movimientos se validan en el backend y el tablero se actualiza automaticamente.</p>
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
