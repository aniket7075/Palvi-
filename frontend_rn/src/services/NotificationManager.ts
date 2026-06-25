import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';

export type UserRole = 'admin' | 'manager' | 'outlet';

class NotificationManager {
  /**
   * Request permission for notifications (required for iOS, recommended for Android 13+)
   */
  async requestUserPermission(): Promise<boolean> {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
    return enabled;
  }

  /**
   * Get the FCM token for this device
   */
  async getFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting FCM token', error);
      return null;
    }
  }

  /**
   * Initialize notification listeners (foreground and token refresh)
   */
  initialize() {
    this.requestUserPermission();

    // Listen to token refresh
    messaging().onTokenRefresh(token => {
      console.log('FCM Token refreshed:', token);
      // Here you would typically send the new token to your backend
    });

    // Handle messages while the app is in the foreground
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
      
      if (remoteMessage.notification) {
        Alert.alert(
          remoteMessage.notification.title || 'Notification',
          remoteMessage.notification.body || ''
        );
      }
    });

    return unsubscribe;
  }

  /**
   * Subscribe to a specific topic based on user role
   * Example: 'admin', 'manager', 'outlet_123'
   */
  async subscribeToRoleTopic(role: UserRole, outletId?: string) {
    try {
      let topic: string = role;
      if (role === 'outlet' && outletId) {
        topic = `outlet_${outletId}`;
      } else if (role === 'outlet') {
        // Fallback or generic outlet topic
        topic = 'outlets';
      }

      await messaging().subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`Failed to subscribe to topic`, error);
    }
  }

  /**
   * Unsubscribe from a role topic (e.g., on logout)
   */
  async unsubscribeFromRoleTopic(role: UserRole, outletId?: string) {
    try {
      let topic: string = role;
      if (role === 'outlet' && outletId) {
        topic = `outlet_${outletId}`;
      } else if (role === 'outlet') {
        topic = 'outlets';
      }

      await messaging().unsubscribeFromTopic(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`Failed to unsubscribe from topic`, error);
    }
  }
}

export default new NotificationManager();
