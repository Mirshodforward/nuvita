import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    photoUrl?: string;
    category: string;
    name: string;
    ingredients?: string;
    uses?: string;
    description?: string;
    price: number;
    amount?: number;
  }) {
    // Generate a unique product ID if that's what's required by schema map("product_id")
    const generatedProductId = randomUUID();

    return this.prisma.product.create({
      data: {
        productId: generatedProductId,
        photoUrl: data.photoUrl,
        category: data.category,
        name: data.name,
        ingredients: data.ingredients,
        uses: data.uses,
        description: data.description,
        price: data.price,
        amount: data.amount || 0,
        isActive: true,
      },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        categoryRel: true,
      },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Mahsulot topilmadi');
    return product;
  }

  async update(id: number, data: any) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
