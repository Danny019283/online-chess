type ChessBoardProps = {
  board: string[][];
  selectedSquare: [number, number] | null;
  onSquareClick: (row: number, col: number) => void;
};

function ChessBoard({ board, selectedSquare, onSquareClick }: ChessBoardProps) {
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

  return (
    <div className="chess-wrapper">
      <div className="custom-board">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isLight = (rowIndex + colIndex) % 2 === 0;
            const isSelected =
              selectedSquare &&
              selectedSquare[0] === rowIndex &&
              selectedSquare[1] === colIndex;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => onSquareClick(rowIndex, colIndex)}
                className={`square ${isLight ? "light-square" : "dark-square"} ${
                  isSelected ? "selected-square" : ""
                }`}
              >
                {colIndex === 0 && (
                  <span className="rank-label">{8 - rowIndex}</span>
                )}

                {rowIndex === 7 && (
                  <span className="file-label">{files[colIndex]}</span>
                )}

                <span className="piece">{piece}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ChessBoard;