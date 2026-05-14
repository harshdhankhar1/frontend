import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, ShoppingCart, User, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-brand">
          <Leaf className="text-primary" size={28} />
          <span>EcoBite</span>
        </Link>
        
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          
          {user ? (
            <>
              {user.role === 'restaurant' && (
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
              )}
              {user.role === 'user' && (
                <Link to="/cart" className="nav-link flex items-center gap-1">
                  <ShoppingCart size={18} /> Cart
                </Link>
              )}
              <div className="nav-link flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <User size={18} /> {user.name}
              </div>
              <button onClick={handleLogout} className="btn btn-outline flex items-center gap-2" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
