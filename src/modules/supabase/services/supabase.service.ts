import {
  Injectable,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { SupabaseClient, createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.initSupabaseClient();
  }

  private initSupabaseClient() {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

    if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
      throw new Error('Supabase URL and Secret Key are required');
    }

    this.supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  private generateUniqueFileName(
    originalFileName: string,
    userId?: number | null,
  ) {
    const timestamp = Date.now();
    const fileExtension = originalFileName.split('.').pop();
    return `${
      userId ? `user-${userId}-` : ''
    }photo-${timestamp}.${fileExtension}`;
  }

  private async uploadFile(bucket: string, filename: string, buffer: Buffer) {
    try {
      const { data } = await this.supabase.storage
        .from(bucket)
        .upload(filename, buffer, { upsert: true });

      return data.path;
    } catch (e: any) {
      console.error('Error uploading file to Supabase: ', e.message);
      throw new ServiceUnavailableException('Не удалось загрузить файл');
    }
  }

  async uploadPhoto(file: Express.Multer.File, userId?: number | null) {
    const maxSize = 15 * 1024 * 1024; // 15 MB

    if (file.size > maxSize) {
      throw new BadRequestException(
        'Размер файла превышает ограничение в 15 МБ',
      );
    }

    const filename = this.generateUniqueFileName(file.originalname, userId);
    return this.uploadFile('/photos', filename, file.buffer);
  }

  async uploadAudio(buffer: Buffer) {
    let num = (Math.random() * 100000000).toFixed(0);
    const filename = `audio-${num}.mp3`;

    return this.uploadFile('/audios', filename, buffer);
  }

  async getUrl(bucket: string, filename: string) {
    if (!filename) return '';
    return `${process.env.SUPABASE_URL}/storage/v1/object/public${bucket}/${filename}`;
  }
}
