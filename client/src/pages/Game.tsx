import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ChessBoard from "../components/ChessBoard";
import PromotionModal from "../components/PromotionModal";
import {
  getGameState,
  getLegalMoves,
  makeMove,
  leaveGame,
  type GameStateDTO,
  type PieceDTO,
  type PositionDTO,
} from "../api";

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
  const selectedSquareRef = useRef<[number, number] | null>(null);

  const [message, setMessage] = useState("Cargando partida...");
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [legalMoves, setLegalMoves] = useState<PositionDTO[]>([]);
  const [gameState, setGameState] = useState<GameStateDTO | null>(null);
  const [board, setBoard] = useState<string[][]>(emptyBoard);
  const [isMoving, setIsMoving] = useState(false);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: { row: number; col: number };
    to: { row: number; col: number };
  } | null>(null);
  const pendingPromotionRef = useRef<typeof pendingPromotion>(null);

  const setPendingPromotionWithRef = (
    value: typeof pendingPromotion
  ) => {
    setPendingPromotion(value);
    pendingPromotionRef.current = value;
  };

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
      gameState.player1.id === currentUser.userId,
  );

  const updateSelectedSquare = (sq: [number, number] | null) => {
    setSelectedSquare(sq);
    selectedSquareRef.current = sq;
  };

  async function refreshLegalMoves(row: number, col: number) {
    if (!roomId) return;
    try {
      const response = await getLegalMoves(roomId, row, col);
      setLegalMoves(response.data.moves);
      if (response.data.moves.length === 0) {
        setMessage("Esta pieza no tiene movimientos válidos.");
      } else {
        setMessage(`${response.data.moves.length} movimiento(s) válido(s) disponibles.`);
      }
    } catch {
      setMessage("No se pudieron cargar los movimientos válidos.");
      setLegalMoves([]);
    }
  }

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
        setMessage("Esperando a que otro jugador se conecte...");
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
  }, [loadGame]);

  useEffect(() => {
    const intervalId = window.setInterval(async () => {
      if (!roomId) return;
      if (pendingPromotionRef.current) return;
      try {
        const response = await getGameState(roomId);
        setGameState(response.data);
        setBoard(boardToSymbols(response.data.board));

        const current = selectedSquareRef.current;
        if (current) {
          const pieceAtSelection = response.data.board[current[0]]?.[current[1]];
          if (!pieceAtSelection) {
            updateSelectedSquare(null);
            setLegalMoves([]);
          } else {
            try {
              const movesResponse = await getLegalMoves(roomId, current[0], current[1]);
              setLegalMoves(movesResponse.data.moves);
            } catch {
              setLegalMoves([]);
            }
          }
        }
      } catch {
        // ignore polling errors
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [roomId]);

  useEffect(() => {
    if (!gameState?.winnerName || winnerAlertedRef.current === gameState.id) {
      return;
    }

    winnerAlertedRef.current = gameState.id;
    window.alert(`Ganador: ${gameState.winnerName}`);
  }, [gameState]);

  async function handleSquareClick(row: number, col: number) {
    if (!roomId || !gameState || isMoving) return;

    if (pendingPromotion) return;

    const piece = gameState.board[row][col];

    if (selectedSquare === null) {
      if (!piece) {
        return;
      }

      if (gameState.status === "finished") {
        setMessage("La partida ha finalizado.");
        return;
      }

      const canMovePiece = isPracticeMode ||
        (playerColor !== null && piece.color === playerColor && gameState.turn === playerColor);

      if (!canMovePiece) {
        return;
      }

      updateSelectedSquare([row, col]);
      setLegalMoves([]);

      try {
        await refreshLegalMoves(row, col);
      } catch (error: any) {
        setMessage("No se pudieron cargar los movimientos válidos.");
      }

      return;
    }

    const [fromRow, fromCol] = selectedSquare;

    if (fromRow === row && fromCol === col) {
      updateSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    const targetPiece = gameState.board[row][col];

    if (
      targetPiece &&
      targetPiece.color === playerColor &&
      gameState.turn === playerColor
    ) {
      updateSelectedSquare([row, col]);
      setLegalMoves([]);

      try {
        await refreshLegalMoves(row, col);
      } catch (error: any) {
        setMessage("No se pudieron cargar los movimientos válidos.");
      }

      return;
    }

    const isLegalTarget = legalMoves.some((m) => m.row === row && m.col === col);
    if (!isLegalTarget) {
      updateSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    const movingPiece = gameState.board[fromRow][fromCol];
    const isPawnPromotion = movingPiece?.type === "Pawn" && (row === 0 || row === 7);

    if (isPawnPromotion && !pendingPromotion) {
      setPendingPromotionWithRef({
        from: { row: fromRow, col: fromCol },
        to: { row, col },
      });
      updateSelectedSquare(null);
      setLegalMoves([]);
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
        updateSelectedSquare(null);
        setLegalMoves([]);
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
      setIsMoving(false);
    }
  }

  async function handlePromotionSelect(pieceType: "queen" | "rook" | "bishop" | "knight") {
    if (!roomId || !pendingPromotion || !gameState) return;

    const { from, to } = pendingPromotion;
    setPendingPromotionWithRef(null);
    setIsMoving(true);

    try {
      const response = await makeMove(roomId, {
        from: { row: from.row, col: from.col },
        to: { row: to.row, col: to.col },
        promotionPiece: pieceType,
      });

      if (response.data.gameState) {
        setGameState(response.data.gameState);
        setBoard(boardToSymbols(response.data.gameState.board));
        updateSelectedSquare(null);
        setLegalMoves([]);
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
      setIsMoving(false);
    }
  }

  async function handleLeave() {
    if (!roomId || !currentUser) return;
    try {
      await leaveGame(roomId);
      window.location.href = "/lobby";
    } catch {
      setMessage("No se pudo abandonar la partida.");
    }
  }

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!roomId || !currentUser) return;
      if (gameState?.status === "finished") return;
      navigator.sendBeacon(`${window.location.origin}/api/games/${roomId}/leave`);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [roomId, currentUser, gameState?.status]);

  const isWaiting = gameState?.status === "waiting" && !gameState.player2;

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

          {!isWaiting && (
            <>
              <p>
                <strong>Turno:</strong> {turnLabel}
              </p>

              <p>
                <strong>Tiempo blancas:</strong> {formatTime(gameState?.whiteTimeMs ?? 5 * 60 * 1000)}
              </p>

              <p>
                <strong>Tiempo negras:</strong> {formatTime(gameState?.blackTimeMs ?? 5 * 60 * 1000)}
              </p>
            </>
          )}

          <p>
            <strong>Estado:</strong> {message}
          </p>

          {gameState?.status !== "finished" && (
            <button className="leave-btn" onClick={handleLeave}>
              Abandonar
            </button>
          )}
        </div>
      </section>

      <section className="board">
        {isWaiting && (
          <div className="waiting-overlay">
            <div className="waiting-content">
              <h2>Esperando oponente</h2>
              <p>Comparte el ID de sala para que otro jugador se una.</p>
              <p className="room-id">{roomId}</p>
            </div>
          </div>
        )}
        <ChessBoard
          board={board}
          selectedSquare={selectedSquare}
          legalMoves={legalMoves}
          onSquareClick={handleSquareClick}
        />
      </section>

      {pendingPromotion && gameState && (
        <PromotionModal
          color={playerColor === "black" ? "black" : "white"}
          onSelect={handlePromotionSelect}
        />
      )}
    </main>
  );
}

export default Game;
