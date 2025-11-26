export interface GNewsArticle {
  title: string;
  description: string;
  url: string;
  image: string;
}

export interface GNewsResponse {
  articles: GNewsArticle[];
}