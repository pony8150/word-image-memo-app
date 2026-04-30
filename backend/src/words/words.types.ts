export interface LearningDeckImage {
  id: number;
  url: string;
  source: string;
  credit: string | null;
  storageType: string;
  storageKey: string | null;
  sortOrder: number;
  scope: "default" | "private";
  ownerUserId: number | null;
}

export interface LearningDeckWord {
  id: string;
  english: string;
  chinese: string;
  level: string | null;
  theme: string | null;
  example: string | null;
  exampleChinese: string | null;
  imageReason: string | null;
  scene: string | null;
  image: string;
  imageSource: string | null;
  imageCredit: string | null;
  images: LearningDeckImage[];
}

export interface LearningDeckBook {
  code: string;
  name: string;
  wordCount: number;
}

export interface LearningDeckResponse {
  books: LearningDeckBook[];
  activeBookCode: string | null;
  words: LearningDeckWord[];
}
