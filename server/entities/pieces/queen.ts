import {Piece} from '../piece'
import { Board } from '../board';
class Queen extends Piece {
    constructor(color: string){
        super(color);
    }

    //Movimientos posibles de la reina en una sola direccion
    private getMovesInDirection(table: Board, position: [number, number], rowDirection: number, colDirection: number) : [number, number][]{
        const moves: [number, number][] = [];

        let row = position[0] + rowDirection;
        let col = position[1] + colDirection;

        while (table.isInsideBoard(row, col)) {
            //Revisa si hay una pieza
            const piece: Piece | null = table.pieces[row][col];

            if (piece) {
            //Si es pieza enemiga la reina la puede capturar 
                 if (piece.color !== this.color){
                     moves.push([row,col]);

                 }

                 //Si hay una pieza aliada o enemiga ya no puede seguir
                 break;
            }
            
            //Si la casilla esta vacia se puede mover ahi
            moves.push([row,col]);

            row += rowDirection;
            col += colDirection;
            
        }
        
        return moves;
  
    }

    getValidMovements(table: Board, position: [number, number]): (Array<[number, number]>|null) {
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

}