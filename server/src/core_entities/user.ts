import { hash } from 'bcrypt';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Session } from './session';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    username!: string;

    @Column()
    passwordHash!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @OneToMany(() => Session, session => session.player1)
    sessionsAsPlayer1?: Session[];

    @OneToMany(() => Session, session => session.player2)
    sessionsAsPlayer2?: Session[];

    constructor(username?: string, passwordHash?: string) {
        if (username) {
            this.username = username;
        }

        if (passwordHash) {
            this.passwordHash = passwordHash;
        }
    }

    static async create(username: string, password: string): Promise<User> {
        const passwordHash = await hash(password, 10);
        return new User(username, passwordHash);
    }
}
