import { match } from 'ts-pattern';
import { useGeneratorStore } from '../stores/useGeneratorStore';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { Card } from '@/components/ui/card';

export const PreviewWidget = () => {
  const presentationId = useGeneratorStore((s) => s.manifest.presentationId);
  const user = useAuthStore((s) => s.user);

  return (
    <div className="h-full w-full p-4">
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
