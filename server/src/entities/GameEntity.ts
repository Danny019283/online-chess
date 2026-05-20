import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './UserEntity';

@Entity('games')
export class GameEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => UserEntity, user => user.gamesAsPlayer1)
  @JoinColumn({ name: 'player1_id' })
  player1!: UserEntity;

  @Column()
  player1_id!: number;

  @ManyToOne(() => UserEntity, user => user.gamesAsPlayer2, { nullable: true })
  @JoinColumn({ name: 'player2_id' })
  player2?: UserEntity;

  @Column({ nullable: true })
  player2_id?: number;

  @Column('simple-json', { default: '[]' })
  boardState!: string;

  @Column({ default: 'waiting' })
  status!: 'waiting' | 'active' | 'finished';

  @Column({ nullable: true })
  winner_id?: number;

  @Column('simple-json', { default: '[]' })
  moves!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
