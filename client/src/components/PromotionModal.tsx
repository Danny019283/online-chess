type PromotionPiece = "queen" | "rook" | "bishop" | "knight";

type PromotionModalProps = {
  color: "white" | "black";
  onSelect: (piece: PromotionPiece) => void;
};

const pieceSymbols: Record<"white" | "black", Record<PromotionPiece, string>> = {
  white: {
    queen: String.fromCharCode(9813),
    rook: String.fromCharCode(9814),
    bishop: String.fromCharCode(9815),
    knight: String.fromCharCode(9816),
  },
  black: {
    queen: String.fromCharCode(9819),
    rook: String.fromCharCode(9820),
    bishop: String.fromCharCode(9821),
    knight: String.fromCharCode(9822),
  },
};

const pieceLabels: Record<PromotionPiece, string> = {
  queen: "Reina",
  rook: "Torre",
  bishop: "Alfil",
  knight: "Caballo",
};

function PromotionModal({ color, onSelect }: PromotionModalProps) {
  const pieces: PromotionPiece[] = ["queen", "rook", "bishop", "knight"];

  return (
    <div className="promotion-overlay">
      <div className="promotion-modal">
        <h3>Elige pieza para coronar</h3>
        <div className="promotion-options">
          {pieces.map((piece) => (
            <button
              key={piece}
              className="promotion-btn"
              onClick={() => onSelect(piece)}
            >
              <span className="promotion-piece-icon">{pieceSymbols[color][piece]}</span>
              <span>{pieceLabels[piece]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PromotionModal;
