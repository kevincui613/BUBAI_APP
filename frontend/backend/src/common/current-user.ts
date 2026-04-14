import { BadRequestException } from '@nestjs/common';

export function getCurrentUserId(authorization?: string): string {
  if (!authorization) {
    return 'user_demo';
  }

  if (!authorization.startsWith('Bearer ')) {
    throw new BadRequestException('Invalid authorization header');
  }

  const token = authorization.slice(7);
  if (token.startsWith('mock-token-')) {
    return token.replace('mock-token-', '');
  }

  return 'user_demo';
}
