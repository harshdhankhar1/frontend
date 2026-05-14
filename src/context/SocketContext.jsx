import React, { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const newSocket = io('https://backend-vraw.onrender.com');
    setSocket(newSocket);

    newSocket.on('newFoodItem', (data) => {
      // Don't notify the restaurant who added it
      if (user && user.role !== 'restaurant') {
        toast.info(`🍽️ ${data.message} - ${data.foodItem.name} at ${data.restaurantName}`);
      }
    });

    return () => newSocket.close();
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
