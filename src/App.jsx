import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Cart from './pages/Cart';

function App() {
  useEffect(() => {
    fetch("https://backend-vraw.onrender.com/api/test")
      .then((res) => res.json())
      .then((data) => {
        console.log("Test Endpoint Result:", data);
        if (data.message) {
          toast.success(data.message);
        }
      })
      .catch((err) => console.error("Test Endpoint Error:", err));
  }, []);
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main className="container mt-8 animate-fade-in">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/cart" element={<Cart />} />
              </Routes>
            </main>
            <ToastContainer position="bottom-right" theme="dark" />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
