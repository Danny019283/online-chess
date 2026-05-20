import { Piece } from "../core_entities/piece";
import { Session } from "../core_entities/session";
import { King } from "../core_entities/pieces/king"

class Game {
    // Contadores de capturas
    private capturedPiecesByWhite: number = 0;
    private capturedPiecesByBlack: number = 0;

    // Verifica si un rey esta en jaque
    isCheck(table: any, kingColor: string): boolean {

        // Guarda la posicion del rey
        let kingPosition: [number, number] | null = null;

        // Busca el rey en el tablero
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {

                // Obtiene la pieza actual
                const piece: Piece | null = table.pieces[row][col];

                // Verifica si es el rey correcto
                if (piece instanceof King && piece.color == kingColor){
                    // Guarda la posicion del rey
                    kingPosition = [row, col];
                    break;
                }
            }
        }
        // Si no encontro rey
        if (!kingPosition) {
            return false;
        }
        // Recorre todas las piezas enemigas
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                // Obtiene pieza actual
                const piece: Piece | null = table.pieces[row][col];
                // Solo revisa piezas enemigas
                if (piece && piece.color !== kingColor) {
                    // Obtiene movimientos validos
                    const validMoves: Array<[number, number]> | null =
                        piece.getValidMovements(table, [row, col]);
                    // Si no tiene movimientos
                    if (!validMoves) {
                        continue;
                    }
                    // Verifica si puede atacar al rey
                    for(const coords of validMoves){
                        //si el rey esta siendo atacado hay jaque
                        if(kingPosition[0] == coords[0] && kingPosition[1] == coords[1]){
                            return true
                        }
                    }
                }
            }
        }
        // No hay jaque
        return false;
    }

    // Verifica si un jugador esta en jaque mate
    isCheckmate(table: any, kingColor: string): boolean {

        // Si no hay jaque entonces no hay mate
        if (!this.isCheck(table, kingColor)) {
            return false;
        }

        // Recorre todas las piezas del jugador
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {

                // Obtiene la pieza
                const piece: Piece | null = table.pieces[row][col];

                // Solo revisa piezas del color del rey
                if (piece && piece.color === kingColor) {

                    // Obtiene movimientos validos de la pieza
                    const validMoves: Array<[number, number]> | null =
                        piece.getValidMovements(table, [row, col]);

                    // Si no tiene movimientos
                    if (!validMoves) {
                        continue;
                    }

                    // Probar todos los movimientos posibles
                    for (const move of validMoves) {

                        // Coordenadas destino
                        const [toRow, toCol] = move;

                        // Guarda la pieza original del destino
                        const originalPiece: Piece | null = table.pieces[toRow][toCol];

                        // Simula el movimiento
                        table.pieces[toRow][toCol] = piece;
                        table.pieces[row][col] = null;

                        // Verifica si aun sigue en jaque
                        const stillInCheck: boolean = this.isCheck(table, kingColor);

                        // Revierte movimiento
                        table.pieces[row][col] = piece;
                        table.pieces[toRow][toCol] = originalPiece;

                        // Si existe un movimiento que salva al rey no es jaque mate
                        if (!stillInCheck) {
                            return false;
                        }
                    }
                }
            }
        }
        // Ningun movimiento salva al rey
        return true;
    }

    // Mueve una pieza si el movimiento es valido
    movePiece(
        table: any,
        session: Session,
        from: [number, number],
        to: [number, number]
    ): boolean {

        // Valida posiciones dentro del tablero
        if (!table.isInsideBoard(from[0], from[1]) || !table.isInsideBoard(to[0], to[1])) {
            return false;
        }

        // Si ya hay ganador, no permite mas movimientos
        if (session.hasWinner()) {
            return false;
        }

        // Obtiene la pieza inicial
        const piece: Piece | null = table.pieces[from[0]][from[1]];

        if (!piece) {
            return false;
        }

        // Obtiene movimientos validos
        const validMovements: Array<[number, number]> | null =
            piece.getValidMovements(table, from);

        if (!validMovements) {
            return false;
        }

        // Verifica si el destino es valido
        const isValidMove: boolean = validMovements.some(
            (movement: [number, number]) =>
                movement[0] === to[0] && movement[1] === to[1]
        );

        if (!isValidMove) {
            return false;
        }

        // Revisa la pieza del destino
        const destinationPiece: Piece | null = table.pieces[to[0]][to[1]];

        // Evita capturar pieza aliada
        if (destinationPiece && destinationPiece.color === piece.color) {
            return false;
        }

        // Guarda pieza original del destino
        const originalDestinationPiece: Piece | null = table.pieces[to[0]][to[1]];

        // Simula movimiento
        table.pieces[to[0]][to[1]] = piece;

        // Limpia posicion anterior
        table.pieces[from[0]][from[1]] = null;

        // Verifica si el movimiento deja al propio rey en jaque
        const ownKingInCheck: boolean = this.isCheck(table, piece.color);

        // Si deja al rey en jaque el movimiento es invalido
        if (ownKingInCheck) {

            // Revierte movimiento
            table.pieces[from[0]][from[1]] = piece;
            table.pieces[to[0]][to[1]] = originalDestinationPiece;

            return false;
        }

        // Si hay pieza enemiga se cuenta como captura
        if (destinationPiece) {
            if (piece.color === "white") {
                this.capturedPiecesByWhite++;
            } else {
                this.capturedPiecesByBlack++;
            }
        }

        // Determina color enemigo
        const enemyColor: string = piece.color === "white" ? "black" : "white";

        // Verifica jaque mate
        if (this.isCheckmate(table, enemyColor)) {

            // Guarda ganador
            session._winner = piece.color;
        }

        // Movimiento valido
        return true;
    }

    // Retorna las capturas hechas por blancas
    getCapturedPiecesByWhite(): number {
        return this.capturedPiecesByWhite;
    }

    // Retorna las capturas hechas por negras
    getCapturedPiecesByBlack(): number {
        return this.capturedPiecesByBlack;
    }
}

export { Game };