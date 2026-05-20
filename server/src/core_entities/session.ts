import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user';

export interface MoveRecord {
    from: { row: number; col: number };
    to: { row: number; col: number };
    userId: number;
    color: 'white' | 'black';
    movedAt: string;
}

@Entity('games')
export class Session {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, user => user.sessionsAsPlayer1)
    @JoinColumn({ name: 'player1_id' })
    player1!: User;

    @Column()
    player1_id!: number;

    @ManyToOne(() => User, user => user.sessionsAsPlayer2, { nullable: true })
    @JoinColumn({ name: 'player2_id' })
    player2?: User;

    @Column({ nullable: true })
    player2_id?: number;

    @Column('simple-json', { default: '[]' })
    boardState!: string;

    @Column({ default: 'waiting' })
    status!: 'waiting' | 'active' | 'finished';

    @Column({ nullable: true })
    winner_id?: number;

    @Column('simple-json', { default: '[]' })
    moves!: MoveRecord[];

    @CreateDateColumn()
    createdAt!: Date;

    private runtimePlayer1: string;
    private runtimePlayer2: string;
    private winner: string;

    constructor(player1 = '', player2 = '') {
        this.runtimePlayer1 = player1;
        this.runtimePlayer2 = player2;
        this.winner = '';
    }

    set _winner(winner: string) {
        this.winner = winner;
    }

    getWinner(): string {
        return this.winner;
    }

    hasWinner(): boolean {
        return this.winner !== '';
    }

    checkVictory(piece: unknown, destinationPiece: unknown): void {
        void piece;
        void destinationPiece;
    }
}
