import { EdamamRecipe } from "./recipe.types";
import { CustomRecipe } from "./custom-recipe.types";

export interface PlannerRecipe {
  id: string;
  label: string;
  image: string;
  isCustom: boolean;
  recipeUri?: string;
  customRecipeId?: number;
  healthLabels?: string[]; 
}

export interface MealPlanItem {
  id: number;
  dayOfWeek: string;
  mealType: string;
  recipeUri?: string;
  customRecipe?: CustomRecipe;
}

export interface ShoppingList {
  ingredients: { [key: string]: number };
  totalRecipes: number;
  estimatedCost: number; 
}