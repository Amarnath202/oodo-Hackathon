import { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuthContext } from './AuthContext';

import { getAccessToken } from '../api/axios.instance';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';
const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const { isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (IS_DEMO || !isAuthenticated) return;
    const token = getAccessToken();
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket'],
      auth: { token }
    });
    socketRef.current = socket;
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated]);

  const joinRoom = useCallback((room) => {
    if (!IS_DEMO) socketRef.current?.emit('join_room', room);
  }, []);

  const leaveRoom = useCallback((room) => {
    if (!IS_DEMO) socketRef.current?.emit('leave_room', room);
  }, []);

  const on = useCallback((event, handler) => {
    if (!IS_DEMO) socketRef.current?.on(event, handler);
  }, []);

  const off = useCallback((event) => {
    if (!IS_DEMO) socketRef.current?.off(event);
  }, []);

  const emit = useCallback((event, data) => {
    if (!IS_DEMO) socketRef.current?.emit(event, data);
  }, []);

  return (
    <SocketContext.Provider value={{ joinRoom, leaveRoom, on, off, emit }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocketContext must be used within SocketProvider');
  return ctx;
};

export default SocketContext;
