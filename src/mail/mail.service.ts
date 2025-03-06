import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      auth: {
        user: this.configService.get<string>('SMTP_EMAIL'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('SMTP_EMAIL'),
      to,
      subject,
      text,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendEmailReport(
    totalContacts: number,
    dealsUpdated: number,
    dealsCreated: number,
  ): Promise<void> {
    console.log('Sending email report');
    const subject = 'HubSpot Deals Processing Report';
    const text = `Total contacts processed: ${totalContacts}\nDeals Updated: ${dealsUpdated}\nNew Deals Created: ${dealsCreated}`;

    await this.sendEmail('admin@example.com', subject, text);
  }
}
