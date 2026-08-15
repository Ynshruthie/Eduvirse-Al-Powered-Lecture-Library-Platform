import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { io } from 'socket.io-client';

export const useUnreadComments = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.getMyComments();
        const comments = res.data.comments || [];
        const unread = comments.filter(c => c.status === 'Unresolved').length;
        setUnreadCount(unread);
      } catch (err) {
        console.error('Failed to fetch unread comments count', err);
      }
    };
    
    fetchComments();

    // Listen for real-time comment updates
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000', {
      withCredentials: true,
    });

    socket.on('new_comment', () => {
      // Refresh the comments count when a new comment comes in
      fetchComments();
    });

    socket.on('comment_resolved', () => {
      fetchComments();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return unreadCount;
};
