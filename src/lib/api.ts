import axios from 'axios';
import { EmailAccount } from '../types/email';

class MailTmAPI {
  private static instance = axios.create({
    baseURL: 'https://api.mail.tm',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  private static cachedDomain: string | null = null;
  private static readonly PASSWORD = 'TempMail2024!';

  private static async getDomain(): Promise<string> {
    if (this.cachedDomain) {
      return this.cachedDomain;
    }

    try {
      const response = await this.instance.get('/domains');
      const domains = response.data['hydra:member'];
      
      if (!domains?.length) {
        throw new Error('No available domains found');
      }

      this.cachedDomain = domains[0].domain;
      return this.cachedDomain;
    } catch (error: any) {
      console.error('Failed to fetch domains:', error.response?.data || error.message);
      throw new Error('Unable to get available email domains');
    }
  }

  private static generateUsername(firstName: string, lastName: string): string {
    const randomNum = Math.floor(Math.random() * 90 + 10); // 10-99
    return `${firstName.toLowerCase()[0]}${lastName.toLowerCase()}${randomNum}`;
  }

  private static async getToken(email: string, password: string): Promise<string> {
    try {
      const response = await this.instance.post('/token', {
        address: email,
        password: password,
      });

      if (!response.data?.token) {
        throw new Error('No token received');
      }

      return response.data.token;
    } catch (error: any) {
      console.error('Authentication error:', error.response?.data || error);
      throw new Error('Authentication failed');
    }
  }

  static async createAccount(firstName: string, lastName: string): Promise<EmailAccount> {
    try {
      const domain = await this.getDomain();
      const username = this.generateUsername(firstName, lastName);
      const email = `${username}@${domain}`;

      // Create account
      const accountResponse = await this.instance.post('/accounts', {
        address: email,
        password: this.PASSWORD,
      });

      if (!accountResponse.data?.id) {
        throw new Error('Invalid response from server');
      }

      // Get authentication token
      const token = await this.getToken(email, this.PASSWORD);
      
      // Store token for future requests
      localStorage.setItem(`token_${accountResponse.data.id}`, token);
      localStorage.setItem(`email_${accountResponse.data.id}`, email);

      return {
        id: accountResponse.data.id,
        firstName,
        lastName,
        email,
        password: this.PASSWORD,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        lastEmailAt: new Date(),
        status: 'active',
        monitoringEnabled: false,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.['hydra:description'] 
        || error.response?.data?.message 
        || error.message 
        || 'Failed to create account';
      
      console.error('Account creation error:', error.response?.data || error);
      throw new Error(errorMessage);
    }
  }

  static async getMessages(accountId: string): Promise<any[]> {
    try {
      const token = localStorage.getItem(`token_${accountId}`);
      if (!token) {
        // Try to refresh token
        const email = localStorage.getItem(`email_${accountId}`);
        if (!email) {
          throw new Error('Account credentials not found');
        }
        const newToken = await this.getToken(email, this.PASSWORD);
        localStorage.setItem(`token_${accountId}`, newToken);
      }

      const response = await this.instance.get('/messages', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data['hydra:member'];
    } catch (error: any) {
      console.error('Failed to fetch messages:', error.response?.data || error);
      throw new Error('Unable to fetch messages');
    }
  }

  static async deleteAccount(accountId: string): Promise<void> {
    try {
      const token = localStorage.getItem(`token_${accountId}`);
      const email = localStorage.getItem(`email_${accountId}`);

      if (!token || !email) {
        // Try to get a new token
        if (!email) {
          throw new Error('Account email not found');
        }
        const newToken = await this.getToken(email, this.PASSWORD);
        localStorage.setItem(`token_${accountId}`, newToken);
      }

      await this.instance.delete(`/accounts/${accountId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Clean up local storage
      localStorage.removeItem(`token_${accountId}`);
      localStorage.removeItem(`email_${accountId}`);
    } catch (error: any) {
      console.error('Failed to delete account:', error.response?.data || error);
      if (error.response?.status === 404) {
        // Account already deleted or doesn't exist
        localStorage.removeItem(`token_${accountId}`);
        localStorage.removeItem(`email_${accountId}`);
        return;
      }
      throw new Error('Unable to delete account. Please try again.');
    }
  }

  static async getMessage(accountId: string, messageId: string): Promise<any> {
    try {
      const token = localStorage.getItem(`token_${accountId}`);
      if (!token) {
        const email = localStorage.getItem(`email_${accountId}`);
        if (!email) {
          throw new Error('Account credentials not found');
        }
        const newToken = await this.getToken(email, this.PASSWORD);
        localStorage.setItem(`token_${accountId}`, newToken);
      }

      const response = await this.instance.get(`/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch message:', error.response?.data || error);
      throw new Error('Unable to fetch message');
    }
  }
}

export const emailApi = {
  createAccount: MailTmAPI.createAccount.bind(MailTmAPI),
  getMessages: MailTmAPI.getMessages.bind(MailTmAPI),
  deleteAccount: MailTmAPI.deleteAccount.bind(MailTmAPI),
  getMessage: MailTmAPI.getMessage.bind(MailTmAPI),
};