import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const socketUrl = API_BASE_URL.replace('/api', '');

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      transports: ['websocket', 'polling']
    });
  }
  return socket;
};
