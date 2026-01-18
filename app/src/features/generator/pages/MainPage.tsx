import { PreviewWidget } from '../widgets/PreviewWidget';
import { ConfigWidget } from '../widgets/ConfigWidget';
import { ChatWidget } from '../widgets/ChatWidget';

export const MainPage = () => {
  return (
    <div className="flex h-screen w-screen bg-gray-50">
      {/* [Left Pane] Preview Area (50% width) */}
      <section className="w-1/2 h-full border-r border-gray-200 bg-white">
        <PreviewWidget />
      </section>

      {/* [Right Pane] Control & Interaction (50% width) */}
      <section className="flex flex-col w-1/2 h-full">
        {/* [Right Top] Config Area (Fixed Height) */}
        <header className="h-auto p-4 border-b border-gray-200 bg-white/50 backdrop-blur">
          <ConfigWidget />
        </header>

        {/* [Right Center/Bottom] Chat Area (Flex Grow) */}
        <main className="flex-1 overflow-hidden relative">
          <ChatWidget />
        </main>
      </section>
    </div>
  );
};
