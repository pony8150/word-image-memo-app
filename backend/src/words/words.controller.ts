import { Controller, Get, Headers, Query } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { WordsService } from "./words.service";

@Controller("api")
export class WordsController {
  constructor(
    private readonly authService: AuthService,
    private readonly wordsService: WordsService
  ) {}

  @Get("learning-deck")
  async getLearningDeck(
    @Query("book") bookCode = "",
    @Headers("authorization") authorization?: string
  ) {
    const user = await this.authService.requireUserFromAuthorization(authorization);
    return this.wordsService.getLearningDeckForUser(user.id, bookCode);
  }
}
