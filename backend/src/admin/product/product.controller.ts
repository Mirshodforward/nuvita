import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

// Multer orqali rasmlarni saqlash konfiguratsiyasi
const storage = diskStorage({
  destination: './ProductPhoto',
  filename: (req, file, cb) => {
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    cb(null, `${randomName}${extname(file.originalname)}`);
  },
});

// Helper function to parse translation data from form-data
function parseTranslationData(body: any) {
  const translationRu = body.nameRu ? {
    name: body.nameRu,
    ingredients: body.ingredientsRu || undefined,
    uses: body.usesRu || undefined,
    description: body.descriptionRu || undefined,
  } : undefined;

  const translationEn = body.nameEn ? {
    name: body.nameEn,
    ingredients: body.ingredientsEn || undefined,
    uses: body.usesEn || undefined,
    description: body.descriptionEn || undefined,
  } : undefined;

  return { translationRu, translationEn };
}

@Controller('admin/product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo', { storage }))
  create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    const photoUrl = file ? `/ProductPhoto/${file.filename}` : undefined;
    const { translationRu, translationEn } = parseTranslationData(body);
    
    return this.productService.create({
      ...body,
      price: Number(body.price),
      amount: Number(body.amount),
      photoUrl,
      translationRu,
      translationEn,
    });
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo', { storage }))
  update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    const data = { ...body };
    if (file) {
      data.photoUrl = `/ProductPhoto/${file.filename}`;
    }

    // Only parse numbers if they are present as strings in form-data
    if (data.price !== undefined) data.price = Number(data.price);
    if (data.amount !== undefined) data.amount = Number(data.amount);

    // Check if it's just a boolean update for isActive which might come as string or boolean
    if (data.isActive !== undefined) {
      data.isActive = String(data.isActive) === 'true';
    }

    // Parse translation data
    const { translationRu, translationEn } = parseTranslationData(body);
    data.translationRu = translationRu;
    data.translationEn = translationEn;

    // Remove individual translation fields from data
    delete data.nameRu;
    delete data.ingredientsRu;
    delete data.usesRu;
    delete data.descriptionRu;
    delete data.nameEn;
    delete data.ingredientsEn;
    delete data.usesEn;
    delete data.descriptionEn;

    return this.productService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
