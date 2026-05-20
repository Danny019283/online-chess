import { Piece } from "./piece";
import { Bishop } from "./pieces/bishop";
import { King } from "./pieces/king";
import { Knight } from "./pieces/knight";
import { Pawn } from "./pieces/pawn";
import { Queen } from "./pieces/queen";
import { Tower } from "./pieces/tower";

export class Board {
    private _pieces: (Piece|null)[][];
    public constructor(){
        this._pieces = Array.from({ length: 8 }, () => Array(8).fill(null))
        this.setupInitialPosition();
    }
    get pieces(): (Piece|null)[][]{
        return this._pieces;
    }
   
    public isInsideBoard(row: number, col: number): boolean {
       return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    private setupInitialPosition(): void {
        this._pieces[0] = this.createBackRank('black');
        this._pieces[1] = Array.from({ length: 8 }, () => new Pawn('black'));
        this._pieces[6] = Array.from({ length: 8 }, () => new Pawn('white'));
        this._pieces[7] = this.createBackRank('white');
    }

    private createBackRank(color: string): Piece[] {
        return [
            new Tower(color),
            new Knight(color),
            new Bishop(color),
            new Queen(color),
            new King(color),
            new Bishop(color),
            new Knight(color),
            new Tower(color),
        ];
    }

}
