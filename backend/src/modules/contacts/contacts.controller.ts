import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetContactsUseCase } from './use-cases/get-contacts.use-case';
import { GetContactsBySelectionUseCase } from './use-cases/get-contacts-by-selection.use-case';
import { GetContactUseCase } from './use-cases/get-contact.use-case';
import { CreateContactUseCase } from './use-cases/create-contact.use-case';
import { UpdateContactUseCase } from './use-cases/update-contact.use-case';
import { DeleteContactUseCase } from './use-cases/delete-contact.use-case';
import { DiscoverContactsUseCase } from './use-cases/discover-contacts.use-case';
import { ContactMapper } from './mappers/contact.mapper';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { DiscoverContactsDto } from './dto/discover-contacts.dto';
import { ContactsQueryDto } from './dto/contacts-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('contacts')
export class ContactsController {
  constructor(
    private readonly getContactsUseCase: GetContactsUseCase,
    private readonly getContactsBySelectionUseCase: GetContactsBySelectionUseCase,
    private readonly getContactUseCase: GetContactUseCase,
    private readonly createContactUseCase: CreateContactUseCase,
    private readonly updateContactUseCase: UpdateContactUseCase,
    private readonly deleteContactUseCase: DeleteContactUseCase,
    private readonly discoverContactsUseCase: DiscoverContactsUseCase,
    private readonly contactMapper: ContactMapper,
  ) {}

  @Get()
  async findAll(@Query() query: ContactsQueryDto, @Request() req: any) {
    const contacts = query.selectionId
      ? await this.getContactsBySelectionUseCase.execute(query.selectionId, req.user.sub)
      : await this.getContactsUseCase.execute(req.user.sub);
    return this.contactMapper.toResponseList(contacts);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const contact = await this.getContactUseCase.execute(id);
    return this.contactMapper.toResponse(contact);
  }

  @Post()
  async create(@Body() dto: CreateContactDto, @Request() req: any) {
    const contact = await this.createContactUseCase.execute(dto, req.user.sub);
    return this.contactMapper.toResponse(contact);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateContactDto) {
    const contact = await this.updateContactUseCase.execute(id, dto);
    return this.contactMapper.toResponse(contact);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deleteContactUseCase.execute(id);
    return { message: 'Contact deleted successfully' };
  }

  @Post('discover')
  async discover(@Body() dto: DiscoverContactsDto, @Request() req: any) {
    const contacts = await this.discoverContactsUseCase.execute(dto, req.user.sub);
    return this.contactMapper.toResponseList(contacts);
  }
}
