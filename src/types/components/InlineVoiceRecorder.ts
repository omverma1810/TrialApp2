export interface InlineVoiceRecorderProps {
  plotNumber: string;
  fieldName: string;
  onUpload: (data: {
    audioBase64: string;
    fileName: string;
    duration: number;
    mimeType: string;
  }) => Promise<void>;
  isUploading?: boolean;
  autoStart?: boolean;
}
