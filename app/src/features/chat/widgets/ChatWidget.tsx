import { useChatStore } from '../stores/useChatStore';
import { MessageList } from '../components/MessageList';
import { ChatInput } from '../components/ChatInput';

const LOCAL_STORAGE_API_KEY = 'gemini-api-key';

export const ChatWidget = () => {
  const messages = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);
  const error = useChatStore((s) => s.error);
  const { sendMessage } = useChatStore((s) => s.actions);

  const handleSend = (text: string) => {
    const apiKey = localStorage.getItem(LOCAL_STORAGE_API_KEY);
    if (!apiKey) {
      // In a real app, this should trigger a toast or open the config widget
      alert('Please set Gemini API Key in Settings (Config Widget).');
      return;
    }
    void sendMessage(text, apiKey);
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <MessageList messages={messages} isLoading={isLoading} />
      {error && (
        <div className="bg-destructive/10 p-2 text-destructive text-xs text-center border-t border-destructive/20">
          {error.message}
        </div>
      )}
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
};
