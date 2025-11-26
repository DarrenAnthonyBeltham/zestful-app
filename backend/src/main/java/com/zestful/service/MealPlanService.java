package com.zestful.service;

import com.zestful.model.CustomRecipe;
import com.zestful.model.MealPlan;
import com.zestful.model.User;
import com.zestful.payload.MealPlanDTO;
import com.zestful.repository.CustomRecipeRepository;
import com.zestful.repository.MealPlanRepository;
import com.zestful.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // <-- ADD THIS LINE

import java.util.List;
import java.util.Optional;

@Service
public class MealPlanService {

    private final MealPlanRepository mealPlanRepository;
    private final UserRepository userRepository;
    private final CustomRecipeRepository customRecipeRepository;

    public MealPlanService(MealPlanRepository mealPlanRepository, UserRepository userRepository, CustomRecipeRepository customRecipeRepository) {
        this.mealPlanRepository = mealPlanRepository;
        this.userRepository = userRepository;
        this.customRecipeRepository = customRecipeRepository;
    }

    public List<MealPlan> getMealPlan(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return mealPlanRepository.findByUser(user);
    }

    @Transactional
    public MealPlan saveMeal(MealPlanDTO dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Optional<MealPlan> existingSlot = mealPlanRepository.findByUserAndDayOfWeekAndMealType(user, dto.getDayOfWeek(), dto.getMealType());
        
        MealPlan meal = existingSlot.orElse(new MealPlan());
        meal.setUser(user);
        meal.setDayOfWeek(dto.getDayOfWeek());
        meal.setMealType(dto.getMealType());

        if (dto.getRecipeUri() != null) {
            meal.setRecipeUri(dto.getRecipeUri());
            meal.setCustomRecipe(null);
        } else if (dto.getCustomRecipeId() != null) {
            CustomRecipe customRecipe = customRecipeRepository.findById(dto.getCustomRecipeId())
                    .orElseThrow(() -> new RuntimeException("Custom recipe not found"));
            meal.setCustomRecipe(customRecipe);
            meal.setRecipeUri(null);
        }

        return mealPlanRepository.save(meal);
    }

    @Transactional
    public void deleteMeal(Long mealPlanId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        MealPlan meal = mealPlanRepository.findById(mealPlanId)
                .orElseThrow(() -> new RuntimeException("Meal not found"));

        if (!meal.getUser().equals(user)) {
            throw new SecurityException("User not authorized to delete this meal");
        }
        
        mealPlanRepository.delete(meal);
    }
}