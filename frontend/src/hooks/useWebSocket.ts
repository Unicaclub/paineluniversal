import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface UseWebSocketReturn {
  socket: Socket | null;
  connected: boolean;
}

export const useWebSocket = (namespace: string = ''): UseWebSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketUrl = process.env.REACT_APP_MEEP_API_URL || 'http://localhost:3001';
    const newSocket = io(`${socketUrl}${namespace}`);

    newSocket.on('connect', () => {
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [namespace]);

  return { socket, connected };
};
