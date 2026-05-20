export interface GameStateDTO {
    board:(PieceDTO | null)[][];
    turn: string;
    whitePlayer: string;
    blackPlayer: string;
    winner: string | null;
    check: boolean;
    checkmate: boolean;
}