import { match } from 'ts-pattern';
import {
  LogIn,
  LogOut,
  User as UserIcon,
  Settings,
  FileSearch,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useGeneratorStore } from '../stores/useGeneratorStore';
import { openDrivePicker } from '../utils/picker-api';
import { env } from '@/env';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const API_KEY_STORAGE_KEY = 'gemini-api-key';

export const ConfigWidget = () => {
  const authStatus = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { login, logout } = useAuthStore((s) => s.actions);

  const templateId = useGeneratorStore((s) => s.templateId);
  const { setTemplateId } = useGeneratorStore((s) => s.actions);

  const [apiKey, setApiKey] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setApiKey(localStorage.getItem(API_KEY_STORAGE_KEY) || '');
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    setIsOpen(false);
  };

  const handleSelectTemplate = async () => {
    if (!accessToken) {
      alert(
        'Authentication missing. Please login again (Access Token not found).',
      );
      return;
    }

    if (!env.VITE_GOOGLE_API_KEY) {
      alert('API Key missing. VITE_GOOGLE_API_KEY is not set in .env');
      return;
    }

    const result = await openDrivePicker({
      accessToken,
      apiKey: env.VITE_GOOGLE_API_KEY,
    });

    if (result.isOk() && result.value) {
      setTemplateId(result.value.id);
    } else if (result.isErr()) {
      console.error(result.error);
      alert('Failed to pick file: ' + result.error.message);
    }
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div className="font-bold text-lg">GSlide AI Generator</div>

      <div className="flex items-center gap-4">
        {/* Template Selector (Only show when authenticated) */}
        {authStatus === 'authenticated' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 max-w-[150px] truncate">
              {templateId ? `Template: ${templateId}` : 'No Template Selected'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectTemplate}
              title="Select Template from Drive"
              className="gap-2"
            >
              <FileSearch size={16} />
              Select Template
            </Button>
          </div>
        )}

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" title="Settings">
              <Settings size={20} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="api-key"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Gemini API Key
                </label>
                <input
                  id="api-key"
                  type="password"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter your API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <Button onClick={handleSaveApiKey}>Save Configuration</Button>
            </div>
          </DialogContent>
        </Dialog>

        {match(authStatus)
          .with('authenticated', () => (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <UserIcon size={16} />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-medium leading-none">{user?.name}</span>
                  <span className="text-xs text-gray-500">{user?.email}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="gap-2"
              >
                <LogOut size={16} />
                Logout
              </Button>
            </div>
          ))
          .otherwise(() => (
            <Button onClick={() => login()} className="gap-2">
              <LogIn size={16} />
              Login with Google
            </Button>
          ))}
      </div>
    </div>
  );
};
