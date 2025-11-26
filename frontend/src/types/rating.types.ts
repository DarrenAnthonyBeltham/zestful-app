export interface UserSimple {
  username: string;
}

export interface RecipeRating {
  id: number;
  user: UserSimple;
  rating: number;
  comment: string;
  createdAt: string;
}