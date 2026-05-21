import { Piece } from '../piece';
import { Board } from '../table';

export class Pawn extends Piece {
    public hasInitialLargeMove: boolean;

    constructor(color: string) {
        super(color);
        this.hasInitialLargeMove = false;
    }

    getValidMovements(table: Board, initialPos: [number, number]): Array<[number, number]> | null {
        const moves = [
            ...(this.hasMoved ? this.getNormalMoves(table, initialPos) : this.getFirstMove(table, initialPos) || []),
            ...(this.getCaptureMoves(table, initialPos) || []),
        ];

        return moves.length > 0 ? moves : null;
    }

    getFirstMove(table: Board, initialPos: [number, number]): Array<[number, number]> | null {
        const currentPiece = table.pieces[initialPos[0]][initialPos[1]];
        if (!currentPiece) {
            return null;
        }

        const direction = this.getDirection(currentPiece.color);
        const moves: [number, number][] = [];
        const firstSquare = this.calculateMove(table, initialPos, direction, 0);

        if (firstSquare && !table.pieces[firstSquare[0]][firstSquare[1]]) {
            moves.push(firstSquare);

            const secondSquare = this.calculateMove(table, initialPos, direction * 2, 0);
            if (secondSquare && !table.pieces[secondSquare[0]][secondSquare[1]]) {
                moves.push(secondSquare);
            }
        }

        return moves.length > 0 ? moves : null;
    }

    getNormalMove(table: Board, initialPos: [number, number]): [number, number] | null {
        return this.getNormalMoves(table, initialPos)[0] || null;
    }

    getCaptureMoves(table: Board, initialPos: [number, number]): Array<[number, number]> | null {
        const currentPiece = table.pieces[initialPos[0]][initialPos[1]];
        if (!currentPiece) {
            return null;
        }

        const direction = this.getDirection(currentPiece.color);
        const moves: [number, number][] = [];

        for (const colOffset of [-1, 1]) {
            const target = this.calculateMove(table, initialPos, direction, colOffset);
            if (!target) {
                continue;
            }

            const targetPiece = table.pieces[target[0]][target[1]];
            if (targetPiece && targetPiece.color !== this.color) {
                moves.push(target);
            }
        }

        return moves.length > 0 ? moves : null;
    }

    getPassantCapture(table: Board, initialPos: [number, number]): Array<[number, number]> | null {
        const currentPiece = table.pieces[initialPos[0]][initialPos[1]];
        if (!currentPiece) {
            return null;
        }

        if ((currentPiece.color === 'white' && initialPos[0] !== 3) || (currentPiece.color === 'black' && initialPos[0] !== 4)) {
            return null;
        }

        const direction = this.getDirection(currentPiece.color);
        const moves: [number, number][] = [];

        for (const colOffset of [-1, 1]) {
            if (!this.haveOpponentAdyacentPawn(table, initialPos, colOffset)) {
                continue;
            }

            const target = this.calculateMove(table, initialPos, direction, colOffset);
            if (target && !table.pieces[target[0]][target[1]]) {
                moves.push(target);
            }
        }

        return moves.length > 0 ? moves : null;
    }

    private getNormalMoves(table: Board, initialPos: [number, number]): [number, number][] {
        const currentPiece = table.pieces[initialPos[0]][initialPos[1]];
        if (!currentPiece) {
            return [];
        }

        const target = this.calculateMove(table, initialPos, this.getDirection(currentPiece.color), 0);
        if (!target || table.pieces[target[0]][target[1]]) {
            return [];
        }

        return [target];
    }

    private haveOpponentAdyacentPawn(table: Board, currentPos: [number, number], colOffset: number): boolean {
        const row = currentPos[0];
        const col = currentPos[1] + colOffset;

        if (!table.isInsideBoard(row, col)) {
            return false;
        }

        const adyacentPiece = table.pieces[row][col];
        return adyacentPiece instanceof Pawn && adyacentPiece.color !== this.color && adyacentPiece.hasInitialLargeMove;
    }

    private getDirection(color: string): number {
        return color === 'white' ? -1 : 1;
    }

    private calculateMove(table: Board, initialPos: [number, number], rowOffset: number, colOffset: number): [number, number] | null {
        const row = initialPos[0] + rowOffset;
        const col = initialPos[1] + colOffset;

        if (!table.isInsideBoard(row, col)) {
            return null;
        }

        return [row, col];
    }

    hasPromotion(to: [number, number]): boolean {
        return (this.color === 'white' && to[0] === 0) || (this.color === 'black' && to[0] === 7);
    }
}
