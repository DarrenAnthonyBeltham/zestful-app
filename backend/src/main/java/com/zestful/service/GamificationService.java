package com.zestful.service;

import com.zestful.model.User;
import com.zestful.payload.GamificationDTO;
import com.zestful.repository.CustomRecipeRepository;
import com.zestful.repository.MealPlanRepository;
import com.zestful.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class GamificationService {

    private final UserRepository userRepository;
    private final CustomRecipeRepository recipeRepository;
    private final MealPlanRepository mealPlanRepository;

    public GamificationService(UserRepository userRepository, CustomRecipeRepository recipeRepository, MealPlanRepository mealPlanRepository) {
        this.userRepository = userRepository;
        this.recipeRepository = recipeRepository;
        this.mealPlanRepository = mealPlanRepository;
    }

    @Transactional
    public void addXp(String userEmail, int amount) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        user.setXp(user.getXp() + amount);
        userRepository.save(user);
    }

    public GamificationDTO getUserStats(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        int xp = user.getXp();
        int level = (int) Math.floor(Math.sqrt(xp) / 5) + 1;
        int nextLevelXp = (int) Math.pow((level) * 5, 2);

        List<String> badges = new ArrayList<>();
        
        if (xp > 100) badges.add("Kitchen Novice");
        if (xp > 500) badges.add("Sous Chef");
        if (xp > 1000) badges.add("Head Chef");
        if (xp > 5000) badges.add("Culinary Master");

        int recipeCount = recipeRepository.findByUser(user).size();
        if (recipeCount >= 1) badges.add("Creator");
        if (recipeCount >= 5) badges.add("Menu Developer");

        int mealPlanCount = mealPlanRepository.findByUser(user).size();
        if (mealPlanCount >= 7) badges.add("Planner Pro");

        return new GamificationDTO(xp, level, nextLevelXp, badges);
    }
}