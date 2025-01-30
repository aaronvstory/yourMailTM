import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { EmailAccount } from '../types/email';
import { Badge } from './ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Mail, Settings, Trash2 } from 'lucide-react';
import { emailApi } from '../lib/api';
import { useAccountsStore } from '../store/accounts';
import { toast } from 'sonner';

const columnHelper = createColumnHelper<EmailAccount>();

interface AccountsGridProps {
  accounts: EmailAccount[];
  onMonitoringClick: (account: EmailAccount) => void;
}

export function AccountsGrid({ accounts, onMonitoringClick }: AccountsGridProps) {
  const [deletingAccounts, setDeletingAccounts] = useState<Set<string>>(new Set());
  const deleteAccount = useAccountsStore((state) => state.deleteAccount);

  const handleDeleteAccount = async (account: EmailAccount) => {
    try {
      setDeletingAccounts(prev => new Set(prev).add(account.id));
      await emailApi.deleteAccount(account.id);
      deleteAccount(account.id);
      toast.success('Account deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setDeletingAccounts(prev => {
        const newSet = new Set(prev);
        newSet.delete(account.id);
        return newSet;
      });
    }
  };

  const columns = [
    columnHelper.accessor('email', {
      header: 'Email Address',
      cell: (info) => (
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-gray-500" />
          <span>{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <Badge variant={info.getValue() === 'active' ? 'success' : 'error'}>
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('lastEmailAt', {
      header: 'Last Email',
      cell: (info) => formatDistanceToNow(info.getValue(), { addSuffix: true }),
    }),
    columnHelper.accessor('monitoringEnabled', {
      header: 'Monitoring',
      cell: (info) => (
        <Badge variant={info.getValue() ? 'success' : 'neutral'}>
          {info.getValue() ? 'Enabled' : 'Disabled'}
        </Badge>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onMonitoringClick(info.row.original)}
            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
            title="Monitoring Settings"
            disabled={deletingAccounts.has(info.row.original.id)}
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteAccount(info.row.original)}
            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
            title="Delete Account"
            disabled={deletingAccounts.has(info.row.original.id)}
          >
            {deletingAccounts.has(info.row.original.id) ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: accounts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}