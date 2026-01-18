import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { useGeneratorStore } from './useGeneratorStore';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { ok, err } from 'neverthrow';
import * as driveApi from '../utils/drive-api';
import * as slideApi from '../utils/slide-api';
import { type PresentationManifest } from '../types';

// Mock dependencies
vi.mock('../utils/drive-api', () => ({
  copyPresentation: vi.fn(),
}));
vi.mock('../utils/slide-api', () => ({
  batchUpdatePresentation: vi.fn(),
}));

describe('useGeneratorStore', () => {
  beforeEach(() => {
    useGeneratorStore.setState({
      manifest: { presentationId: null, title: 'Test', slides: [] },
      isSyncing: false,
      templateId: null,
      error: null,
    });
    useAuthStore.setState({
      accessToken: 'test-token',
      status: 'authenticated',
    });
    vi.clearAllMocks();
  });

  const mockManifest: PresentationManifest = {
    presentationId: 'pres-1',
    title: 'Test Pres',
    slides: [],
  };

  it('should set manifest correctly', () => {
    useGeneratorStore.getState().actions.setManifest(mockManifest);
    expect(useGeneratorStore.getState().manifest).toEqual(mockManifest);
  });

  it('should set templateId', () => {
    useGeneratorStore.getState().actions.setTemplateId('temp-1');
    expect(useGeneratorStore.getState().templateId).toBe('temp-1');
  });

  describe('syncToSlides', () => {
    it('should create presentation if presentationId is null', async () => {
      useGeneratorStore.setState({ templateId: 'temp-1' });

      // Mock copyPresentation success
      (driveApi.copyPresentation as Mock).mockReturnValue(
        ok({ id: 'new-pres-id', name: 'Test' }),
      );

      // Mock batchUpdate success (though no slides to update yet)
      (slideApi.batchUpdatePresentation as Mock).mockReturnValue(ok(undefined));

      await useGeneratorStore.getState().actions.syncToSlides();

      expect(driveApi.copyPresentation).toHaveBeenCalledWith(
        'temp-1',
        'Test',
        'test-token',
      );
      expect(useGeneratorStore.getState().manifest.presentationId).toBe(
        'new-pres-id',
      );
      expect(useGeneratorStore.getState().isSyncing).toBe(false);
    });

    it('should handle API errors during creation', async () => {
      useGeneratorStore.setState({ templateId: 'temp-1' });
      (driveApi.copyPresentation as Mock).mockReturnValue(
        err(new Error('Copy Failed')),
      );

      await useGeneratorStore.getState().actions.syncToSlides();

      expect(useGeneratorStore.getState().error?.message).toBe('Copy Failed');
      expect(useGeneratorStore.getState().isSyncing).toBe(false);
    });

    // TODO: Add tests for slide updates when generateRequests is actualized
  });
});
