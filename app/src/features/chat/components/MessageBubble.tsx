import { cn } from '@/lib/utils';
import type { ChatMessage } from '../types';

type MessageBubbleProps = {
  readonly message: ChatMessage;
};

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex w-full mb-4',
        isUser ? 'justify-end' : 'justify-start',
      )}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-lg px-4 py-2 text-sm',
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-800 rounded-bl-none',
        )}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        {message.functionCall && (
          <div className="mt-2 text-xs text-gray-500 italic border-t border-gray-300 pt-1">
            Action: {message.functionCall.action}
          </div>
        )}
      </div>
    </div>
  );
};
