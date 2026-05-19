import {Piece} from '../piece'
import { Table } from '../table';
export class Tower extends Piece {
    constructor(color: string){
        super(color);
    }
    
    //Limites dentro del tablero
    private isInsideBoard(row: number, col: number): boolean {
        return row >= 0 && row < 8 && col >= 0 && col < 8;

    }

    //Movimientos posibles de la torre en una sola direccion
    private getMovesInDirection(table: Table, position: [number, number], rowDirection: number, colDirection: number) : [number, number][]{
        const moves: [number, number][] = [];

        let row = position[0] + rowDirection;
        let col = position[1] + colDirection;

        while (this.isInsideBoard(row, col)) {
            //Revisa si hay una pieza
            const piece: Piece | null = table.pieces[row][col];

            if (piece) {
            //Si es pieza enemiga la torre la puede capturar 
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

        //Verifica si la lista esta vacia
        if (moves.length === 0) {
            return null;
        }
        
        return moves;
    }
}     