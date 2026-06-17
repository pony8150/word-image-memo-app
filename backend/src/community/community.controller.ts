import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post
} from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { CommunityService } from "./community.service";

interface PublishPostBody {
  wordId?: string;
  wordImageId?: number;
  body?: string;
}

interface CreateCommentBody {
  content?: string;
}

@Controller("api/community")
export class CommunityController {
  constructor(
    private readonly authService: AuthService,
    private readonly communityService: CommunityService
  ) {}

  @Get("feed")
  async getFeed(@Headers("authorization") authorization?: string) {
    const user = await this.authService.requireUserFromAuthorization(authorization);
    return this.communityService.getFeed(user.id);
  }

  @Get("posts/:id")
  async getPostDetail(
    @Param("id", ParseIntPipe) postId: number,
    @Headers("authorization") authorization?: string
  ) {
    const user = await this.authService.requireUserFromAuthorization(authorization);
    return this.communityService.getPostDetail(postId, user.id);
  }

  @Get("admin/overview")
  async getAdminOverview(@Headers("authorization") authorization?: string) {
    const user = await this.authService.requireUserFromAuthorization(authorization);
    return this.communityService.getAdminOverview(user);
  }

  @Post("admin/posts/:id/delete")
  async deletePostAsAdmin(
    @Param("id", ParseIntPipe) postId: number,
    @Headers("authorization") authorization?: string
  ) {
    const user = await this.authService.requireUserFromAuthorization(authorization);
    return this.communityService.deletePostAsAdmin(postId, user);
  }

  @Post("posts")
  async publishPost(
    @Body() body: PublishPostBody,
    @Headers("authorization") authorization?: string
  ) {
    const user = await this.authService.requireUserFromAuthorization(authorization);
    return this.communityService.publishPost(user, {
      wordId: body?.wordId || "",
      wordImageId: Number(body?.wordImageId || 0),
      body: body?.body || ""
    });
  }

  @Post("posts/:id/comments")
  async createComment(
    @Param("id", ParseIntPipe) postId: number,
    @Body() body: CreateCommentBody,
    @Headers("authorization") authorization?: string
  ) {
    const user = await this.authService.requireUserFromAuthorization(authorization);
    return this.communityService.createComment(postId, user, body?.content || "");
  }

  @Post("posts/:id/toggle-like")
  async togglePostLike(
    @Param("id", ParseIntPipe) postId: number,
    @Headers("authorization") authorization?: string
  ) {
    const user = await this.authService.requireUserFromAuthorization(authorization);
    return this.communityService.togglePostLike(postId, user.id);
  }

  @Post("posts/:id/favorite")
  async favoritePost(
    @Param("id", ParseIntPipe) postId: number,
    @Headers("authorization") authorization?: string
  ) {
    const user = await this.authService.requireUserFromAuthorization(authorization);
    return this.communityService.favoritePost(postId, user);
  }

  @Post("posts/:id/toggle-favorite")
  async favoritePostLegacy(
    @Param("id", ParseIntPipe) postId: number,
    @Headers("authorization") authorization?: string
  ) {
    const user = await this.authService.requireUserFromAuthorization(authorization);
    return this.communityService.favoritePost(postId, user);
  }

  @Post("posts/:id/share")
  async incrementPostShare(
    @Param("id", ParseIntPipe) postId: number,
    @Headers("authorization") authorization?: string
  ) {
    await this.authService.requireUserFromAuthorization(authorization);
    return this.communityService.incrementPostShare(postId);
  }

  @Post("comments/:id/toggle-like")
  async toggleCommentLike(
    @Param("id", ParseIntPipe) commentId: number,
    @Headers("authorization") authorization?: string
  ) {
    const user = await this.authService.requireUserFromAuthorization(authorization);
    return this.communityService.toggleCommentLike(commentId, user.id);
  }
}
