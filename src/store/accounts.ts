import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { EmailAccount, MonitoringRule } from '../types/email';

interface AccountsState {
  accounts: EmailAccount[];
  monitoringRules: MonitoringRule[];
  addAccount: (account: EmailAccount) => void;
  updateAccount: (id: string, updates: Partial<EmailAccount>) => void;
  deleteAccount: (id: string) => void;
  addMonitoringRule: (rule: MonitoringRule) => void;
  updateMonitoringRule: (accountId: string, updates: Partial<MonitoringRule>) => void;
  deleteMonitoringRule: (accountId: string) => void;
}

export const useAccountsStore = create<AccountsState>()(
  persist(
    (set) => ({
      accounts: [],
      monitoringRules: [],
      addAccount: (account) =>
        set((state) => ({ accounts: [...state.accounts, account] })),
      updateAccount: (id, updates) =>
        set((state) => ({
          accounts: state.accounts.map((account) =>
            account.id === id ? { ...account, ...updates } : account
          ),
        })),
      deleteAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((account) => account.id !== id),
          monitoringRules: state.monitoringRules.filter((rule) => rule.accountId !== id),
        })),
      addMonitoringRule: (rule) =>
        set((state) => ({ monitoringRules: [...state.monitoringRules, rule] })),
      updateMonitoringRule: (accountId, updates) =>
        set((state) => ({
          monitoringRules: state.monitoringRules.map((rule) =>
            rule.accountId === accountId ? { ...rule, ...updates } : rule
          ),
        })),
      deleteMonitoringRule: (accountId) =>
        set((state) => ({
          monitoringRules: state.monitoringRules.filter(
            (rule) => rule.accountId !== accountId
          ),
        })),
    }),
    {
      name: 'accounts-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accounts: state.accounts,
        monitoringRules: state.monitoringRules,
      }),
    }
  )
);