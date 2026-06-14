export type NotificationType = 'activity_assigned' | 'reminder' | 'report' | 'system';

export type AppNotification = {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  activityId?: string | null;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationsResponse = {
  success: boolean;
  unreadCount: number;
  notifications: AppNotification[];
};
