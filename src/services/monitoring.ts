import { MonitoringRule, EmailNotification } from '../types/email';
import { EventEmitter } from 'events';
import { emailApi } from '../lib/api';
import { notificationService } from './notifications';

class EmailMonitoringService extends EventEmitter {
  private static instance: EmailMonitoringService;
  private monitoringIntervals: Map<string, NodeJS.Timer> = new Map();
  private lastCheckedMessages: Map<string, Set<string>> = new Map();
  
  private constructor() {
    super();
    this.loadLastCheckedMessages();
  }

  static getInstance(): EmailMonitoringService {
    if (!EmailMonitoringService.instance) {
      EmailMonitoringService.instance = new EmailMonitoringService();
    }
    return EmailMonitoringService.instance;
  }

  private loadLastCheckedMessages() {
    try {
      const saved = localStorage.getItem('lastCheckedMessages');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.entries(parsed).forEach(([accountId, messages]) => {
          this.lastCheckedMessages.set(accountId, new Set(messages));
        });
      }
    } catch (error) {
      console.error('Failed to load last checked messages:', error);
    }
  }

  private saveLastCheckedMessages() {
    try {
      const toSave: Record<string, string[]> = {};
      this.lastCheckedMessages.forEach((messages, accountId) => {
        toSave[accountId] = Array.from(messages);
      });
      localStorage.setItem('lastCheckedMessages', JSON.stringify(toSave));
    } catch (error) {
      console.error('Failed to save last checked messages:', error);
    }
  }

  async startMonitoring(accountId: string, rule: MonitoringRule) {
    if (this.monitoringIntervals.has(accountId)) {
      this.stopMonitoring(accountId);
    }

    // Initialize last checked messages for this account
    if (!this.lastCheckedMessages.has(accountId)) {
      this.lastCheckedMessages.set(accountId, new Set());
    }

    const interval = setInterval(async () => {
      try {
        const messages = await this.checkNewMessages(accountId);
        const notifications = this.processMessages(messages, rule);
        
        if (notifications.length > 0) {
          notifications.forEach(notification => {
            notificationService.notify(notification, rule.notificationChannels);
          });
        }
      } catch (error) {
        console.error('Monitoring error:', error);
      }
    }, 30000); // Check every 30 seconds

    this.monitoringIntervals.set(accountId, interval);
  }

  stopMonitoring(accountId: string) {
    const interval = this.monitoringIntervals.get(accountId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(accountId);
    }
  }

  private async checkNewMessages(accountId: string): Promise<any[]> {
    try {
      const messages = await emailApi.getMessages(accountId);
      const lastChecked = this.lastCheckedMessages.get(accountId) || new Set();
      
      const newMessages = messages.filter(msg => !lastChecked.has(msg.id));
      
      // Update last checked messages
      newMessages.forEach(msg => lastChecked.add(msg.id));
      this.lastCheckedMessages.set(accountId, lastChecked);
      this.saveLastCheckedMessages();
      
      return newMessages;
    } catch (error) {
      console.error('Failed to check new messages:', error);
      return [];
    }
  }

  private processMessages(messages: any[], rule: MonitoringRule): EmailNotification[] {
    return messages
      .filter(msg => this.matchesRule(msg, rule))
      .map(msg => ({
        id: msg.id,
        accountId: rule.accountId,
        subject: msg.subject,
        receivedAt: new Date(msg.createdAt),
        matchedKeyword: this.findMatchedKeyword(msg, rule),
        isRead: false
      }));
  }

  private matchesRule(message: any, rule: MonitoringRule): boolean {
    const subject = rule.caseSensitive ? message.subject : message.subject.toLowerCase();
    const keywords = rule.caseSensitive ? rule.keywords : rule.keywords.map(k => k.toLowerCase());
    
    return keywords.some(keyword => subject.includes(keyword));
  }

  private findMatchedKeyword(message: any, rule: MonitoringRule): string {
    const subject = rule.caseSensitive ? message.subject : message.subject.toLowerCase();
    const keywords = rule.caseSensitive ? rule.keywords : rule.keywords.map(k => k.toLowerCase());
    
    return keywords.find(keyword => subject.includes(keyword)) || '';
  }
}

export const monitoringService = EmailMonitoringService.getInstance();