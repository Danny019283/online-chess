import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { GameEntity } from './GameEntity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column()
  passwordHash!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => GameEntity, game => game.player1)
  gamesAsPlayer1?: GameEntity[];

  @OneToMany(() => GameEntity, game => game.player2)
  gamesAsPlayer2?: GameEntity[];
}
