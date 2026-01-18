import { match } from 'ts-pattern';
import { Loader2, AlertCircle } from 'lucide-react';
import { useGeneratorStore } from '../stores/useGeneratorStore';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { Card } from '@/components/ui/card';

export const PreviewWidget = () => {
  const presentationId = useGeneratorStore((s) => s.manifest.presentationId);
  const isSyncing = useGeneratorStore((s) => s.isSyncing);
  const error = useGeneratorStore((s) => s.error);
  const user = useAuthStore((s) => s.user);

  if (error) {
    return (
      <div className="h-full w-full p-4">
        <Card className="flex h-full w-full flex-col items-center justify-center bg-red-50 text-red-600 gap-4 p-6">
          <AlertCircle size={48} />
          <div className="text-center">
            <p className="text-lg font-bold">Sync Error</p>
            <p className="text-sm">{error.message}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-4 relative">
      {isSyncing && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="text-sm font-medium text-blue-600">
              Syncing with Google Slides...
            </span>
          </div>
        </div>
      )}
      {match(presentationId)
        .with(null, () => (
          <Card className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
            <div>
              <p className="text-lg font-semibold">Ready to Generate</p>
              <p className="text-sm">
                Chat with AI to create your first slide.
              </p>
            </div>
          </Card>
        ))
        .otherwise((id) => {
          const authUserParam = user?.email ? `&authuser=${user.email}` : '';
          const embedUrl = `https://docs.google.com/presentation/d/${id}/embed?rm=minimal&start=false&loop=false${authUserParam}`;

          return (
            <iframe
              src={embedUrl}
              title="Google Slides Preview"
              className="h-full w-full rounded shadow-sm border-0"
              allowFullScreen
            />
          );
        })}
    </div>
  );
};
