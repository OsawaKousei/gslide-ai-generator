import { PreviewWidget } from '../widgets/PreviewWidget';
import { TemplateUploaderWidget } from '../widgets/TemplateUploaderWidget';
import { ChatWidget } from '@/features/chat';

export const GeneratorPageWidget = () => {
  return (
    <div className="flex h-full w-full bg-gray-50 flex-1 overflow-hidden">
      {/* [Left Pane] Preview Area (50% width) */}
      <section className="w-1/2 h-full border-r border-gray-200 bg-white">
        <PreviewWidget />
      </section>

      {/* [Right Pane] Control & Interaction (50% width) */}
      <section className="flex flex-col w-1/2 h-full">
        {/* [Right Top] Template Configuration */}
        <div className="flex-none bg-white z-10">
          <TemplateUploaderWidget />
        </div>

        {/* [Right Center/Bottom] Chat Area (Flex Grow) */}
        <main className="flex-1 overflow-hidden relative">
          <ChatWidget />
        </main>
      </section>
    </div>
  );
};
