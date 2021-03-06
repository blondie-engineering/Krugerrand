import dotenv from 'dotenv';
import app from './app';
import logger from './logger';

const result = dotenv.config();
if (result.error) {
  dotenv.config({ path: '.env.default' });
}

app.listen(app.get('port'), (): void => {
  console.log('\x1b[36m%s\x1b[0m', // eslint-disable-line
    `🌏 Express server started at http://localhost:${app.get('port')}`);
  if (process.env.NODE_ENV === 'development') {
    console.log('\x1b[36m%s\x1b[0m', // eslint-disable-line
      `⚙️  Swagger UI hosted at http://localhost:${app.get('port')}/dev/api-docs`);
  }
});


// Close the Mongoose connection, when receiving SIGINT
process.on('SIGINT', () => {
  logger.info('Gracefully shutting down');
  process.exit(0);
});
