import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const schema = z.object({
  autoDeleteAfterDays: z.number().min(1).max(30),
  defaultNotificationChannels: z.array(z.enum(['web', 'desktop', 'sound'])),
  enableAutoRefresh: z.boolean(),
  refreshInterval: z.number().min(30).max(300),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      autoDeleteAfterDays: 7,
      defaultNotificationChannels: ['web'],
      enableAutoRefresh: true,
      refreshInterval: 60,
    },
  });

  const onSubmit = (data: FormData) => {
    // Save settings to localStorage
    localStorage.setItem('mailTmSettings', JSON.stringify(data));
    toast.success('Settings saved successfully');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[480px]">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Settings</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Auto-delete accounts after (days)
            </label>
            <input
              type="number"
              {...register('autoDeleteAfterDays', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {errors.autoDeleteAfterDays && (
              <p className="mt-1 text-sm text-red-600">{errors.autoDeleteAfterDays.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Notification Channels
            </label>
            <div className="space-y-2">
              {['web', 'desktop', 'sound'].map((channel) => (
                <div key={channel} className="flex items-center">
                  <input
                    type="checkbox"
                    value={channel}
                    {...register('defaultNotificationChannels')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    {channel.charAt(0).toUpperCase() + channel.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              {...register('enableAutoRefresh')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Enable auto-refresh
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Refresh interval (seconds)
            </label>
            <input
              type="number"
              {...register('refreshInterval', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {errors.refreshInterval && (
              <p className="mt-1 text-sm text-red-600">{errors.refreshInterval.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
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
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}