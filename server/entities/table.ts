import { Piece } from "./piece";
export class Table {
    private _pieces: (Piece|null)[][];
    public constructor(){
        this._pieces = Array.from({ length: 8 }, () => Array(8).fill(null))
    }
    get pieces(): (Piece|null)[][]{
        return this._pieces;
    }
}