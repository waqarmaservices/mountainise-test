import { Module } from '@nestjs/common';
import { HubspotService } from './hubspot.service';
import { HubSpotController } from './hubspot.controller';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';

@Module({
  providers: [HubspotService, ConfigService, MailService],
  controllers: [HubSpotController],
})
export class HubspotModule {}
