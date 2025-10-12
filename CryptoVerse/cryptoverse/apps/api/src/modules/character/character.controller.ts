import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CharacterService } from './character.service';
import { UpgradeCharacterDto, UnlockCharacterDto, CharacterQueryDto } from './dto/upgrade-character.dto';
import { CurrentUser } from '../../common/decorators';

@ApiTags('character')
@ApiBearerAuth()
@Controller('characters')
export class CharacterController {
  constructor(private readonly characterService: CharacterService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available characters' })
  @ApiResponse({ status: 200, description: 'Characters retrieved successfully' })
  async getAllCharacters(@Query() query: CharacterQueryDto) {
    return this.characterService.getAllCharacters(query.rarity);
  }

  @Get('user')
  @ApiOperation({ summary: "Get current user's characters" })
  @ApiResponse({ status: 200, description: 'User characters retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserCharacters(@CurrentUser('id') userId: string) {
    return this.characterService.getUserCharacters(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get character by ID' })
  @ApiResponse({ status: 200, description: 'Character retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Character not found' })
  async getCharacterById(@Param('id') characterId: string) {
    return this.characterService.getCharacterById(characterId);
  }

  @Post(':id/upgrade')
  @ApiOperation({ summary: 'Upgrade character level' })
  @ApiResponse({ status: 200, description: 'Character upgraded successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient coins or max level reached' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Character not found' })
  async upgradeCharacter(
    @CurrentUser('id') userId: string,
    @Param('id') userCharacterId: string,
    @Body() upgradeDto: UpgradeCharacterDto,
  ) {
    return this.characterService.upgradeCharacter(userId, userCharacterId, upgradeDto);
  }

  @Post('unlock')
  @ApiOperation({ summary: 'Unlock a new character' })
  @ApiResponse({ status: 200, description: 'Character unlocked successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient coins or already owned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Character not found' })
  async unlockCharacter(
    @CurrentUser('id') userId: string,
    @Body() unlockDto: UnlockCharacterDto,
  ) {
    return this.characterService.unlockCharacter(userId, unlockDto);
  }
}
