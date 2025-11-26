export interface CustomRecipeIngredient {
  id: number;
  ingredientText: string;
}

export interface CustomRecipe {
  id: number;
  title: string;
  instructions: string;
  imageUrl: string;
  ingredients: CustomRecipeIngredient[];
}