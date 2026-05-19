import { Table } from "./table";
export abstract class Piece {
    private _color: string;
    public constructor(color: string){
        this._color = color; //white o black
    }
    get color(): string{
        return this._color;
    }
    abstract getValidMovements(table: Table, initialPos: [number, number]): (Array<[number, number]>|null);
}