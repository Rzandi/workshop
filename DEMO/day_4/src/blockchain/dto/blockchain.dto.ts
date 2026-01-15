import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class ValueResponseDto {
  @ApiProperty({
    description: 'Current stored value from blockchain',
    example: '42',
  })
  value: string;

  @ApiProperty({
    description: 'Current message from blockchain',
    example: 'Hello Avalanche!',
  })
  message: string;

  @ApiProperty({
    description: 'Contract owner address',
    example: '0xdD8aE4A885EB1Fe00282B4C2c7F64a171B4fFD98',
  })
  owner: string;
}

export class EventResponseDto {
  @ApiProperty({
    description: 'Block number of the event',
    example: '12345678',
  })
  blockNumber: string;

  @ApiProperty({
    description: 'Value set in the event',
    example: '100',
  })
  value: string;

  @ApiProperty({
    description: 'Transaction hash',
    example: '0x...',
  })
  txHash: string;
}

export class GetEventsDto {
  @ApiProperty({
    description: 'Starting block number',
    example: 0,
  })
  @IsNumber()
  @Min(0)
  fromBlock: number;

  @ApiProperty({
    description: 'Ending block number',
    example: 99999999,
  })
  @IsNumber()
  @Min(0)
  toBlock: number;
}
