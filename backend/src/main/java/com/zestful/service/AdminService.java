package com.zestful.service;

import com.zestful.model.User;
import com.zestful.payload.AdminStatsDTO;
import com.zestful.repository.CustomRecipeRepository;
import com.zestful.repository.FavoriteRecipeRepository;
import com.zestful.repository.MealPlanRepository;
import com.zestful.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final FavoriteRecipeRepository favoriteRecipeRepository;
    private final CustomRecipeRepository customRecipeRepository;
    private final MealPlanRepository mealPlanRepository;

    public AdminService(UserRepository userRepository, FavoriteRecipeRepository favoriteRecipeRepository, CustomRecipeRepository customRecipeRepository, MealPlanRepository mealPlanRepository) {
        this.userRepository = userRepository;
        this.favoriteRecipeRepository = favoriteRecipeRepository;
        this.customRecipeRepository = customRecipeRepository;
        this.mealPlanRepository = mealPlanRepository;
    }

    public AdminStatsDTO getSystemStats() {
        long userCount = userRepository.count();
        long savedCount = favoriteRecipeRepository.count();
        long customCount = customRecipeRepository.count();
        long planCount = mealPlanRepository.count();

        List<User> users = userRepository.findAll();
        Map<String, Long> dietDist = users.stream()
            .filter(u -> u.getPreferredDiet() != null && !u.getPreferredDiet().isEmpty())
            .collect(Collectors.groupingBy(User::getPreferredDiet, Collectors.counting()));

        return new AdminStatsDTO(userCount, savedCount, customCount, planCount, dietDist);
    }
}