export interface EmailAccount {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdAt: Date;
  lastLoginAt: Date;
  lastEmailAt: Date;
  status: 'active' | 'inactive';
  monitoringEnabled: boolean;
}

export interface MonitoringRule {
  accountId: string;
  keywords: string[];
  caseSensitive: boolean;
  enabled: boolean;
  notificationChannels: ('web' | 'desktop' | 'sound')[];
}

export interface EmailNotification {
  id: string;
  accountId: string;
  subject: string;
  receivedAt: Date;
  matchedKeyword: string;
  isRead: boolean;
}

export interface AuditLog {
  action: 'create' | 'delete' | 'monitor' | 'login';
  accountId: string;
  timestamp: Date;
  details: Record<string, any>;
  ipAddress: string;
}