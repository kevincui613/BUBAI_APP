import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ok } from '../common/api-response';
import { getCurrentUserId } from '../common/current-user';
import { SocialService } from './social.service';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { RespondFriendRequestDto } from './dto/respond-friend-request.dto';
import { UpdateVisibilityDto } from './dto/update-visibility.dto';
import { CreateTeamPostDto } from './dto/create-team-post.dto';

@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('friends/search')
  searchUsers(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-user-nickname') nickname: string | undefined,
    @Query('keyword') keyword?: string,
  ) {
    const userId = getCurrentUserId(authorization);
    return ok(this.socialService.searchUsers(userId, keyword || '', nickname));
  }

  @Post('friends/requests')
  sendFriendRequest(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-user-nickname') nickname: string | undefined,
    @Body() dto: CreateFriendRequestDto,
  ) {
    const userId = getCurrentUserId(authorization);
    this.socialService.sendFriendRequest(userId, dto.targetUserId, nickname);
    return ok(null);
  }

  @Get('friends/requests/incoming')
  fetchIncomingRequests(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-user-nickname') nickname: string | undefined,
  ) {
    const userId = getCurrentUserId(authorization);
    return ok(this.socialService.fetchIncomingRequests(userId, nickname));
  }

  @Patch('friends/requests/:requestId')
  respondFriendRequest(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-user-nickname') nickname: string | undefined,
    @Param('requestId') requestId: string,
    @Body() dto: RespondFriendRequestDto,
  ) {
    const userId = getCurrentUserId(authorization);
    this.socialService.respondFriendRequest(userId, requestId, dto.action, nickname);
    return ok(null);
  }

  @Get('friends')
  fetchFriends(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-user-nickname') nickname: string | undefined,
  ) {
    const userId = getCurrentUserId(authorization);
    return ok(this.socialService.fetchFriends(userId, nickname));
  }

  @Get('friends/visibility')
  getVisibility(@Headers('authorization') authorization: string | undefined) {
    const userId = getCurrentUserId(authorization);
    return ok(this.socialService.getVisibility(userId));
  }

  @Patch('friends/visibility')
  updateVisibility(
    @Headers('authorization') authorization: string | undefined,
    @Body() dto: UpdateVisibilityDto,
  ) {
    const userId = getCurrentUserId(authorization);
    return ok(this.socialService.updateVisibility(userId, dto.visibility));
  }

  @Get('friends/recommendations')
  fetchBuddyRecommendations(@Headers('authorization') authorization: string | undefined) {
    const userId = getCurrentUserId(authorization);
    return ok(this.socialService.fetchBuddyRecommendations(userId));
  }

  @Get('circles')
  fetchCircles(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-user-nickname') nickname: string | undefined,
    @Query('category') category?: string,
  ) {
    const userId = getCurrentUserId(authorization);
    return ok(this.socialService.fetchCircles(userId, category || 'all', nickname));
  }

  @Post('circles/:circleId/join')
  joinCircle(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-user-nickname') nickname: string | undefined,
    @Param('circleId') circleId: string,
  ) {
    const userId = getCurrentUserId(authorization);
    this.socialService.joinCircle(userId, circleId, nickname);
    return ok(null);
  }

  @Get('teams/posts')
  fetchTeamPosts() {
    return ok(this.socialService.fetchTeamPosts());
  }

  @Post('teams/posts')
  createTeamPost(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-user-nickname') nickname: string | undefined,
    @Body() dto: CreateTeamPostDto,
  ) {
    const userId = getCurrentUserId(authorization);
    return ok(this.socialService.createTeamPost(userId, dto, nickname));
  }

  @Get('teams/challenges')
  fetchTeamChallenges() {
    return ok(this.socialService.fetchTeamChallenges());
  }
}
