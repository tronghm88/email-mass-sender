import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('email_logs')
export class EmailLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sender: string;

  @Column()
  recipient: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ default: 'success' })
  status: 'success' | 'fail';

  @Column({ type: 'text', nullable: true })
  error: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
