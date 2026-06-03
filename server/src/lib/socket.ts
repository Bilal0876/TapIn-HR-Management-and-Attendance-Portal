import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { logger } from './logger';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: '*', // In production, restrict this to your mobile app/web domain
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    logger.info('A user connected to socket', { socketId: socket.id });

    socket.on('disconnect', () => {
      logger.info('User disconnected from socket', { socketId: socket.id });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

export const emitToCompany = (companyId: string, event: string, data: any) => {
  if (io) {
    // In the future, we can use socket.join(companyId) to scope events
    // For now, we broadcast to all but include companyId in data
    io.emit(event, { ...data, companyId });
  }
};
