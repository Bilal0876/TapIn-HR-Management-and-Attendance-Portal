import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '../lib/axios';

// Extract base URL from API_URL (e.g., http://10.0.2.2:3000/api/v1 -> http://10.0.2.2:3000)
const SOCKET_URL = API_URL.replace('/api/v1', '');

export const useSocket = (companyId: string | undefined, onPulse?: (data: any) => void) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!companyId) return;

    // Initialize socket
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      forceNew: true
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('activity:pulse', (data) => {
      // Filter for current company
      if (data.companyId === companyId) {
        if (onPulse) onPulse(data);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [companyId]);

  const emit = (event: string, data: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  return { socket: socketRef.current, emit };
};
