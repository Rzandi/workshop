import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BlockchainService } from './blockchain.service';
import {
  ValueResponseDto,
  EventResponseDto,
  GetEventsDto,
} from './dto/blockchain.dto';

@ApiTags('blockchain')
@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('value')
  @ApiOperation({
    summary: 'Get current value, message, and owner from smart contract',
  })
  @ApiResponse({
    status: 200,
    description: 'Current contract state',
    type: ValueResponseDto,
  })
  @ApiResponse({ status: 503, description: 'RPC unavailable' })
  async getValue(): Promise<ValueResponseDto> {
    const result = await this.blockchainService.getLatestValue();
    return result as ValueResponseDto;
  }

  @Post('events')
  @ApiOperation({ summary: 'Get ValueUpdated event history with block range' })
  @ApiResponse({
    status: 200,
    description: 'List of ValueUpdated events',
    type: [EventResponseDto],
  })
  @ApiResponse({ status: 503, description: 'RPC unavailable' })
  async getEvents(@Body() body: GetEventsDto): Promise<EventResponseDto[]> {
    const result = await this.blockchainService.getValueUpdatedEvents(
      body.fromBlock,
      body.toBlock,
    );
    return result as EventResponseDto[];
  }
}
