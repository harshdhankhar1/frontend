import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Leaf } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Get location for all users
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const dataWithLocation = {
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          const success = await register(dataWithLocation);
          setLoading(false);
          if (success) navigate('/');
        },
        async (error) => {
          // Fallback if location denied
          const success = await register(formData);
          setLoading(false);
          if (success) navigate('/');
        }
      );
    } else {
      const success = await register(formData);
      setLoading(false);
      if (success) navigate('/');
    }
  };

  return (
    <div className="flex justify-center items-center" style={{ minHeight: '70vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
        <div className="flex flex-col items-center mb-8">
          <Leaf className="text-primary mb-2" size={40} />
          <h2>Create Account</h2>
          <p className="text-muted">Join EcoBite to reduce food waste</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name / Restaurant Name</label>
            <input 
              type="text" 
              name="name"
              className="form-input" 
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              name="email"
              className="form-input" 
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              name="password"
              className="form-input" 
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">I am a...</label>
            <select 
              name="role" 
              className="form-select" 
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">Hungry Customer (Buyer)</option>
              <option value="restaurant">Restaurant (Seller)</option>
            </select>
          </div>
          {formData.role === 'restaurant' && (
            <div className="form-group">
              <label className="form-label">Address</label>
              <input 
                type="text" 
                name="address"
                className="form-input" 
                placeholder="123 Main St, City"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
          )}
          
          <button type="submit" className="btn btn-primary mt-4" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-8 text-center text-muted">
          Already have an account? <Link to="/login" className="text-primary">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
