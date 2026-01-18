import { useState, type FormEvent } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ChatInputProps = {
  readonly onSend: (text: string) => void;
  readonly isLoading: boolean;
};

export const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center p-2 border-t bg-white gap-2"
    >
      <Button variant="ghost" size="icon" type="button" disabled={isLoading}>
        <Paperclip className="h-5 w-5 text-gray-400" />
      </Button>
      <input
        className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50"
        placeholder="Describe the presentation you want..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
      />
      <Button
        type="submit"
        size="icon"
        className="rounded-full"
        disabled={!input.trim() || isLoading}
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};
