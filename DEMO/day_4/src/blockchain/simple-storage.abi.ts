export const SIMPLE_STORAGE_ABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'newMessage', type: 'string' },
    ],
    name: 'MessageUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'oldOwner', type: 'address' },
      { indexed: true, name: 'newOwner', type: 'address' },
    ],
    name: 'OwnerSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'newValue', type: 'uint256' },
    ],
    name: 'ValueUpdated',
    type: 'event',
  },
  {
    inputs: [],
    name: 'getValue',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'message',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_message', type: 'string' }],
    name: 'setMessage',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_value', type: 'uint256' }],
    name: 'setValue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_value', type: 'uint256' },
      { name: '_message', type: 'string' },
    ],
    name: 'setValueAndMessage',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const CONTRACT_ADDRESS = '0x29be1a8eb7494a93470e07ed2e61cae0b4c7603b' as const;
