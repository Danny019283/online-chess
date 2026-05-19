import { Piece } from '../piece'
import { Table } from '../table';
class Pawn extends Piece {
    private hasMoved: boolean;
    private hasInitialLargeMove: boolean;
    constructor(color: string) {
        super(color);
        this.hasMoved = false;
        this.hasInitialLargeMove = false;
    }
    getValidMovements(table: Table, initialPos: [number, number]): (Array<[number, number]> | null) {
        return null;
    }
    getFirstMove(table: Table, initialPos: [number, number]): (Array<[number, number]> | null) {
        //orientación por si es negra o blanca
        let orientation = 1;
        //pieza a mover
        const currentPiece: Piece | null = table.pieces[initialPos[0]][initialPos[1]];
        if (!currentPiece) {
            return null;
        }
        //calcula orientación de la pieza en y
        if (currentPiece.color == 'black') {
            orientation *= orientation * -1;
        }
        const validmoves: [number, number][] = [];
        //calcula el siguiente movimiento, si no existe dentro del tablero retorna
        const coordsFirstSquare: [number, number]|null = this.calculateMove(initialPos, orientation, 0, 1);
        if(coordsFirstSquare){
            const blockingPiece1: Piece | null = table.pieces[coordsFirstSquare[0]][coordsFirstSquare[1]];
            if(!blockingPiece1){
                validmoves.push(coordsFirstSquare)
            }
        }
        const coordsSecondSquare: [number, number]|null = this.calculateMove(initialPos, orientation, 0, 2);
        if(coordsSecondSquare){
            const blockingPiece2: Piece | null = table.pieces[coordsSecondSquare[0]][coordsSecondSquare[1]];
            if(!blockingPiece2){
                validmoves.push(coordsSecondSquare);
            }
        }
        return validmoves;
    }
    getNormalMove(table: Table, initialPos: [number, number]): ([number, number] | null) {
        //orientación por si es negra o blanca
        let orientation = 1;
        //pieza a mover
        const currentPiece: Piece | null = table.pieces[initialPos[0]][initialPos[1]];
        if (!currentPiece) {
            return null;
        }
        if (currentPiece.color == 'black') {
            orientation *= orientation * -1;
        }
        //calcula el siguiente movimiento, si no existe dentro del tablero retorna
        const coordsOnTable: [number, number]|null = this.calculateMove(initialPos, orientation, 0, 1);
        if(!coordsOnTable){
            return null;
        }
        //calcula si hay piezas bloqueando el camino
        const blockingPiece: Piece | null = table.pieces[coordsOnTable[0]][coordsOnTable[1]];
        if (blockingPiece) {
            return null;
        }
        return coordsOnTable;
    }
    getCaptureMoves(table: Table, initialPos: [number, number]): (Array<[number, number]> | null) {
        //orientación por si es negra o blanca
        let orientation = 1;
        //pieza a mover
        const currentPiece: Piece | null = table.pieces[initialPos[0]][initialPos[1]];
        if (!currentPiece) {
            return null;
        }
        const validCaptures: [number, number][] = [];
        //calcula la si hay un casilla a la derecha
        const coordsRightUpSquare: [number, number]|null = this.calculateMove(initialPos, orientation, 1, 1);
        if(coordsRightUpSquare){
            this.haveOpponentAdyacentPawn(table, initialPos, orientation);
            const adyacentPieceUpRight: Piece | null = table.pieces[coordsRightUpSquare[0]][coordsRightUpSquare[1]];
            //si hay un oponente contrario es un movimiento valido
            if (adyacentPieceUpRight && adyacentPieceUpRight.color != this.color) {
                validCaptures.push(coordsRightUpSquare);
            }
        }
        //calcula la si hay un casilla a la izquierda
        const coordsLeftSquare: [number, number]|null = this.calculateMove(initialPos, orientation, -1, 1);
        if(coordsLeftSquare){
            const adyacentPieceUpLeft: Piece | null = table.pieces[coordsLeftSquare[0]][coordsLeftSquare[1]];
            //si hay un oponente contrario es un movimiento valido
            if (adyacentPieceUpLeft && adyacentPieceUpLeft.color != this.color) {
                validCaptures.push(coordsLeftSquare);
            }
        }
        return validCaptures;
    }
    //falta arreglar cosas
    getPassantCapture(table: Table, initialPos: [number, number]): (Array<[number, number]> | null) {
        //si están en posiciones donde captura al paso no esta permitido retornar
        if (initialPos[1] != 5 && initialPos[1] != 4) {
            return null;
        }
        //pieza a mover
        const currentPiece: Piece | null = table.pieces[initialPos[0]][initialPos[1]];
        if (!currentPiece) {
            return null;
        }
        //valida que este en la fila corecta según el color
        if (currentPiece.color == 'black' && initialPos[1] != 4) {
            return null;
        }
        if (currentPiece.color == 'white' && initialPos[1] != 4) {
            return null;
        }
        //orientación en y por si es negra o blanca
        let orientation = 1;
        if (currentPiece.color == 'black') {
            orientation *= orientation * -1;
        }
        const validCaptures: [number, number][] = [];
        //saber si hay peon rival que hizo el saque en largo en alguno de los lados
        //izquierda
        if(this.haveOpponentAdyacentPawn(table, initialPos, -1)){
            const coordsCaptureLeft: [number, number]|null = this.calculateMove(initialPos, orientation, -1, 1);
            //validar que esta dentro del tablero
            if(coordsCaptureLeft){
                if(!this.haveBlockingPiece(table, coordsCaptureLeft)){
                    validCaptures.push(coordsCaptureLeft);
                }
            }
        }
        //derecha
        if(this.haveOpponentAdyacentPawn(table, initialPos, 1)){
            const coordsCaptureRight: [number, number]|null = this.calculateMove(initialPos, orientation, 1, 1);
            if(coordsCaptureRight){
                if(!this.haveBlockingPiece(table, coordsCaptureRight)){
                    validCaptures.push(coordsCaptureRight);
                }
            }
        }
        return validCaptures;
    }
    private haveOpponentAdyacentPawn(table: Table, currentPos: [number, number], orientation: number): boolean{
        //calcula peón adyacente
        const adyacentPiece: Piece | null = table.pieces[currentPos[0]+1*orientation][currentPos[1]];
        //saber si hay un peón adyacente
        if(!adyacentPiece){
            return false;
        }
        //si las piezas adyacentes no son Peones retornar
        if (!(adyacentPiece instanceof Pawn)) {
            return false;
        }
        const pawn: Pawn = adyacentPiece;
        //el peon debe ser oponente y haber realizado el saque en largo
        if(pawn.color != this.color || !pawn.hasInitialLargeMove){
            return false;
        }
        return true;
    }
    private haveBlockingPiece(table: Table, coordsCapture: [number, number]): boolean{
        //validar que este dentro del tablero    
        const blockingPiece: Piece|null = table.pieces[coordsCapture[0]][coordsCapture[1]];
        if (!blockingPiece){
            return false;
        }
        return true;
    }
    //Limites dentro del tablero
    private isInsideBoard(row: number, col: number): boolean {
        return row >= 0 && row < 8 && col >= 0 && col < 8;

    }
    private calculateMove(initialPos: [number, number], orientationY: number, 
        xOffSet: number, yOffSet: number): [number, number]|null{
        //calcula el posible movimiento
        const coordXOnTable: number = initialPos[0]+xOffSet;
        const coordYOnTable: number = initialPos[1]+(yOffSet * orientationY);
        //saber si el posible movimiento esta dentro de los limites del tablero
        if(this.isInsideBoard(coordXOnTable, coordYOnTable)){
            return null;
        }
        return [coordXOnTable, coordYOnTable];
    }
} 