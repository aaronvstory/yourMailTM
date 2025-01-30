import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAccountsStore } from '../store/accounts';
import { EmailAccount } from '../types/email';

const schema = z.object({
  keywords: z.string().min(1),
  caseSensitive: z.boolean(),
  notificationChannels: z.array(z.enum(['web', 'desktop', 'sound'])),
});

type FormData = z.infer<typeof schema>;

interface Props {
  account: EmailAccount;
  isOpen: boolean;
  onClose: () => void;
}

export function MonitoringModal({ account, isOpen, onClose }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      caseSensitive: false,
      notificationChannels: ['web'],
    },
  });
  const addMonitoringRule = useAccountsStore((state) => state.addMonitoringRule);

  const onSubmit = (data: FormData) => {
    addMonitoringRule({
      accountId: account.id,
      keywords: data.keywords.split(',').map((k) => k.trim()),
      caseSensitive: data.caseSensitive,
      enabled: true,
      notificationChannels: data.notificationChannels,
    });
    toast.success('Monitoring rule added');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Set Up Monitoring</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Keywords (comma-separated)
            </label>
            <input
              {...register('keywords')}
              placeholder="urgent, invoice, payment"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {errors.keywords && (
              <p className="mt-1 text-sm text-red-600">{errors.keywords.message}</p>
            )}
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('caseSensitive')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Case sensitive
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notification Channels
            </label>
            <div className="space-y-2">
              {['web', 'desktop', 'sound'].map((channel) => (
                <div key={channel} className="flex items-center">
                  <input
                    type="checkbox"
                    value={channel}
                    {...register('notificationChannels')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    {channel.charAt(0).toUpperCase() + channel.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}