import { Piece } from '../../entities/piece';
import { Board } from '../../entities/table';
import { GameSession } from '../services/gameStateManager';
import { GameEntity } from '../entities/GameEntity';
import { Game } from '../../gameLogic/gameRules';
import { PieceDTO } from '../dtos/pieceDTO';
import { GameStateDTO } from '../dtos/gameStateDTO';
import { LegalMovesDTO } from '../dtos/legalMovesDTO';
import { PositionDTO } from '../dtos/positionDTO';
import { King } from '../../entities/pieces/king';
import { Queen } from '../../entities/pieces/queen';
import { Bishop } from '../../entities/pieces/bishop';
import { Tower } from '../../entities/pieces/tower';
import { Knight } from '../../entities/pieces/knight';
import { Pawn } from '../../entities/pieces/pawn';

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
    return board.pieces.map(row => row.map(piece => this.pieceToDTO(piece)));
  }

  static gameSessionToStateDTO(
    session: GameSession,
    gameEntity: GameEntity,
    game: Game,
  ): GameStateDTO {
    const board = this.boardToDTO(session.board);
    const isCheckWhite = game.isCheck(session.board, 'white');
    const isCheckBlack = game.isCheck(session.board, 'black');

    return {
      id: gameEntity.id,
      board,
      turn: session.currentTurn,
      player1: {
        id: gameEntity.player1.id,
        username: gameEntity.player1.username,
      },
      player2: gameEntity.player2
        ? { id: gameEntity.player2.id, username: gameEntity.player2.username }
        : null,
      check: session.currentTurn === 'white' ? isCheckWhite : isCheckBlack,
      checkmate: game.isCheckmate(session.board, session.currentTurn),
      winner: gameEntity.winner_id ? gameEntity.winner_id.toString() : null,
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
