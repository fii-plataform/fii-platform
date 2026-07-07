import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { FIIProperty } from '@/types/fii';

// Default Leaflet marker icons reference bundled assets that don't resolve
// correctly under Vite by default — point them at the CDN copies instead.
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function FIIMap({ properties }: { properties: FIIProperty[] }) {
  const withCoords = properties.filter((p) => p.latitude && p.longitude);

  if (withCoords.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-base-600 text-sm text-ink-500 text-center px-6">
        Nenhuma coordenada de imóvel disponível para este fundo ainda. Cadastre a localização manualmente nas
        Configurações para exibir o mapa.
      </div>
    );
  }

  const center: [number, number] = [withCoords[0].latitude as number, withCoords[0].longitude as number];

  return (
    <div className="h-72 rounded-xl overflow-hidden border border-base-600">
      <MapContainer center={center} zoom={5} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map((p, i) => (
          <Marker key={i} position={[p.latitude as number, p.longitude as number]} icon={markerIcon}>
            <Popup>
              <strong>{p.name}</strong>
              <br />
              {p.city} — {p.state}
              <br />
              {p.segment}
              {p.occupancyPercent !== undefined && (
                <>
                  <br />
                  Ocupação: {p.occupancyPercent}%
                </>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
