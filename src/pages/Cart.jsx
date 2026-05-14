import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Trash2, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Load cart from local storage
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
    
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/orders');
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load past orders');
    }
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQuantity = (index, delta) => {
    const newCart = [...cart];
    newCart[index].quantity += delta;
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    // Group items by restaurant
    const ordersByRestaurant = {};
    cart.forEach(item => {
      if (!ordersByRestaurant[item.restaurantId]) {
        ordersByRestaurant[item.restaurantId] = [];
      }
      ordersByRestaurant[item.restaurantId].push({
        foodId: item.foodId,
        quantity: item.quantity
      });
    });

    setLoading(true);
    try {
      // Place an order for each restaurant involved
      for (const restaurantId in ordersByRestaurant) {
        await axios.post('/orders', {
          restaurantId,
          items: ordersByRestaurant[restaurantId]
        });
      }
      
      toast.success('Orders placed successfully!');
      setCart([]);
      localStorage.removeItem('cart');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-8">
        <ShoppingBag size={32} className="text-primary" />
        <h1>Your Cart & Orders</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Cart Section */}
        <div className="glass-panel" style={{ flex: 1, padding: '2rem' }}>
          <h2>Current Cart</h2>
          
          {cart.length === 0 ? (
            <div className="text-center py-8 text-muted">
              Your cart is empty. Go rescue some food!
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-4">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-sm text-muted">{item.restaurantName}</div>
                    <div className="text-primary">${item.price.toFixed(2)} each</div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '0.25rem 0.75rem', fontSize: '1.2rem' }}
                      onClick={() => updateQuantity(index, -1)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '0.25rem 0.75rem', fontSize: '1.2rem' }}
                      onClick={() => updateQuantity(index, 1)}
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="ml-4 font-bold w-16 text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  
                  <button 
                    className="ml-4 text-red-500 hover:text-red-400"
                    onClick={() => removeFromCart(index)}
                  >
                    <Trash2 size={20} color="#ef4444" />
                  </button>
                </div>
              ))}
              
              <div className="border-t border-gray-600 mt-4 pt-4 flex justify-between items-center font-bold text-xl">
                <span>Total:</span>
                <span>${calculateTotal()}</span>
              </div>
              
              <button 
                className="btn btn-primary mt-4" 
                onClick={handleCheckout}
                disabled={loading || cart.length === 0}
              >
                {loading ? 'Processing...' : 'Checkout Now'}
              </button>
            </div>
          )}
        </div>

        {/* Orders History Section */}
        <div className="glass-panel" style={{ flex: 1, padding: '2rem' }}>
          <h2>Past Orders</h2>
          
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted">
              You haven't placed any orders yet.
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-4">
              {orders.map(order => (
                <div key={order._id} className="p-4" style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">Order #{order._id.substring(0,8)}</span>
                    <span className={`px-2 py-1 rounded text-sm ${order.status === 'completed' ? 'bg-primary text-white' : 'bg-secondary-color text-white'}`} style={{ padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-muted mb-2">From: {order.restaurantId?.name}</div>
                  <div className="mb-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.foodId?.name}</span>
                        <span>${item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-600 mt-2 pt-2 font-bold flex justify-between">
                    <span>Total:</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
