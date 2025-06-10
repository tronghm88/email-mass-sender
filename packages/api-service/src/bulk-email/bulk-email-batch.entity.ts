import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('bulk_email_batches')
export class BulkEmailBatch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sender_email: string;

  @Column()
  count: number;

  @Column()
  batchIndex: number;

  @Column({ type: 'timestamp' })
  datetime: Date;
}
