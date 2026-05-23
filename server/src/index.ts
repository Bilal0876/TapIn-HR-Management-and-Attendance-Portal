import { createApp } from './app';
import { config } from './config';
import { logger } from './lib/logger';
import { startMidnightSweep } from './jobs/midnightSweep';

const app = createApp();

if (require.main === module) {
  app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`);
    startMidnightSweep();
  });
}

export default app;
