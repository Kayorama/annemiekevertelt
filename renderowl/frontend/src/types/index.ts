export interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  duration: number;
  width: number;
  height: number;
  fps: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  status: 'draft' | 'rendering' | 'completed' | 'failed';
  progress?: number;
}

export interface TimelineItem {
  id: string;
  type: 'video' | 'image' | 'text' | 'audio' | 'effect';
  name: string;
  startTime: number;
  duration: number;
  layer: number;
  data: Record<string, unknown>;
  thumbnail?: string;
}

export interface ExportSettings {
  format: 'mp4' | 'webm' | 'gif';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: '720p' | '1080p' | '4k';
  fps: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  credits: number;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  duration: number;
  premium: boolean;
  data: Record<string, unknown>;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
}

export type Theme = 'light' | 'dark' | 'system';
