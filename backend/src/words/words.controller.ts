import { Controller, Get } from "@nestjs/common";
import { WordsService } from "./words.service";

@Controller("api")
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get("learning-deck")
  async getLearningDeck() {
    return this.wordsService.getLearningDeck();
  }
}
