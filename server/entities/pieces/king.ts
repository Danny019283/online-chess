import {Piece} from '../piece'
import { Board } from '../board';
import { Tower } from "../tower";

export class King extends Piece {
    constructor(color: string){
        super(color);
    }

    //Movimientos posibles del rey en una sola direccion
    private getMovesInDirection(table: Board, position: [number, number], rowDirection: number, colDirection: number) : [number, number][]{
        const moves: [number, number][] = [];

        let row = position[0] + rowDirection;
        let col = position[1] + colDirection;

        //El rey solo puede moverse una casilla
        if (table.isInsideBoard(row, col)) {
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

    // Verifica posibles enroques
private getCastlingMoves(
    table: Board,
    position: [number, number]
): [number, number][] {

    const moves:
        [number, number][] = [];

    // Si el rey ya se movio
    if (this.hasMoved) {
        return moves;
    }

    const row = position[0];

    // Enroque corto
    const rightTower =
        table.pieces[row][7];

    if (
        rightTower &&
        rightTower instanceof Tower &&
        rightTower.color === this.color &&
        !rightTower.hasMoved
    ) {

        if (
            !table.pieces[row][5] &&
            !table.pieces[row][6]
        ) {

            moves.push([row, 6]);
        }
    }

    // Enroque largo
    const leftTower =
        table.pieces[row][0];

    if (
        leftTower &&
        leftTower instanceof Tower &&
        leftTower.color === this.color &&
        !leftTower.hasMoved
    ) {

        if (
            !table.pieces[row][1] &&
            !table.pieces[row][2] &&
            !table.pieces[row][3]
        ) {

            moves.push([row, 2]);
        }
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

        // Agrega movimientos de enroque
        moves.push( ...this.getCastlingMoves( table, position));

        //Verifica si la lista esta vacia
        if (moves.length === 0) {
            return null;
        }
        
        return moves;
    }
}