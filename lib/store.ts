import { create } from 'zustand';

export type StoryMethod = 'text' | 'audio' | 'video' | 'upload';

export interface FormState {
  // Step 2 — Photo
  photoBlob: Blob | null;
  photoPreviewUrl: string | null;

  // Step 3 — Basics
  name: string;
  phone: string;
  dob: { day: string; month: string; year: string };
  fatherName: string;
  motherName: string;

  // Step 4 — About
  qualifications: string;
  achievements: string;
  hobbies: string;

  // Step 5 — Story
  storyMethod: StoryMethod | null;
  storyText: string;
  audioBlob: Blob | null;
  videoBlob: Blob | null;
  uploadFile: File | null;

  // Preserve text when switching methods
  methodContent: Record<StoryMethod, string | Blob | File | null>;
}

interface FormActions {
  setPhoto: (blob: Blob | null, previewUrl: string | null) => void;
  setBasics: (data: Partial<Pick<FormState, 'name' | 'phone' | 'dob' | 'fatherName' | 'motherName'>>) => void;
  setAbout: (data: Partial<Pick<FormState, 'qualifications' | 'achievements' | 'hobbies'>>) => void;
  setStoryMethod: (method: StoryMethod) => void;
  setStoryText: (text: string) => void;
  setAudioBlob: (blob: Blob | null) => void;
  setVideoBlob: (blob: Blob | null) => void;
  setUploadFile: (file: File | null) => void;
  resetForm: () => void;
}

const initialState: FormState = {
  photoBlob: null,
  photoPreviewUrl: null,
  name: '',
  phone: '',
  dob: { day: '', month: '', year: '' },
  fatherName: '',
  motherName: '',
  qualifications: '',
  achievements: '',
  hobbies: '',
  storyMethod: null,
  storyText: '',
  audioBlob: null,
  videoBlob: null,
  uploadFile: null,
  methodContent: { text: null, audio: null, video: null, upload: null },
};

export const useFormStore = create<FormState & FormActions>((set) => ({
  ...initialState,

  setPhoto: (blob, previewUrl) => set({ photoBlob: blob, photoPreviewUrl: previewUrl }),

  setBasics: (data) => set((s) => ({ ...s, ...data })),

  setAbout: (data) => set((s) => ({ ...s, ...data })),

  setStoryMethod: (method) => set({ storyMethod: method }),

  setStoryText: (text) =>
    set((s) => ({
      storyText: text,
      methodContent: { ...s.methodContent, text },
    })),

  setAudioBlob: (blob) =>
    set((s) => ({
      audioBlob: blob,
      methodContent: { ...s.methodContent, audio: blob },
    })),

  setVideoBlob: (blob) =>
    set((s) => ({
      videoBlob: blob,
      methodContent: { ...s.methodContent, video: blob },
    })),

  setUploadFile: (file) =>
    set((s) => ({
      uploadFile: file,
      methodContent: { ...s.methodContent, upload: file },
    })),

  resetForm: () => {
    set((s) => {
      if (s.photoPreviewUrl) URL.revokeObjectURL(s.photoPreviewUrl);
      return { ...initialState };
    });
  },
}));
