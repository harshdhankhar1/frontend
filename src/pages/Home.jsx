import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { MapPin, Clock, DollarSign, Filter, Tag } from 'lucide-react';
import MapComponent from '../components/MapComponent';

// Haversine formula to calculate distance between two coordinates in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return (R * c).toFixed(1); // Distance in km
};

const Home = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  
  // Filters
  const [maxDistance, setMaxDistance] = useState(50000000); // 50,000km to ensure dummy data shows globally
  const [maxPrice, setMaxPrice] = useState(50);
  
  const { user } = useContext(AuthContext);

  const fetchFoodItems = async (lat, lng) => {
    try {
      setLoading(true);
      let url = '/food';
      if (lat && lng) {
        url += `?lat=${lat}&lng=${lng}&maxDistance=${maxDistance}`;
      }
      if (maxPrice) {
        url += `${lat ? '&' : '?'}maxPrice=${maxPrice}`;
      }
      
      const { data } = await axios.get(url);
      setFoodItems(data);
    } catch (error) {
      toast.error('Failed to load food items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          fetchFoodItems(latitude, longitude);
        },
        (error) => {
          setLocationError('Location access denied. Showing all available items.');
          fetchFoodItems();
        }
      );
    } else {
      fetchFoodItems();
    }
    // eslint-disable-next-line
  }, [maxDistance, maxPrice]);

  const addToCart = (item) => {
    if (!user) {
      toast.error('Please login to order food');
      return;
    }
    if (user.role === 'restaurant') {
      toast.error('Restaurants cannot place orders');
      return;
    }
    
    // Simple local storage cart for demo purposes
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(c => c.foodId === item._id);
    
    if (existing) {
      if (existing.quantity >= item.quantity) {
        toast.error('Maximum available quantity reached');
        return;
      }
      existing.quantity += 1;
    } else {
      cart.push({
        foodId: item._id,
        name: item.name,
        price: item.price,
        restaurantName: item.restaurantId?.name || 'Restaurant',
        restaurantId: item.restaurantId?._id || item.restaurantId,
        quantity: 1
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div>
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="mb-2">Rescue Delicious Food</h1>
        <p className="text-muted" style={{ maxWidth: '600px' }}>
          Discover unsold, perfectly good food from local restaurants at a huge discount. 
          Save money while helping the planet.
        </p>
      </div>

      <MapComponent userLocation={userLocation} foodItems={foodItems} />

      <div className="glass-panel p-4 mb-8">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Filter size={20} /> Filters:
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Max Distance (m):</label>
            <input 
              type="number" 
              className="form-input" 
              style={{ padding: '0.25rem 0.5rem', width: '100px' }}
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Max Price ($):</label>
            <input 
              type="number" 
              className="form-input" 
              style={{ padding: '0.25rem 0.5rem', width: '100px' }}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {locationError && (
        <div className="mb-4 text-secondary-color text-center">{locationError}</div>
      )}

      {loading ? (
        <div className="text-center mt-8 text-xl">Loading delicious deals...</div>
      ) : foodItems.length === 0 ? (
        <div className="text-center mt-8 text-muted">
          No food items found matching your criteria. Check back later!
        </div>
      ) : (
        <div className="food-grid">
          {foodItems.map(item => {
            let distanceStr = '';
            if (userLocation && item.location?.coordinates) {
              const dist = calculateDistance(
                userLocation.lat, userLocation.lng, 
                item.location.coordinates[1], item.location.coordinates[0] // Mongo is [lng, lat]
              );
              if (dist) distanceStr = `${dist} km away`;
            }

            return (
              <div key={item._id} className="food-card glass-panel">
                {/* Image Cover */}
                <div 
                  className="food-card-image"
                  style={{ 
                    height: '160px', 
                    backgroundImage: `url(${item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderTopLeftRadius: 'var(--radius)',
                    borderTopRightRadius: 'var(--radius)',
                    position: 'relative'
                  }}
                >
                  <div className="food-badge" style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    {item.quantity} left
                  </div>
                  {item.category && (
                    <div className="food-badge" style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'var(--secondary-color)', color: 'white' }}>
                      {item.category}
                    </div>
                  )}
                </div>

                <div className="food-card-body p-4">
                  <h3 className="mb-1" style={{ fontSize: '1.2rem', margin: '0' }}>{item.name}</h3>
                  
                  <div className="food-restaurant text-muted mt-2 flex items-center gap-1" style={{ fontSize: '0.9rem' }}>
                    <MapPin size={14} /> {item.restaurantId?.name || 'Restaurant'}
                    {distanceStr && <span style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>• {distanceStr}</span>}
                  </div>

                  {item.pickupTime && (
                    <div className="food-pickup text-muted mt-1 flex items-center gap-1" style={{ fontSize: '0.9rem' }}>
                      <Clock size={14} /> Pickup: {item.pickupTime}
                    </div>
                  )}

                  <div className="food-price-row mt-3 flex items-center gap-2">
                    <span className="food-price text-xl font-bold text-primary">${item.price.toFixed(2)}</span>
                    <span className="food-original-price line-through text-muted text-sm">${item.originalPrice.toFixed(2)}</span>
                    <span className="food-stat ml-auto text-sm text-secondary-color font-bold" style={{ backgroundColor: 'rgba(235, 87, 87, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                      Save {Math.round((1 - item.price / item.originalPrice) * 100)}%
                    </span>
                  </div>
                  
                  <div className="food-card-footer mt-4">
                    <button 
                      className="btn btn-primary w-full" 
                      style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                      onClick={() => addToCart(item)}
                      disabled={user?.role === 'restaurant'}
                    >
                      <Tag size={16} /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
