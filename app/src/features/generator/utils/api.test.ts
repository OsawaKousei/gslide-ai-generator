import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from 'vitest';
import { copyPresentation } from './drive-api';
import { batchUpdatePresentation } from './slide-api';

const createFetchResponse = (data: unknown, ok = true) => {
  return {
    ok,
    status: ok ? 200 : 500,
    statusText: ok ? 'OK' : 'Internal Server Error',
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(ok ? '' : 'Error Message'),
  };
};

describe('API Utils', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('copyPresentation', () => {
    it('should return DriveFile on success', async () => {
      const mockResponse = { id: 'file-123', name: 'New Presentation' };
      (global.fetch as Mock).mockResolvedValue(
        createFetchResponse(mockResponse),
      );

      const result = await copyPresentation('temp-id', 'Title', 'token');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(mockResponse);
      }
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('files/temp-id/copy'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Title' }),
        }),
      );
    });

    it('should handle API validation errors (zod)', async () => {
      const mockResponse = { id: 123 }; // Invalid type for ID
      (global.fetch as Mock).mockResolvedValue(
        createFetchResponse(mockResponse),
      );

      const result = await copyPresentation('temp-id', 'Title', 'token');

      expect(result.isErr()).toBe(true);
    });
  });

  describe('batchUpdatePresentation', () => {
    it('should return ok on success', async () => {
      const mockResponse = { presentationId: '123', replies: [] };
      (global.fetch as Mock).mockResolvedValue(
        createFetchResponse(mockResponse),
      );

      const result = await batchUpdatePresentation(
        'pres-id',
        [{ foo: 'bar' }],
        'token',
      );

      expect(result.isOk()).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('pres-id:batchUpdate'),
        expect.anything(),
      );
    });
  });
});
