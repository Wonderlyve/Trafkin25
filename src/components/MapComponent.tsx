import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Stream } from '@/data/streams';

// Fix pour les icônes par défaut de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  streams: Stream[];
  onStreamClick: (streamId: string | number) => void;
}

export default function MapComponent({ streams, onStreamClick }: MapComponentProps) {
  const [isClient, setIsClient] = useState(false);
  
  // Position de Kinshasa
  const kinshasa: [number, number] = [-4.325, 15.322];

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center">
        <div className="text-center text-blue-700">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={kinshasa}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      className="rounded-2xl"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Markers pour les hotspots */}
      {streams.map((stream) => {
        // Utiliser la position du hotspot ou générer une position autour de Kinshasa
        const lat = stream.location?.lat || (kinshasa[0] + (Math.random() - 0.5) * 0.1);
        const lng = stream.location?.lng || (kinshasa[1] + (Math.random() - 0.5) * 0.1);
        
        return (
          <Marker 
            key={stream.id} 
            position={[lat, lng]}
            eventHandlers={{
              click: () => onStreamClick(stream.id),
            }}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold">{stream.name}</h3>
                <p className="text-sm text-muted-foreground">{stream.quartier}</p>
                <div className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
                  stream.status === 'Live' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-500 text-white'
                }`}>
                  {stream.status === 'Live' ? '🔴 En direct' : '⚫ Hors ligne'}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}