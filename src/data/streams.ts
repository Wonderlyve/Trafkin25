export interface Stream {
  id: string | number;
  name: string;
  type: 'Caméra' | 'Drone' | 'Smartphone';
  status: 'Live' | 'Offline';
  url: string;
  location: {
    lat: number;
    lng: number;
  };
  quartier: string;
  description?: string;
  viewers?: number;
  lastUpdate?: string;
  hotSpotId?: string; // Add hot spot ID for video lookup
  imageUrl?: string | null; // Add image URL for display
  trafficStatus?: 'bouchon' | 'fluide' | 'chargee' | 'charge' | null; // Add traffic status for badge display
}

export const STREAMS: Stream[] = [
  {
    id: 1,
    name: "Victoire",
    type: "Caméra",
    status: "Live",
    url: "https://example.com/victoire.m3u8",
    location: { lat: -4.3196, lng: 15.3075 },
    quartier: "Victoire",
    description: "Carrefour principale de Victoire",
    viewers: 1247,
    lastUpdate: "Il y a 2 min"
  },
  {
    id: 2,
    name: "UPN Rond-point",
    type: "Drone",
    status: "Live",
    url: "https://example.com/upn.m3u8",
    location: { lat: -4.3345, lng: 15.3234 },
    quartier: "UPN",
    description: "Rond-point UPN - Vue aérienne",
    viewers: 892,
    lastUpdate: "Il y a 5 min"
  },
  {
    id: 3,
    name: "Debonhomme",
    type: "Smartphone",
    status: "Offline",
    url: "https://example.com/debonhomme.m3u8",
    location: { lat: -4.3098, lng: 15.2987 },
    quartier: "Debonhomme",
    description: "Carrefour Debonhomme",
    viewers: 0,
    lastUpdate: "Il y a 1h"
  },
  {
    id: 4,
    name: "Lemba Terminus",
    type: "Caméra",
    status: "Live",
    url: "https://example.com/lemba.m3u8",
    location: { lat: -4.3567, lng: 15.3456 },
    quartier: "Lemba",
    description: "Terminal de bus de Lemba",
    viewers: 654,
    lastUpdate: "Il y a 1 min"
  },
  {
    id: 5,
    name: "Matongé Market",
    type: "Drone",
    status: "Live",
    url: "https://example.com/matonge.m3u8",
    location: { lat: -4.3234, lng: 15.3123 },
    quartier: "Matongé",
    description: "Marché de Matongé - Vue d'ensemble",
    viewers: 1543,
    lastUpdate: "Il y a 3 min"
  },
  {
    id: 6,
    name: "Kintambo Port",
    type: "Caméra",
    status: "Live",
    url: "https://example.com/kintambo.m3u8",
    location: { lat: -4.2987, lng: 15.2876 },
    quartier: "Kintambo",
    description: "Port de Kintambo",
    viewers: 432,
    lastUpdate: "Il y a 4 min"
  }
];

export const getStreamById = (id: number): Stream | undefined => {
  return STREAMS.find(stream => stream.id === id);
};

export const getStreamsByQuartier = (quartier: string): Stream[] => {
  return STREAMS.filter(stream => 
    stream.quartier.toLowerCase().includes(quartier.toLowerCase())
  );
};

export const getStreamsByType = (type: Stream['type']): Stream[] => {
  return STREAMS.filter(stream => stream.type === type);
};

export const getStreamsByStatus = (status: Stream['status']): Stream[] => {
  return STREAMS.filter(stream => stream.status === status);
};