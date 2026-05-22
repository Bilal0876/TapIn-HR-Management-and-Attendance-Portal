import { createApp } from './app';
import { config } from './config';
import { logger } from './lib/logger';

const app = createApp();

if (require.main === module) {
  app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`);
  });
}

export default app;
