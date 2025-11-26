export interface EdamamRecipe {
  uri: string;
  label: string;
  image: string;
  url: string;
  calories: number;
  
  ingredientLines: string[];
  totalNutrients: { [key: string]: Nutrient };
  dietLabels: string[];
  healthLabels: string[];
  cautions: string[];
}

export interface Nutrient {
  label: string;
  quantity: number;
  unit: string;
}

export interface EdamamHit {
  recipe: EdamamRecipe;
}

export interface EdamamLink {
  href: string;
  title: string;
}

export interface EdamamLinks {
  next?: EdamamLink;
}

export interface EdamamResponse {
  hits: EdamamHit[];
  _links: EdamamLinks;
}