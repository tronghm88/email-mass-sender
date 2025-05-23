import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sender_emails')
export class SenderEmail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'text' })
  accessToken: string;

  @Column({ type: 'text' })
  refreshToken: string;

  @Column()
  expiresAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
