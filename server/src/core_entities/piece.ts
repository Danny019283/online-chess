import { Board } from "./table";

export abstract class Piece {

    // Color de la pieza
    private _color: string;

    // Indica si la pieza ya se movio
    private _hasMoved: boolean;

    public constructor(
        color: string
    ) {

        // White o black
        this._color = color;

        // Inicialmente
        // ninguna pieza
        // se ha movido
        this._hasMoved = false;
    }

    // Retorna color
    get color(): string {

        return this._color;
    }

    // Retorna si ya se movio
    get hasMoved(): boolean {

        return this._hasMoved;
    }

    // Marca la pieza como movida
    set moved(
        value: boolean
    ) {

        this._hasMoved = value;
    }

    abstract getValidMovements(
        table: Board,
        initialPos: [number, number]
    ): (
        Array<[number, number]>
        | null
    );
}