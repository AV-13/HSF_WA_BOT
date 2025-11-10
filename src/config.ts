/**
 * Inca London Bot Configuration
 * Contains all restaurant information and bot settings
 */

export const INCA_INFO = {
  name: 'Inca London',
  slogan: 'Where Latin Spirit meets London Nights',

  contact: {
    address: '8-9 Argyll Street, Soho – London W1F 7TF',
    phone: '+44 (0)20 7734 6066',
    phonePrivateEvents: '+44 (0)777 181 7677',
    emails: {
      reservations: 'reservations@incalondon.com',
      privateEvents: 'dimitri@incalondon.com',
      mediaPress: 'janel@incalondon.com',
    },
    website: 'https://www.incalondon.com',
    instagram: '@incalondonofficial',
    instagramUrl: 'https://www.instagram.com/incalondonofficial/',
    bookingUrl: 'https://www.sevenrooms.com/reservations/incalondon',
  },

  hours: {
    wednesday: '8 PM – Late',
    thursday: '8 PM – Late',
    friday: '7 PM – Late',
    saturday: '7 PM – Late',
    sunday: '8 PM – Late',
    closed: ['Monday', 'Tuesday'],
  },

  policies: {
    ageRestriction: '18+ only',
    dressCode: 'Smart Elegant – no sportswear, shorts, caps, or sneakers',
    gracePeriod: '15 minutes maximum after the reservation time',
    bookingDuration: '2 hours',
    serviceCharge: '13.5% automatically added to the bill',
    minSpendApplies: true,
  },

  dining: {
    aLaCarteMax: 8,
    setMenuMin: 9,
    showStartTime: 'around 8:30–9:00 PM',
    chef: 'Davide Alberti',
    cuisineType: 'Latin American fusion with Nikkei influences',
  },

  privateEvents: {
    maxGuests: 250,
    maxSeated: 145,
    privateDiningRoom: 15,
  },

  transport: {
    nearestTube: 'Oxford Circus (2 min walk)',
    parking: 'No parking available – suggest nearby Q-Park Soho',
  },

  menus: {
    wine: {
      name: 'Wine Menu',
      url: 'https://www.incalondon.com/_files/ugd/325c3c_20753e61bce346538f8868a1485acfd9.pdf',
    },
    drinks: {
      name: 'Drinks Menu',
      url: 'https://www.incalondon.com/_files/ugd/325c3c_eddf185fa8384622b45ff682b4d14f76.pdf',
    },
    alacarte: {
      name: 'A La Carte Menu',
      url: 'https://www.incalondon.com/_files/ugd/325c3c_bdde0eb515e54beeba08ce662f63b801.pdf',
    },
    wagyu: {
      name: 'Wagyu Platter Menu',
      url: 'https://www.incalondon.com/_files/ugd/325c3c_bb9f24cd9a61499bbde31da9841bfb2e.pdf',
    },
  },
};

export const BOT_CONFIG = {
  language: 'en',
  maxEmojiPerMessage: 2,
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  welcomeMessageDelay: 500, // milliseconds
};
