export enum NotificationType {
  INFO = 'info',     // canada-goose-small
  WARNING = 'warning', // canada-goose-medium
  ALERT = 'alert'    // bear-large
}

class NotificationService {
  private sounds = {
    [NotificationType.INFO]: new Audio(chrome.runtime.getURL('assets/sounds/canada-goose-small.mp3')),
    [NotificationType.WARNING]: new Audio(chrome.runtime.getURL('assets/sounds/canada-goose-medium.mp3')),
    [NotificationType.ALERT]: new Audio(chrome.runtime.getURL('assets/sounds/bear-large.mp3'))
  };

  async show(
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO
  ) {
    // Play sound effect
    await this.sounds[type].play();

    // Show Chrome notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('assets/icons/logo_art_and_app_name_large.jpg'),
      title,
      message,
      priority: type === NotificationType.ALERT ? 2 : 1
    });
  }
}

export const notificationService = new NotificationService(); 