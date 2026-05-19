import { Piece } from "../piece";
import { Table } from "../table";

class Knight extends Piece{
    constructor(color: string){
        super(color);
    }
    getValidMovements(table: Table, initialPos: [number, number]): (Array<[number, number]> | null) {
        //pieza a mover
        const currentPiece: Piece|null = table.pieces[initialPos[0]][initialPos[1]];
        if(!currentPiece){
            return null;
        }
        //sumar coords a posicion inicial para obtener posibles casillas
        const coords: Array<[number, number]> = [
            //x, y
            [1,2],
            [2,1],
            [1,-2],
            [2,-1],
            [-1,2],
            [-2,1],
            [-1,-2],
            [-2,-1]
        ];
        let validMoves: [number, number][] = [];
        for(const coord of coords){
            //calcula coordenadas en tablero
            const coordXOnTable: number = initialPos[0]+coord[0];
            const coordYOnTable: number = initialPos[1]+coord[1];
            if(this.isInsideBoard(coordXOnTable, coordYOnTable)){
                continue
            }
            const coordOnTable: [number, number] = [coordXOnTable, coordYOnTable]
            const piece: Piece|null = table.pieces[coordOnTable[0]][coordOnTable[1]];
            //si la casilla esta vacía
            if(piece == null){
                validMoves.push(coordOnTable)
                continue
            }
            //si hay pieza del mismo color
            if(piece.color == this.color){
                continue;
            }
            validMoves.push(coordOnTable)
        }
        //si no se encontraron movimientos
        if(validMoves.length == 0){
                return null;
            }
        return validMoves;
    }
    private isInsideBoard(row: number, col: number): boolean {
        return row >= 0 && row < 8 && col >= 0 && col < 8;

    }
    
}