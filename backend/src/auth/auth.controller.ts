import { Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";

interface SendRegisterCodeBody {
  email?: string;
}

interface EmailRegisterBody {
  email?: string;
  password?: string;
  verificationCode?: string;
}

interface UsernameRegisterBody {
  username?: string;
  password?: string;
}

interface EmailLoginBody {
  email?: string;
  password?: string;
}

interface UsernameLoginBody {
  username?: string;
  password?: string;
}

@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register/send-code")
  async sendRegisterCode(@Body() body: SendRegisterCodeBody) {
    return this.authService.sendRegisterCode(body?.email || "");
  }

  @Post("register")
  async register(
    @Body() body: EmailRegisterBody,
    @Headers("user-agent") userAgent?: string,
    @Headers("x-forwarded-for") forwardedFor?: string
  ) {
    return this.authService.registerWithEmail(
      body?.email || "",
      body?.password || "",
      body?.verificationCode || "",
      userAgent,
      forwardedFor
    );
  }

  @Post("register/username")
  async registerWithUsername(
    @Body() body: UsernameRegisterBody,
    @Headers("user-agent") userAgent?: string,
    @Headers("x-forwarded-for") forwardedFor?: string
  ) {
    return this.authService.registerWithUsername(
      body?.username || "",
      body?.password || "",
      userAgent,
      forwardedFor
    );
  }

  @Post("login")
  async login(
    @Body() body: EmailLoginBody,
    @Headers("user-agent") userAgent?: string,
    @Headers("x-forwarded-for") forwardedFor?: string
  ) {
    return this.authService.loginWithEmail(
      body?.email || "",
      body?.password || "",
      userAgent,
      forwardedFor
    );
  }

  @Post("login/username")
  async loginWithUsername(
    @Body() body: UsernameLoginBody,
    @Headers("user-agent") userAgent?: string,
    @Headers("x-forwarded-for") forwardedFor?: string
  ) {
    return this.authService.loginWithUsername(
      body?.username || "",
      body?.password || "",
      userAgent,
      forwardedFor
    );
  }

  @Get("me")
  async getCurrentUser(@Headers("authorization") authorization?: string) {
    const user = await this.authService.requireUserFromAuthorization(authorization);
    return { user };
  }

  @Post("logout")
  async logout(@Headers("authorization") authorization?: string) {
    await this.authService.logout(authorization);
    return { ok: true };
  }
}
