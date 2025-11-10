/**
 * Google Maps Location Module
 * Handles location messages and provides interactive maps
 */

import { Mastra } from '@mastra/core';
import { generateText } from '../i18n/dynamicTranslation.js';

/**
 * Location data from WhatsApp
 */
export interface LocationData {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

/**
 * Histoire Sans Faim restaurant location
 */
export const INCA_LONDON_LOCATION: LocationData = {
  latitude: 46.538021,
  longitude: 6.6217711,
  name: 'Histoire Sans Faim',
  address: 'Parc du Loup 5a, 1018 Lausanne, Suisse'
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 *
 * @param lat1 - Latitude of point 1
 * @param lon1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lon2 - Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}


/**
 * Generate a response message for a location share
 *
 * @param mastra - Mastra instance
 * @param userLocation - User's shared location
 * @param language - User's language
 * @returns Response message text
 */
export async function generateLocationResponse(
  mastra: Mastra,
  userLocation: LocationData,
  language: string
): Promise<string> {
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    INCA_LONDON_LOCATION.latitude,
    INCA_LONDON_LOCATION.longitude
  );

  // Generate personalized response based on distance
  let distanceContext = '';
  if (distance < 1) {
    distanceContext = 'The user is very close (less than 1km away)';
  } else if (distance < 5) {
    distanceContext = `The user is ${distance.toFixed(1)}km away`;
  } else {
    distanceContext = `The user is ${distance.toFixed(1)}km away`;
  }

  const response = await generateText(
    mastra,
    `Thank the user for sharing their location. ${distanceContext}. Tell them you're sending the restaurant's location so they can get directions. Mention public transport: Bus 20 (Beau Site) or Bus 1 (Bois-Gentil). Keep it friendly and concise.`,
    language,
    'Response to a location share'
  );

  return response;
}

/**
 * Generate message to accompany restaurant location
 *
 * @param mastra - Mastra instance
 * @param language - User's language
 * @returns Message with restaurant location details
 */
export async function getRestaurantLocationMessage(
  mastra: Mastra,
  language: string
): Promise<string> {
  const message = await generateText(
    mastra,
    `Tell the user you're sending the restaurant's location. Provide the address: ${INCA_LONDON_LOCATION.address}. Mention public transport: Bus 20 (Beau Site) or Bus 1 (Bois-Gentil), and parking at Vélodrome. Be friendly and helpful.`,
    language,
    'Sharing restaurant location'
  );

  return message;
}
