"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect socket if user is authenticated
    if (isAuthenticated) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      let socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      // Strip trailing /api or trailing slashes to get the server root for Socket.IO
      socketUrl = socketUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');

      console.log('🔌 [Socket] Connecting to:', socketUrl);

      // Create socket connection
      const socketInstance = io(socketUrl, {
        auth: {
          token: token || '',
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = socketInstance;
      setSocket(socketInstance);

      // Connection event listeners
      socketInstance.on('connect', () => {
        console.log('✅ [Socket] Connected successfully with ID:', socketInstance.id);
        setIsConnected(true);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('👋 [Socket] Disconnected:', reason);
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('❌ [Socket] Connection error:', error.message);
        setIsConnected(false);
      });

      // Business event listeners
      socketInstance.on('new_notification', (data: { 
        notification?: { title: string; message: string; type: string; actionUrl?: string };
        title?: string;
        message?: string;
        actionUrl?: string;
      }) => {
        console.log('🔔 [Socket] New notification received:', data);
        
        const title = data.notification?.title || data.title || 'New Alert';
        const message = data.notification?.message || data.message || '';
        const actionUrl = data.notification?.actionUrl || data.actionUrl;

        // Show real-time interactive toast
        toast(title, {
          description: message,
          action: actionUrl ? {
            label: 'View',
            onClick: () => {
              if (typeof window !== 'undefined') {
                window.location.href = actionUrl;
              }
            }
          } : undefined,
          duration: 6000,
        });

        // Invalidate notifications queries to fetch latest list & count
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      });

      socketInstance.on('notification_count_update', (data: { count: number }) => {
        console.log('📊 [Socket] Notification count updated:', data);
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      });

      return () => {
        console.log('🔌 [Socket] Cleaning up socket connection...');
        if (socketInstance) {
          socketInstance.disconnect();
        }
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      // Disconnect socket if not authenticated
      if (socketRef.current) {
        console.log('🔌 [Socket] Disconnecting due to logout');
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, queryClient]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
