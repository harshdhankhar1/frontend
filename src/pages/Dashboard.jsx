import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Plus, Trash2, Package } from 'lucide-react';

const Dashboard = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    originalPrice: '',
    quantity: '',
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [foodRes, ordersRes] = await Promise.all([
        axios.get('/food/restaurant'),
        axios.get('/orders/restaurant')
      ]);
      setFoodItems(foodRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      // Add restaurant's current location to food item
      const itemData = {
        ...newItem,
        latitude: user.location?.coordinates[1] || 0,
        longitude: user.location?.coordinates[0] || 0
      };
      
      await axios.post('/food', itemData);
      toast.success('Food item added successfully');
      setNewItem({ name: '', price: '', originalPrice: '', quantity: '' });
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to add food item');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/food/${id}`);
      toast.success('Food item removed');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put(`/orders/${id}/status`, { status });
      toast.success('Order status updated');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (!user || user.role !== 'restaurant') {
    return <div className="text-center mt-8">Access Denied. Restaurant only.</div>;
  }

  return (
    <div>
      <h1 className="mb-8">Restaurant Dashboard</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Add Food Form */}
        <div className="glass-panel" style={{ flex: 1, padding: '2rem' }}>
          <div className="flex items-center gap-2 mb-6 text-primary">
            <Plus size={24} />
            <h2>Add Surplus Food</h2>
          </div>
          <form onSubmit={handleAddItem}>
            <div className="form-group">
              <label className="form-label">Item Name (e.g., Surprise Bag, Leftover Pizza)</label>
              <input 
                type="text" 
                className="form-input" 
                value={newItem.name}
                onChange={e => setNewItem({...newItem, name: e.target.value})}
                required 
              />
            </div>
            <div className="flex gap-4">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Original Price ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-input" 
                  value={newItem.originalPrice}
                  onChange={e => setNewItem({...newItem, originalPrice: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Discount Price ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-input" 
                  value={newItem.price}
                  onChange={e => setNewItem({...newItem, price: e.target.value})}
                  required 
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity Available</label>
              <input 
                type="number" 
                className="form-input" 
                value={newItem.quantity}
                onChange={e => setNewItem({...newItem, quantity: e.target.value})}
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Add to Menu
            </button>
          </form>
        </div>

        <div style={{ flex: 2 }} className="flex flex-col gap-8">
          {/* Active Listings */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div className="flex items-center gap-2 mb-6 text-secondary-color">
              <Package size={24} />
              <h2>Your Active Listings</h2>
            </div>
            
            {loading ? (
              <p>Loading listings...</p>
            ) : foodItems.length === 0 ? (
              <p className="text-muted">You don't have any active food listings.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <th style={{ padding: '1rem' }}>Name</th>
                      <th style={{ padding: '1rem' }}>Price</th>
                      <th style={{ padding: '1rem' }}>Qty</th>
                      <th style={{ padding: '1rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foodItems.map(item => (
                      <tr key={item._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <td style={{ padding: '1rem' }}>{item.name}</td>
                        <td style={{ padding: '1rem' }}>${item.price} <span className="text-muted text-sm line-through">${item.originalPrice}</span></td>
                        <td style={{ padding: '1rem' }}>{item.quantity}</td>
                        <td style={{ padding: '1rem' }}>
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '0.5rem', color: '#ef4444' }}
                            onClick={() => handleDelete(item._id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Orders */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2>Recent Orders</h2>
            {loading ? (
              <p>Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-muted">No orders yet.</p>
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
                    <div className="text-sm text-muted mb-2">Customer: {order.userId?.name} ({order.userId?.email})</div>
                    <div className="mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.foodId?.name}</span>
                          <span>${item.price * item.quantity}</span>
                        </div>
                      ))}
                      <div className="border-t border-gray-600 mt-2 pt-2 font-bold flex justify-between">
                        <span>Total:</span>
                        <span>${order.totalAmount}</span>
                      </div>
                    </div>
                    
                    {order.status === 'pending' && (
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        onClick={() => updateOrderStatus(order._id, 'completed')}
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
