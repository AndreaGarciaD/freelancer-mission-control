import app from './app';
import { config } from './config/env';
import { testDbConnection } from './db/connections';

const PORT = config.port;

const start = async (): Promise<void> => {
    await testDbConnection();

    app.listen(PORT, () => {
        console.log(`Server is running in ${config.nodeEnv} mode, on port ${PORT}`);
    });
}

start();
