package com.zestful.service;

import com.zestful.model.CustomRecipe;
import com.zestful.model.CustomRecipeIngredient;
import com.zestful.model.MealPlan;
import com.zestful.model.PantryItem;
import com.zestful.model.User;
import com.zestful.payload.ShoppingListDTO;
import com.zestful.payload.edamam.EdamamHitDTO;
import com.zestful.repository.MealPlanRepository;
import com.zestful.repository.PantryItemRepository;
import com.zestful.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ShoppingListService {

    private final MealPlanRepository mealPlanRepository;
    private final UserRepository userRepository;
    private final RecipeService recipeService;
    private final PantryItemRepository pantryItemRepository;

    public ShoppingListService(MealPlanRepository mealPlanRepository, UserRepository userRepository, 
                               RecipeService recipeService, PantryItemRepository pantryItemRepository) {
        this.mealPlanRepository = mealPlanRepository;
        this.userRepository = userRepository;
        this.recipeService = recipeService;
        this.pantryItemRepository = pantryItemRepository;
    }

    public ShoppingListDTO generateShoppingList(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        List<PantryItem> pantryItems = pantryItemRepository.findByUser(user);
        List<String> pantryNames = pantryItems.stream()
                .map(item -> item.getName().toLowerCase())
                .collect(Collectors.toList());

        List<MealPlan> mealPlan = mealPlanRepository.findByUser(user);
        List<String> allIngredientLines = new ArrayList<>();
        
        Set<String> edamamRecipeIds = mealPlan.stream()
                .map(MealPlan::getRecipeUri)
                .filter(uri -> uri != null && !uri.isEmpty())
                .map(uri -> uri.substring(uri.lastIndexOf('_') + 1))
                .collect(Collectors.toSet());
        
        for (String id : edamamRecipeIds) {
            try {
                EdamamHitDTO hit = recipeService.getRecipeById(id);
                if (hit != null && hit.getRecipe() != null && hit.getRecipe().getIngredientLines() != null) {
                    allIngredientLines.addAll(hit.getRecipe().getIngredientLines());
                }
            } catch (Exception e) {
                System.err.println("Could not fetch Edamam recipe: " + id);
            }
        }
        
        Set<CustomRecipe> customRecipes = mealPlan.stream()
                .map(MealPlan::getCustomRecipe)
                .filter(recipe -> recipe != null)
                .collect(Collectors.toSet());
        
        for (CustomRecipe customRecipe : customRecipes) {
            if (customRecipe.getIngredients() != null) {
                allIngredientLines.addAll(
                    customRecipe.getIngredients().stream()
                        .map(CustomRecipeIngredient::getIngredientText)
                        .collect(Collectors.toList())
                );
            }
        }

        Map<String, Long> ingredientCounts = allIngredientLines.stream()
                .map(String::toLowerCase)
                .filter(ingredient -> {
                    for (String pantryItem : pantryNames) {
                        if (ingredient.contains(pantryItem)) {
                            return false; 
                        }
                    }
                    return true; 
                })
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));

        double estimatedCost = ingredientCounts.size() * 2.50; 

        return new ShoppingListDTO(ingredientCounts, edamamRecipeIds.size() + customRecipes.size(), estimatedCost);
    }
}