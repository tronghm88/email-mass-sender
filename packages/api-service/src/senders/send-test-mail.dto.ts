export interface SendTestMailDto {
  sender: string; // email
  recipient: string;
  subject?: string;
  body?: string;
}
