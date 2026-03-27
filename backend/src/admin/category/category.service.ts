import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; description?: string }) {
    const existing = await this.prisma.category.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      throw new ConflictException('Bu nomdagi kategoriya allaqachon mavjud');
    }
    return this.prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        isActive: true,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Kategoriya topilmadi');
    return category;
  }

  async update(
    id: number,
    data: { name?: string; description?: string; isActive?: boolean },
  ) {
    await this.findOne(id); // check if exists
    if (data.name) {
      const existing = await this.prisma.category.findFirst({
        where: { name: data.name, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException('Bu nomdagi kategoriya allaqachon mavjud');
      }
    }
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // check if exists
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
