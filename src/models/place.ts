/** 🗺️ Place & Geocoding Domain Models — derived from the Zod contract. */
import { z } from 'zod';
import { PlaceSchema } from '../schemas/placeSchema';

export type Place = z.infer<typeof PlaceSchema>;

export interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  district?: string;
  /** 'gps' when from the device, 'default' when GPS was unavailable/denied. */
  source?: 'gps' | 'default';
}

export type NearbyPlace = Place;
