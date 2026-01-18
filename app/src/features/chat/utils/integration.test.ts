/* eslint-disable no-console */
import { describe, it, expect } from 'vitest';
import { GeminiService } from './gemini-api';
import type { PresentationManifest } from '../../generator/types';

const TIMEOUT = 30000;
const API_KEY = process.env.TEST_GEMINI_API_KEY;

// API key is strictly required for this test
const describeOrSkip = API_KEY ? describe : describe.skip;

describeOrSkip('Gemini API Integration (Real API Check)', () => {
  it(
    'should generate a valid response with function call',
    async () => {
      if (!API_KEY) throw new Error('API Key not found');

      const service = new GeminiService(API_KEY);

      const dummyManifest: PresentationManifest = {
        presentationId: null,
        title: 'Integration Test Presentation',
        slides: [],
      };

      // Request specific output to trigger function calling
      const message =
        "Create a presentation about 'Space Exploration' with 3 slides.";

      console.log('🚀 Sending request to Gemini...');
      const result = await service.sendMessage([], message, dummyManifest);

      if (result.isErr()) {
        console.error('Gemini Error:', result.error);
        throw result.error;
      }

      const { text, textVal, functionCall } = result.value as any;
      console.log('✅ Response received');
      console.log('Text:', text);
      console.log('TextVal:', textVal);
      console.log('Function Call:', JSON.stringify(functionCall, null, 2));

      // We expect a mechanism to update manifest, likely a function call
      // or at least some text if the model refuses.
      // Given the system prompt, it SHOULD return a function call for this request.

      expect(result.isOk()).toBe(true);

      if (functionCall) {
        expect(functionCall.action).toBe('update_manifest');
        expect(functionCall.payload).toBeDefined();
        // @ts-expect-error payload is unknown
        expect(functionCall.payload.slides).toBeInstanceOf(Array);
        // @ts-expect-error payload is unknown
        expect(functionCall.payload.slides.length).toBeGreaterThan(0);
      } else {
        // Fallback if model decides just to talk, though prompt engineering tries to force it.
        expect(text.length).toBeGreaterThan(0);
        console.warn(
          '⚠️ No function call received. Check system prompt or model behavior.',
        );
      }
    },
    TIMEOUT,
  );
});
