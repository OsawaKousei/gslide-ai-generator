import type { PresentationManifest } from '../../generator/types';

export type FunctionCallAction =
  | 'create_slides'
  | 'update_slide' // This might be handled by update_manifest broadly or specific update
  | 'update_manifest' // More generic as per spec example
  | 'change_template';

export type FunctionCall = {
  readonly action: FunctionCallAction;
  readonly payload: unknown;
};

export type ChatMessage = {
  readonly id: string;
  readonly role: 'user' | 'model' | 'system';
  readonly content: string;
  readonly functionCall?: FunctionCall;
  readonly timestamp: number;
};

export type ChatState = {
  readonly messages: readonly ChatMessage[];
  readonly isLoading: boolean;
  readonly error: Error | null;
};
