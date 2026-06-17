export interface AdminOverviewSummary {
  totalUsers: number;
  adminUsers: number;
  activeUsers7d: number;
  totalPosts: number;
  totalComments: number;
}

export interface AdminOverviewResponse {
  summary: AdminOverviewSummary;
}

export interface AdminPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface AdminUserItem {
  id: number;
  email: string | null;
  username: string | null;
  displayName: string;
  authProvider: "email" | "wechat" | "username";
  isAdmin: boolean;
  postCount: number;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AdminUserListResponse {
  items: AdminUserItem[];
  pagination: AdminPagination;
}

export interface AdminPostItem {
  id: number;
  userId: number;
  wordId: string;
  wordEnglish: string;
  wordChinese: string;
  title: string;
  body: string | null;
  imageUrl: string;
  likeCount: number;
  favoriteCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    displayName: string;
    username: string | null;
    email: string | null;
  };
}

export interface AdminPostListResponse {
  items: AdminPostItem[];
  pagination: AdminPagination;
}
