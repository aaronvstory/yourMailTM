import { AuditLog } from '../types/email';

class AuditService {
  private static instance: AuditService;
  private logs: AuditLog[] = [];

  private constructor() {}

  static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  async log(
    action: AuditLog['action'],
    accountId: string,
    details: Record<string, any>
  ) {
    const log: AuditLog = {
      action,
      accountId,
      timestamp: new Date(),
      details,
      ipAddress: await this.getIpAddress()
    };

    this.logs.unshift(log);
    this.persistLogs();
  }

  private async getIpAddress(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Failed to get IP address:', error);
      return 'unknown';
    }
  }

  private persistLogs() {
    try {
      localStorage.setItem('audit_logs', JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to persist audit logs:', error);
    }
  }

  getLogs(accountId?: string): AuditLog[] {
    return accountId
      ? this.logs.filter(log => log.accountId === accountId)
      : this.logs;
  }
}

export const auditService = AuditService.getInstance();