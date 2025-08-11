import { Injectable } from '@nestjs/common';
import { FileUpload } from '@shared/index';

@Injectable()
export class UploadService {
  async uploadFile(file: Express.Multer.File): Promise<FileUpload> {
    const fileUrl = `/uploads/${file.filename}`;
    
    return {
      id: file.filename,
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: fileUrl,
      uploadedAt: new Date(),
    };
  }

  async deleteFile(filename: string): Promise<boolean> {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const filePath = path.join(process.cwd(), 'uploads', filename);
      
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  async getFileInfo(filename: string): Promise<FileUpload | null> {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const filePath = path.join(process.cwd(), 'uploads', filename);
      
      const stats = await fs.stat(filePath);
      
      return {
        id: filename,
        originalName: filename,
        filename: filename,
        mimetype: this.getMimeType(filename),
        size: stats.size,
        url: `/uploads/${filename}`,
        uploadedAt: stats.birthtime,
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  }

  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'mov': 'video/quicktime',
    };
    
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }
}
