import { EmailNotification } from '../types/email';

class NotificationService {
  private static instance: NotificationService;
  private notifications: EmailNotification[] = [];

  private constructor() {
    this.setupNotifications();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private setupNotifications() {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }

  async notify(notification: EmailNotification, channels: ('web' | 'desktop' | 'sound')[]) {
    this.notifications.unshift(notification);

    channels.forEach(channel => {
      switch (channel) {
        case 'desktop':
          this.showDesktopNotification(notification);
          break;
        case 'sound':
          this.playNotificationSound();
          break;
        case 'web':
          this.showWebNotification(notification);
          break;
      }
    });
  }

  private showDesktopNotification(notification: EmailNotification) {
    if (Notification.permission === 'granted') {
      new Notification('New Email Received', {
        body: `Subject: ${notification.subject}\nMatched keyword: ${notification.matchedKeyword}`,
        icon: '/notification-icon.png'
      });
    }
  }

  private playNotificationSound() {
    const audio = new Audio('/notification-sound.mp3');
    audio.play().catch(console.error);
  }

  private showWebNotification(notification: EmailNotification) {
    // Implementation will use the toast system already set up
    // This will be connected in the next update
  }

  getNotifications(): EmailNotification[] {
    return this.notifications;
  }

  markAsRead(notificationId: string) {
    this.notifications = this.notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification
    );
  }
}

export const notificationService = NotificationService.getInstance();