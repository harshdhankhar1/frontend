import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Tag, DollarSign, Navigation } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icon for user location
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom icon for restaurants
const restaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to recenter map when userLocation changes
const RecenterAutomatically = ({ lat, lng }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
};

const MapComponent = ({ userLocation, foodItems }) => {
  // Group food items by restaurant to display multiple items in one marker
  const restaurants = useMemo(() => {
    const grouped = {};
    foodItems.forEach(item => {
      // Ensure the item has a valid restaurant location
      if (item.restaurantId && item.location && item.location.coordinates) {
        const rId = typeof item.restaurantId === 'object' ? item.restaurantId._id : item.restaurantId;
        const rName = typeof item.restaurantId === 'object' ? item.restaurantId.name : 'Restaurant';
        
        if (!grouped[rId]) {
          grouped[rId] = {
            id: rId,
            name: rName,
            // MongoDB stores coordinates as [longitude, latitude]
            lat: item.location.coordinates[1],
            lng: item.location.coordinates[0],
            items: []
          };
        }
        grouped[rId].items.push(item);
      }
    });
    return Object.values(grouped);
  }, [foodItems]);

  const defaultCenter = [40.7128, -74.0060]; // Default to NY or any default city
  const center = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;

  return (
    <div className="mb-8" style={{ height: '400px', width: '100%', position: 'relative' }}>
      <MapContainer 
        center={center} 
        zoom={userLocation ? 13 : 11} 
        style={{ height: '100%', width: '100%', borderRadius: '1rem', zIndex: 10 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>
                <div className="font-bold text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Navigation size={16} className="text-red-500" />
                  </div>
                  You are here
                </div>
              </Popup>
            </Marker>
            <RecenterAutomatically lat={userLocation.lat} lng={userLocation.lng} />
          </>
        )}

        {restaurants.map(restaurant => (
          <Marker 
            key={restaurant.id} 
            position={[restaurant.lat, restaurant.lng]}
            icon={restaurantIcon}
          >
            <Popup className="restaurant-popup">
              <div style={{ minWidth: '200px' }}>
                <h3 className="text-primary mb-2 border-b border-gray-600 pb-1 flex items-center gap-2" style={{ fontSize: '1.1rem', margin: 0, paddingBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                  {restaurant.name}
                </h3>
                <div className="food-items-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {restaurant.items.map(item => (
                    <div key={item._id} className="map-popup-food-item">
                      <div className="font-bold" style={{ fontSize: '0.95rem' }}>{item.name}</div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-primary font-bold">{formatCurrency(item.price)}</span>
                        <span className="text-xs text-muted line-through">{formatCurrency(item.originalPrice)}</span>
                        <span className="text-xs ml-2 px-2 py-1 rounded-full" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--primary-color)' }}>
                          {item.quantity} left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
