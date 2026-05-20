import { Piece } from '../core_entities/piece';
import { Board } from '../core_entities/table';
import { GameSession } from '../services/gameStateManager';
import { GameEntity } from '../entities/GameEntity';
import { Game } from '../gameLogic/gameRules';
import { PieceDTO } from '../dtos/pieceDTO';
import { GameStateDTO } from '../dtos/gameStateDTO';
import { LegalMovesDTO } from '../dtos/legalMovesDTO';
import { PositionDTO } from '../dtos/positionDTO';
import { King } from '../core_entities/pieces/king';
import { Queen } from '../core_entities/pieces/queen';
import { Bishop } from '../core_entities/pieces/bishop';
import { Tower } from '../core_entities/pieces/tower';
import { Knight } from '../core_entities/pieces/knight';
import { Pawn } from '../core_entities/pieces/pawn';

export class GameMapper {
  static getPieceType(piece: Piece): string {
    if (piece instanceof King) return 'King';
    if (piece instanceof Queen) return 'Queen';
    if (piece instanceof Bishop) return 'Bishop';
    if (piece instanceof Tower) return 'Tower';
    if (piece instanceof Knight) return 'Knight';
    if (piece instanceof Pawn) return 'Pawn';
    return 'Unknown';
  }

  static pieceToDTO(piece: Piece | null): PieceDTO | null {
    if (!piece) return null;
    return {
      type: this.getPieceType(piece) as any,
      color: piece.color as any,
    };
  }

  static boardToDTO(board: Board): (PieceDTO | null)[][] {
    return board.pieces.map((row: (Piece | null)[]) => row.map((piece: Piece | null) => this.pieceToDTO(piece)));
  }

  static gameSessionToStateDTO(
    gameSession: GameSession,
    gameEntity: GameEntity,
  ): GameStateDTO {
    const board = this.boardToDTO(gameSession.board);
    const game = gameSession.game;
    const isCheckWhite = game.isCheck(gameSession.board, 'white');
    const isCheckBlack = game.isCheck(gameSession.board, 'black');
    const isCheckmate = game.isCheckmate(gameSession.board, gameSession.currentTurn);

    return {
      id: gameEntity.id,
      board,
      turn: gameSession.currentTurn,
      player1: {
        id: gameEntity.player1.id,
        username: gameEntity.player1.username,
      },
      player2: gameEntity.player2
        ? { id: gameEntity.player2.id, username: gameEntity.player2.username }
        : null,
      check: gameSession.currentTurn === 'white' ? isCheckWhite : isCheckBlack,
      checkmate: isCheckmate,
      winner: gameSession.session.getWinner() || null,
      status: gameEntity.status as any,
    };
  }

  static legalMovesToDTO(position: PositionDTO, moves: [number, number][]): LegalMovesDTO {
    return {
      position,
      moves: moves.map(([row, col]) => ({ row, col })),
    };
  }
}
