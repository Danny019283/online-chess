import { Piece } from "./piece";
export class Board {
    private _pieces: (Piece|null)[][];
    public constructor(){
        this._pieces = Array.from({ length: 8 }, () => Array(8).fill(null))
    }
    get pieces(): (Piece|null)[][]{
        return this._pieces;
    }
   
    public isInsideBoard(row: number, col: number): boolean {
       return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

}