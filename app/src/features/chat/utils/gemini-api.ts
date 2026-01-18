import { GoogleGenAI, type Content, type Tool } from '@google/genai';
import { ResultAsync } from 'neverthrow';
import type { PresentationManifest } from '../../generator/types';

// TODO: Move to env.ts or similar if needed, but for now assuming implementation specific logic here or passed in.
// Actually, API Key comes from ConfigWidget (local storage), so we will pass it to the service.

const SYSTEM_INSTRUCTION = `
You are an expert Google Slides designer and architect.
Your goal is to help users create or modify slide presentations by generating a structured manifest.
You must NOT generate visual images directly. Instead, you manipulate the JSON structure of the presentation.

Rules:
1. Always maintain the context of the current presentation manifest.
2. When the user asks to create or modify slides, respond with a function call to 'update_manifest'.
3. The 'update_manifest' payload must constitute the FULL or PARTIAL updates to the 'slides' array or 'title'.
4. Available templates (templateId): 'layout_title', 'layout_bullet', 'layout_comparison'.
5. If the user asks for more slides, APPEND them to the existing list unless instructed to replace.
6. Be concise in your text response.
`;

const TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: 'update_manifest',
        description:
          'Update the presentation manifest with new slides or title.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: {
              type: 'STRING',
              description: 'The title of the presentation.',
            },
            slides: {
              type: 'ARRAY',
              description: 'List of slides to add or update.',
              items: {
                type: 'OBJECT',
                properties: {
                  id: {
                    type: 'STRING',
                    description: 'Unique ID for the slide (UUID).',
                  },
                  templateId: {
                    type: 'STRING',
                    description:
                      'Layout template ID (e.g., layout_title, layout_bullet)',
                  },
                  content: {
                    type: 'OBJECT',
                    description: 'Content of the slide (title, body).',
                    properties: {
                      title: { type: 'STRING' },
                      body: {
                        type: 'ARRAY',
                        items: { type: 'STRING' },
                      },
                    },
                    required: ['title'],
                  },
                },
                required: ['id', 'templateId', 'content'],
              },
            },
          },
        },
      },
    ],
  },
];

type SendMessageParams = {
  apiKey: string;
  history: Content[];
  message: string;
  currentManifest: PresentationManifest;
};

export const sendMessage = ({
  apiKey,
  history,
  message,
  currentManifest,
}: SendMessageParams): ResultAsync<
  { text: string; functionCall?: unknown },
  Error
> => {
  // Inject current manifest context.
  const contextRequest = `
      [Current Manifest Context]
      Title: ${currentManifest.title}
      Slides Count: ${currentManifest.slides.length}
      Slides: ${JSON.stringify(currentManifest.slides.map((s) => ({ id: s.id, templateId: s.templateId, title: s.content.title })))}
      
      User Request: ${message}
    `;

  return ResultAsync.fromPromise(
    (async () => {
      const client = new GoogleGenAI({ apiKey });
      const chat = client.chats.create({
        model: 'gemini-2.0-flash-exp', // Updated model
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: TOOLS,
          temperature: 0.7,
        },
        history: history,
      });

      const result = await chat.sendMessage({
        message: contextRequest,
      });

      const textOutput = result.text || '';

      // Handle function calls
      const functionCalls = result.functionCalls; // Getter
      let functionCallData = undefined;

      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        if (call.name === 'update_manifest') {
          functionCallData = {
            action: 'update_manifest',
            payload: call.args,
          };
        }
      }

      return {
        text: textOutput,
        functionCall: functionCallData,
      };
    })(),
    (e) => (e instanceof Error ? e : new Error(String(e))),
  );
};
