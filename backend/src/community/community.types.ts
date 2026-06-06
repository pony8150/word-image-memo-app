export interface CommunityAuthor {
  id: number;
  displayName: string;
  email: string;
  avatarText: string;
  avatarUrl: string | null;
}

export interface CommunityFeedPost {
  id: number;
  wordId: string;
  title: string;
  body: string | null;
  imageUrl: string;
  likeCount: number;
  favoriteCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
  author: CommunityAuthor;
  viewer: {
    liked: boolean;
    favorited: boolean;
  };
}

export interface CommunityComment {
  id: number;
  content: string;
  likeCount: number;
  createdAt: string;
  author: CommunityAuthor;
  viewer: {
    liked: boolean;
  };
}

export interface CommunityPostDetail extends CommunityFeedPost {
  word: {
    english: string;
    chinese: string;
    example: string | null;
    exampleChinese: string | null;
    imageReason: string | null;
    scene: string | null;
  };
  comments: CommunityComment[];
}
