export class Session {

    // Jugador 1
    private player1: string;
    // Jugador 2
    private player2: string;
    // Ganador de la partida
    private winner: string;

    // Constructor de la sesion
    constructor(player1: string,player2: string) {

        this.player1 = player1;
        this.player2 = player2;

        // Inicialmente no hay ganador
        this.winner = '';
    }

    // Guarda el ganador
    set _winner(
        winner: string
    ) {
        this.winner = winner;
    }

    // Retorna el ganador
    getWinner(): string {
        return this.winner;
    }

    // Verifica si ya existe un ganador
    hasWinner(): boolean {
        return this.winner !== '';
    }

    // Verifica condicion de victoria
    // Metodo temporal para evitar errores ya que ahora se usa jaque mate
    checkVictory(
        piece: any,
        destinationPiece: any
    ): void {
        // No se usa de momento
    }
}
