import { Upload, Loader2, FileType } from 'lucide-react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useNotificationActions } from '@/features/global-notification';
import { useGeneratorStore } from '../stores/useGeneratorStore';
import { uploadPresentation } from '../utils/drive-api';

export const TemplateUploaderWidget = () => {
  const authStatus = useAuthStore((s) => s.status);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { showToast } = useNotificationActions();

  const templateId = useGeneratorStore((s) => s.templateId);
  const { setTemplateId } = useGeneratorStore((s) => s.actions);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;

    if (
      !file.name.endsWith('.pptx') &&
      file.type !==
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ) {
      showToast({
        type: 'error',
        title: 'Invalid File',
        message: 'Please upload a PowerPoint (.pptx) file.',
        position: 'top-right',
      });
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadPresentation({
        file,
        accessToken,
      });

      if (result.isOk()) {
        setTemplateId(result.value.id);
        showToast({
          type: 'success',
          title: 'Upload Complete',
          message: `Template uploaded: ${result.value.name}`,
          position: 'top-right',
        });
      } else {
        console.error(result.error);
        showToast({
          type: 'error',
          title: 'Upload Failed',
          message: result.error.message,
          position: 'top-right',
        });
      }
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 認証していない場合は何も表示しない、またはログインを促す（今回はログインはヘッダーにあるので非表示かDisabled）
  if (authStatus !== 'authenticated') {
    return null;
  }

  return (
    <div className="w-full p-4 border-b border-gray-200 bg-white">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        onChange={handleFileChange}
      />

      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
            <FileType size={20} />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Current Template
            </span>
            <span
              className="text-sm font-medium text-gray-900 truncate"
              title={templateId || 'No Template Selected'}
            >
              {templateId ? templateId : 'Default (Blank)'}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          disabled={isUploading}
          className="gap-2 shrink-0"
        >
          {isUploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          {isUploading ? 'Uploading...' : 'Change Template'}
        </Button>
      </div>
    </div>
  );
};
