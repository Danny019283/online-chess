import {Piece} from '../piece'
import { Table } from '../table';
class King extends Piece {
    constructor(color: string){
        super(color);
    }

    //Limites dentro del tablero
    private isInsideBoard(row: number, col: number): boolean {
        return row >= 0 && row < 8 && col >= 0 && col < 8;

    }

    //Movimientos posibles del rey en una sola direccion
    private getMovesInDirection(table: Table, position: [number, number], rowDirection: number, colDirection: number) : [number, number][]{
        const moves: [number, number][] = [];

        let row = position[0] + rowDirection;
        let col = position[1] + colDirection;

        //El rey solo puede moverse una casilla
        if (this.isInsideBoard(row, col)) {
            //Revisa si hay una pieza
            const piece: Piece | null = table.pieces[row][col];


            //Si la casilla esta vacia se puede mover ahi
            if (!piece) {
                moves.push([row,col]);

            }

            //Si hay una pieza del color contrario se puede comer
            else if (piece.color !== this.color){
                moves.push([row,col]);
            }
            
        }
        
        return moves;
  
    }

    getValidMovements(table: Table, position: [number, number]): (Array<[number, number]>|null) {
        const currentPiece: Piece|null = table.pieces[position[0]][position[1]];
        if(!currentPiece){
            return null;
        }
        
        //Cantidad de movimientos posibles
        const moves: [number, number][] = [];

        //Arriba
        moves.push(...this.getMovesInDirection(table, position, -1,0));

        //Abajo
        moves.push(...this.getMovesInDirection(table, position, 1,0));

        //Izquierda
        moves.push(...this.getMovesInDirection(table, position, 0,-1));

        //Derecha
        moves.push(...this.getMovesInDirection(table, position, 0,1));

        //Diagonal arriba izquierda 
        moves.push(...this.getMovesInDirection(table, position, -1,-1));

        //Diagonal arriba derecha
        moves.push(...this.getMovesInDirection(table, position, -1,1));

        //Diagonal abajo izquierda
        moves.push(...this.getMovesInDirection(table, position, 1,-1));

        //Diagonal abajo derecha
        moves.push(...this.getMovesInDirection(table, position, 1,1));

        //Verifica si la lista esta vacia
        if (moves.length === 0) {
            return null;
        }
        
        return moves;
    }
    //enroque

}