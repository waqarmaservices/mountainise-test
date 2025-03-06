import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@hubspot/api-client';
import {
  PublicObjectSearchRequest,
  FilterOperatorEnum,
} from '@hubspot/api-client/lib/codegen/crm/companies';
import { MailService } from '../mail/mail.service';

@Injectable()
export class HubspotService {
  private readonly hubspotClient: Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {
    const hubspotAccessToken =
      this.configService.get<string>('HUBSPOT_API_KEY');

    if (!hubspotAccessToken) {
      throw new Error('HubSpot API access token is not set.');
    }

    this.hubspotClient = new Client({
      accessToken: hubspotAccessToken,
      limiterOptions: {
        minTime: 550,
        maxConcurrent: 3,
        id: 'search-hubspot-client-limiter',
      },
      numberOfApiCallRetries: 3,
    });
  }

  async processContacts(): Promise<{
    totalContacts: number;
    updatedDeals: number;
    newDeals: number;
  }> {
    const contacts = await this.getContacts();
    let updatedDeals = 0;
    let newDeals = 0;

    for (const contact of contacts) {
      const contactId = contact.id;
      const contactName = contact.properties.firstname || 'Unnamed';

      const deals = await this.getDealsByContact(contactId);

      if (deals.length > 0) {
        const dealId = deals[0].id;
        await this.updateDeal(dealId);
        updatedDeals++;
      } else {
        await this.createDeal(contactId, contactName);
        newDeals++;
      }
    }
    this.mailService.sendEmailReport(contacts.length, updatedDeals, newDeals);
    return { totalContacts: contacts.length, updatedDeals, newDeals };
  }

  async getContacts(): Promise<any[]> {
    try {
      const searchRequest: PublicObjectSearchRequest = {
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'createdate',
                operator: FilterOperatorEnum.Gte,
                value: '2025-01-01',
              },
              {
                propertyName: 'createdate',
                operator: FilterOperatorEnum.Lte,
                value: '2025-01-31',
              },
            ],
          },
        ],
      };

      const response =
        await this.hubspotClient.crm.contacts.searchApi.doSearch(searchRequest);
      return response.results || [];
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching contacts from HubSpot',
        error.message,
      );
    }
  }

  async getDealsByContact(contactId: string): Promise<any[]> {
    try {
      const searchRequest: PublicObjectSearchRequest = {
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'associations.contact',
                operator: FilterOperatorEnum.Eq,
                value: contactId,
              },
            ],
          },
        ],
      };

      const response =
        await this.hubspotClient.crm.deals.searchApi.doSearch(searchRequest);
      return response.results || [];
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching deals from HubSpot',
        error.message,
      );
    }
  }

  async updateDeal(dealId: string): Promise<void> {
    try {
      await this.hubspotClient.crm.deals.basicApi.update(dealId, {
        properties: { follow_up_status: 'pending_review' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating deal ${dealId}`,
        error.message,
      );
    }
  }

  async createDeal(contactId: string, contactName: string): Promise<void> {
    try {
      const deal: any = {
        properties: {
          dealname: `New Deal for ${contactName}`,
          pipeline: 'default',
          dealstage: 'appointmentscheduled',
          amount: '1000',
        },
        associations: [
          {
            to: { id: contactId },
            types: [
              { associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 },
            ],
          },
        ],
      };
      await this.hubspotClient.crm.deals.basicApi.create(deal);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating deal for contact ${contactId}`,
        error.message,
      );
    }
  }

  async createCustomProperty(): Promise<void> {
    try {
      const property: any = {
        name: 'follow_up_status',
        label: 'Follow Up Status',
        type: 'string',
        fieldType: 'text',
        groupName: 'dealinformation',
      };
      await this.hubspotClient.crm.properties.coreApi.create('deals', property);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error creating custom property',
        error.message,
      );
    }
  }
}
