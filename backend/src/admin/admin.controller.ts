import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query
} from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { AdminService } from "./admin.service";

interface AdminUserCreateBody {
  username?: string;
  displayName?: string;
  password?: string;
  isAdmin?: boolean;
}

interface AdminUserUpdateBody {
  username?: string;
  displayName?: string;
  password?: string;
  isAdmin?: boolean;
}

interface AdminPostCreateBody {
  userId?: number;
  wordId?: string;
  title?: string;
  body?: string;
}

interface AdminPostUpdateBody {
  title?: string;
  body?: string;
}

@Controller("api/admin")
export class AdminController {
  constructor(
    private readonly authService: AuthService,
    private readonly adminService: AdminService
  ) {}

  @Get("overview")
  async getOverview(@Headers("authorization") authorization?: string) {
    const user = await this.authService.requireUserFromAuthorization(authorization);
    return this.adminService.getOverview(user);
  }

  @Get("users")
  async listUsers(
    @Headers("authorization") authorization?: string,
    @Query("q") q?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string
  ) {
    const user = await this.authService.requireUserFromAuthorization(authorization);
    return this.adminService.listUsers(user, {
      q,
      page: Number(page || 0),
      pageSize: Number(pageSize || 0)
    });
  }

  @Post("users")
  async createUser(
    @Body() body: AdminUserCreateBody,
    @Headers("authorization") authorization?: string
  ) {
    const user = await this.authService.requireUserFromAuthorization(authorization);
    return this.adminService.createUser(user, body);
  }

  @Patch("users/:id")
  async updateUser(
    @Param("id", ParseIntPipe) userId: number,
    @Body() body: AdminUserUpdateBody,
    @Headers("authorization") authorization?: string
  ) {
    const user = await this.authService.requireUserFromAuthorization(authorization);
    return this.adminService.updateUser(user, userId, body);
  }

  @Delete("users/:id")
  async deleteUser(
    @Param("id", ParseIntPipe) userId: number,
    @Headers("authorization") authorization?: string
  ) {
    const user = await this.authService.requireUserFromAuthorization(authorization);
    return this.adminService.deleteUser(user, userId);
  }

  @Get("posts")
  async listPosts(
    @Headers("authorization") authorization?: string,
    @Query("q") q?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string
  ) {
    const user = await this.authService.requireUserFromAuthorization(authorization);
    return this.adminService.listPosts(user, {
      q,
      page: Number(page || 0),
      pageSize: Number(pageSize || 0)
    });
  }

  @Post("posts")
  async createPost(
    @Body() body: AdminPostCreateBody,
    @Headers("authorization") authorization?: string
  ) {
    const user = await this.authService.requireUserFromAuthorization(authorization);
    return this.adminService.createPost(user, body);
  }

  @Patch("posts/:id")
  async updatePost(
    @Param("id", ParseIntPipe) postId: number,
    @Body() body: AdminPostUpdateBody,
    @Headers("authorization") authorization?: string
  ) {
    const user = await this.authService.requireUserFromAuthorization(authorization);
    return this.adminService.updatePost(user, postId, body);
  }

  @Delete("posts/:id")
  async deletePost(
    @Param("id", ParseIntPipe) postId: number,
    @Headers("authorization") authorization?: string
  ) {
    const user = await this.authService.requireUserFromAuthorization(authorization);
    return this.adminService.deletePost(user, postId);
  }
}
