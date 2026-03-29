import 'dotenv/config';
import { buildApp } from './app';

const PORT = parseInt(process.env['PORT'] ?? '3000', 10);
const HOST = process.env['HOST'] ?? '0.0.0.0';

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Server listening on http://${HOST}:${PORT}`);
    app.log.info(`Health check: http://localhost:${PORT}/health`);

    if (process.env['NODE_ENV'] !== 'production') {
      app.log.info(`API docs: http://localhost:${PORT}/docs`);
    }
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown — close the already-running instance, do NOT call buildApp() again.
  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, shutting down gracefully...`);
    try {
      await app.close();
      process.exit(0);
    } catch (shutdownErr) {
      app.log.error(shutdownErr, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
