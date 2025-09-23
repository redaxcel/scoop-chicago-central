import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iceCreamScoop from '@/assets/ice-cream-scoop.jpg';

interface Shop {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

interface IceCreamMapProps {
  shops: Shop[];
  selectedShopId?: string;
  onShopSelect?: (shopId: string) => void;
  height?: string;
  zoom?: number;
  center?: [number, number];
}

export const IceCreamMap = ({ 
  shops, 
  selectedShopId, 
  onShopSelect, 
  height = "400px",
  zoom = 11,
  center = [41.8781, -87.6298] // Chicago coordinates
}: IceCreamMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Create custom ice cream scoop icon
    const iceCreamIcon = L.divIcon({
      html: `
        <div class="ice-cream-marker">
          <div class="marker-content">
            <img src="${iceCreamScoop}" alt="Ice Cream" class="marker-icon" />
          </div>
        </div>
      `,
      className: 'custom-div-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });

    const selectedIcon = L.divIcon({
      html: `
        <div class="ice-cream-marker selected">
          <div class="marker-content">
            <img src="${iceCreamScoop}" alt="Ice Cream" class="marker-icon" />
          </div>
        </div>
      `,
      className: 'custom-div-icon',
      iconSize: [50, 50],
      iconAnchor: [25, 50],
      popupAnchor: [0, -50]
    });

    // Add markers for shops with coordinates
    shops.forEach(shop => {
      if (shop.latitude && shop.longitude) {
        const isSelected = shop.id === selectedShopId;
        const marker = L.marker([shop.latitude, shop.longitude], {
          icon: isSelected ? selectedIcon : iceCreamIcon
        }).addTo(map);

        marker.bindPopup(`
          <div class="shop-popup">
            <h3 class="font-bold text-lg mb-2">${shop.name}</h3>
            <p class="text-sm text-gray-600 mb-3">${shop.address}</p>
            <button 
              onclick="window.location.href='/shop/${shop.id}'"
              class="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors"
            >
              View Details
            </button>
          </div>
        `);

        if (onShopSelect) {
          marker.on('click', () => onShopSelect(shop.id));
        }

        markersRef.current.push(marker);
      }
    });

    // Fit map to show all markers if there are shops
    const validShops = shops.filter(shop => shop.latitude && shop.longitude);
    if (validShops.length > 0) {
      const group = new L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      map.remove();
      markersRef.current = [];
    };
  }, [shops, selectedShopId, onShopSelect, height, zoom, center]);

  return (
    <>
      <style>{`
        .custom-div-icon {
          background: none !important;
          border: none !important;
        }
        
        .ice-cream-marker {
          position: relative;
          width: 40px;
          height: 40px;
          transition: all 0.3s ease;
        }
        
        .ice-cream-marker.selected {
          width: 50px;
          height: 50px;
        }
        
        .marker-content {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 3px solid #fff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .ice-cream-marker.selected .marker-content {
          border-color: #f59e0b;
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
        }
        
        .marker-icon {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .shop-popup {
          min-width: 200px;
        }
        
        .shop-popup h3 {
          color: #1f2937;
          margin-bottom: 8px;
        }
        
        .shop-popup p {
          color: #6b7280;
          margin-bottom: 12px;
        }
      `}</style>
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }}
        className="rounded-lg overflow-hidden shadow-md"
      />
    </>
  );
};