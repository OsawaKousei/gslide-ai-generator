export type TemplateId =
  | 'layout_title'
  | 'layout_bullet'
  | 'layout_comparison'
  | string;

export type SlideNode = {
  readonly id: string; // UUID (React key用)
  readonly objectId?: string; // Google Slides上のPage ID (同期後に付与)
  readonly templateId: TemplateId;
  readonly content: {
    readonly title: string;
    readonly body?: readonly string[]; // Immutable array
    readonly [key: string]: unknown;
  };
  readonly status: 'pending' | 'synced' | 'dirty'; // 同期状態管理
};

export type PresentationManifest = {
  readonly presentationId: string | null; // Google Slides ID
  readonly title: string;
  readonly slides: readonly SlideNode[];
};
