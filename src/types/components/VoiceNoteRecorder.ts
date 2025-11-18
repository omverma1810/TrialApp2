export interface VoiceNoteData {
  audioBase64: string;
  fileName: string;
  duration: number;
  mimeType: string;
  timestamp?: number;
}

export interface StoredVoiceNote {
  fileName: string;
  duration: number;
  mimeType: string;
  timestamp: number;
  audioBase64?: string;
}

export interface VoiceNoteRecorderProps {
  isVisible: boolean;
  plotNumber: string | number;
  fieldName: string;
  onClose: () => void;
  onUpload: (voiceNoteData: VoiceNoteData) => Promise<void>;
  isUploading?: boolean;
  existingVoiceNotes?: StoredVoiceNote[];
  maxVoiceNotes?: number;
}
