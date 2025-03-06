import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HubspotModule } from './hubspot/hubspot.module';
import { HubspotService } from './hubspot/hubspot.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [HubspotModule, ConfigModule.forRoot({ isGlobal: true }), MailModule],
  controllers: [AppController],
  providers: [AppService, HubspotService, ConfigService, MailService],
})
export class AppModule {}
