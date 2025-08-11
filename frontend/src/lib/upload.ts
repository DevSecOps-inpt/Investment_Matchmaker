import { FileUpload } from '@shared/index';

export async function uploadFile(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storage/upload`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to upload file');
  }

  return response.json() as Promise<{ url: string }>;
}

export function getFileUrl(url: string): string {
  if (url.startsWith('http')) {
    return url;
  }
  
  // For local uploads, prepend the API URL
  return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
}

export function getFileType(filename: string): 'image' | 'document' | 'video' | 'unknown' {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
    return 'image';
  }
  
  if (['pdf', 'doc', 'docx'].includes(ext || '')) {
    return 'document';
  }
  
  if (['mp4', 'webm', 'mov'].includes(ext || '')) {
    return 'video';
  }
  
  return 'unknown';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
