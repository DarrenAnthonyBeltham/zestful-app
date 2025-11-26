package com.zestful.service;

import com.zestful.model.MealPlan;
import com.zestful.model.User;
import com.zestful.payload.AnalyticsDTO;
import com.zestful.payload.edamam.EdamamHitDTO;
import com.zestful.repository.MealPlanRepository;
import com.zestful.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final MealPlanRepository mealPlanRepository;
    private final UserRepository userRepository;
    private final RecipeService recipeService;

    public AnalyticsService(MealPlanRepository mealPlanRepository, UserRepository userRepository, RecipeService recipeService) {
        this.mealPlanRepository = mealPlanRepository;
        this.userRepository = userRepository;
        this.recipeService = recipeService;
    }

    public AnalyticsDTO getWeeklyAnalytics(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<MealPlan> meals = mealPlanRepository.findByUser(user);
        
        AnalyticsDTO analytics = new AnalyticsDTO();
        Map<String, Double> dailyCals = new HashMap<>();
        
        double totalCals = 0;
        double totalProt = 0;
        double totalCarbs = 0;
        double totalFat = 0;

        for (MealPlan meal : meals) {
            if (meal.getRecipeUri() != null) {
                String id = meal.getRecipeUri().substring(meal.getRecipeUri().lastIndexOf('_') + 1);
                try {
                    EdamamHitDTO hit = recipeService.getRecipeById(id);
                    if (hit != null && hit.getRecipe() != null) {
                        double cals = hit.getRecipe().getCalories();
                        totalCals += cals;
                        
                        dailyCals.merge(meal.getDayOfWeek(), cals, Double::sum);

                        Map<String, com.zestful.payload.edamam.NutrientDTO> nutrients = hit.getRecipe().getTotalNutrients();
                        if (nutrients != null) {
                            if (nutrients.containsKey("PROCNT")) totalProt += nutrients.get("PROCNT").getQuantity();
                            if (nutrients.containsKey("CHOCDF")) totalCarbs += nutrients.get("CHOCDF").getQuantity();
                            if (nutrients.containsKey("FAT")) totalFat += nutrients.get("FAT").getQuantity();
                        }
                    }
                } catch (Exception e) {
                    // Ignore failed lookups for analytics
                }
            }
        }

        analytics.setTotalCalories(Math.round(totalCals));
        analytics.setTotalProtein(Math.round(totalProt));
        analytics.setTotalCarbs(Math.round(totalCarbs));
        analytics.setTotalFat(Math.round(totalFat));
        analytics.setTotalMeals(meals.size());
        analytics.setDailyCalories(dailyCals);

        return analytics;
    }
}