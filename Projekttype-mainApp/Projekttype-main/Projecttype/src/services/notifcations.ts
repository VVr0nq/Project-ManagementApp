import { BehaviorSubject, Observable } from "rxjs";
import { Notification } from "../models/notificationss";

export class NotificationService {
  private notifications: Notification[] = [];
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  send(notification: Notification) {
    this.notifications.push(notification);
    this.notificationsSubject.next([...this.notifications]);
    this.updateUnreadCount();
  }

  list(): Observable<Notification[]> {
    return this.notificationsSubject.asObservable();
  }

  unreadCount(): Observable<number> {
    return this.unreadCountSubject.asObservable();
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notificationsSubject.next([...this.notifications]);
      this.updateUnreadCount();
    }
  }

  private updateUnreadCount() {
    const unreadCount = this.notifications.filter(notification => !notification.read).length;
    this.unreadCountSubject.next(unreadCount);
  }
}