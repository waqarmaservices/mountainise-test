import { Controller, Get } from '@nestjs/common';
import { HubspotService } from './hubspot.service';

@Controller('hubspot')
export class HubSpotController {
  constructor(private readonly hubSpotService: HubspotService) {}

  @Get('process/contacts')
  async getContacts() {
    return this.hubSpotService.processContacts();
  }

  @Get('create-property')
  async createProperty() {
    return this.hubSpotService.createCustomProperty();
  }
}
