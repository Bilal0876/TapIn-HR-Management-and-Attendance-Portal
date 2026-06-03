import { createServer } from 'http';
import { createApp } from './app';
import { config } from './config';
import { logger } from './lib/logger';
import { initSocket } from './lib/socket';
import { startMidnightSweep } from './jobs/midnightSweep';
import { checkinReminder, checkoutReminder } from './jobs/reminders';

const app = createApp();
const server = createServer(app);
const io = initSocket(server);

if (require.main === module) {
  server.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT} with Socket.io`);
    startMidnightSweep();
    checkinReminder.start();
    checkoutReminder.start();
  });
}

export default app;
