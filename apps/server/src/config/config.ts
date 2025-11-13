import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  httpPort: parseInt(process.env.HTTP_PORT || '3000', 10),
  
  mqtt: {
    port: parseInt(process.env.MQTT_PORT || '1883', 10),
    wsPort: parseInt(process.env.MQTT_WS_PORT || '8883', 10),
    broker: process.env.MQTT_BROKER || 'mqtt://localhost',
    clientPort: parseInt(process.env.MQTT_CLIENT_PORT || '1883', 10),
    username: process.env.MQTT_USERNAME || '',
    password: process.env.MQTT_PASSWORD || '',
  },
  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/scm',
  },
  
  logLevel: process.env.LOG_LEVEL || 'info',
  
  nodeEnv: process.env.NODE_ENV || 'development',
};
