import { match } from 'ts-pattern';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

export const ConfigWidget = () => {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const { login, logout } = useAuthStore((s) => s.actions);

  return (
    <div className="flex items-center justify-between w-full">
      <div className="font-bold text-lg">GSlide AI Generator</div>

      <div className="flex items-center gap-4">
        {match(status)
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
