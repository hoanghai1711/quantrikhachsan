import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { getToken } from '../api/auth';
import { NotificationItem } from '../types/notification';

const hubUrl = '/notificationHub';
let connection: HubConnection | null = null;

const createConnection = (): HubConnection =>
  new HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => getToken() ?? '',
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

export const signalrService = {
  start: async (): Promise<void> => {
    if (!connection) {
      connection = createConnection();
    }

    if (connection.state === HubConnectionState.Disconnected) {
      await connection.start();
    }
  },

  stop: async (): Promise<void> => {
    if (connection && connection.state !== HubConnectionState.Disconnected) {
      await connection.stop();
    }
    connection = null;
  },

  onNotification: (handler: (notification: NotificationItem) => void): void => {
    if (!connection) return;
    connection.on('ReceiveNotification', handler);
  },

  offNotification: (handler: (notification: NotificationItem) => void): void => {
    if (!connection) return;
    connection.off('ReceiveNotification', handler);
  },
};
