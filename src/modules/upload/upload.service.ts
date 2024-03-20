import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
  ) {}

  async uploadPhoto(user: User, file: Express.Multer.File) {
    if (!file) {
      throw new NotFoundException('Файл не найден');
    }

    const fileMimeTypes = [
      'image/jpg',
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!fileMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Допускаются только файлы изображений');
    }

    const filename = await this.supabaseService.uploadPhoto(file, user.id);
    const url = await this.supabaseService.getUrl('/photos', filename);

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        photo: url,
      },
    });

    try {
      return updatedUser;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }
}
