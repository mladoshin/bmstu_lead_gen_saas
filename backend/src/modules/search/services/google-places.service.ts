import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface GooglePlaceResult {
  name: string;
  website?: string;
  phone?: string;
  address?: string;
  city: string;
}

export interface IGooglePlacesService {
  searchPlaces(industry: string, city: string): Promise<GooglePlaceResult[]>;
}

export const GOOGLE_PLACES_SERVICE_TOKEN = 'IGooglePlacesService';

@Injectable()
export class GooglePlacesService implements IGooglePlacesService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async searchPlaces(industry: string, city: string): Promise<GooglePlaceResult[]> {
    const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
    const textQuery = `${industry} ${city}`;

    const response = await firstValueFrom(
      this.httpService.post(
        'https://places.googleapis.com/v1/places:searchText',
        { textQuery, maxResultCount: 20 },
        {
          headers: {
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': [
              'places.displayName',
              'places.websiteUri',
              'places.nationalPhoneNumber',
              'places.formattedAddress',
            ].join(','),
          },
        },
      ),
    );

    return (response.data.places ?? []).map((p: any) => ({
      name: p.displayName?.text ?? '',
      website: p.websiteUri,
      phone: p.nationalPhoneNumber,
      address: p.formattedAddress,
      city,
    }));
  }
}
