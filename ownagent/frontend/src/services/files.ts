import { apiClient } from './api';
import type { FileUpload } from '../types';

interface FilesResponse {
  files: FileUpload[];
}

interface UploadResponse {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  status: string;
  created_at: string;
}

class FileService {
  async getFiles(
    conversationId?: string,
    status?: string
  ): Promise<FileUpload[]> {
    const params: Record<string, unknown> = {};
    if (conversationId) params.conversation_id = conversationId;
    if (status) params.status = status;

    const response = await apiClient.get<FilesResponse>('/files', params);
    return response.files;
  }

  async uploadFile(
    file: File,
    conversationId?: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (conversationId) {
      formData.append('conversation_id', conversationId);
    }

    const response = await apiClient.instance.post<UploadResponse>(
      '/files/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      }
    );

    return response.data;
  }

  async getFile(fileId: string): Promise<FileUpload> {
    return apiClient.get<FileUpload>(`/files/${fileId}`);
  }

  async downloadFile(fileId: string): Promise<Blob> {
    const response = await apiClient.instance.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async deleteFile(fileId: string): Promise<void> {
    await apiClient.delete(`/files/${fileId}`);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'file-text';
    if (mimeType.includes('word')) return 'file-text';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'table';
    if (mimeType.includes('code') || mimeType.includes('json')) return 'code';
    return 'file';
  }
}

export const fileService = new FileService();
export default fileService;