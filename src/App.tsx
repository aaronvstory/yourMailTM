import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AccountsGrid } from './components/AccountsGrid';
import { CreateAccountModal } from './components/CreateAccountModal';
import { MonitoringModal } from './components/MonitoringModal';
import { SettingsModal } from './components/SettingsModal';
import { NotificationCenter } from './components/NotificationCenter';
import { Inbox, Moon, Plus, Settings, Sun } from 'lucide-react';
import { useThemeStore } from './store/theme';
import { useAccountsStore } from './store/accounts';

const queryClient = new QueryClient();

function App() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMonitoringModalOpen, setIsMonitoringModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const { isDarkMode, toggleTheme } = useThemeStore();
  const accounts = useAccountsStore((state) => state.accounts);

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
          {/* Sidebar */}
          <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                <Inbox className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold dark:text-white">Mail Manager</h1>
              </div>
              <div className="flex items-center space-x-2">
                <NotificationCenter />
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            <nav className="space-y-2">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                <Plus className="w-4 h-4" />
                <span>New Account</span>
              </button>
              <button 
                onClick={() => setIsSettingsModalOpen(true)}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Email Accounts
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Manage your temporary email accounts
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <AccountsGrid
                  accounts={accounts}
                  onMonitoringClick={(account) => {
                    setSelectedAccount(account);
                    setIsMonitoringModalOpen(true);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <CreateAccountModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />

        {selectedAccount && (
          <MonitoringModal
            account={selectedAccount}
            isOpen={isMonitoringModalOpen}
            onClose={() => {
              setIsMonitoringModalOpen(false);
              setSelectedAccount(null);
            }}
          />
        )}

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />

        <Toaster position="top-right" />
      </div>
    </QueryClientProvider>
  );
}

export default App;