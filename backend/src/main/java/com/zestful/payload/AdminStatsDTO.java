package com.zestful.payload;

import lombok.Data;
import java.util.Map;

@Data
public class AdminStatsDTO {
    private long totalUsers;
    private long totalSavedRecipes;
    private long totalCustomRecipes;
    private long totalMealPlans;
    private Map<String, Long> dietDistribution;

    public AdminStatsDTO(long totalUsers, long totalSavedRecipes, long totalCustomRecipes, long totalMealPlans, Map<String, Long> dietDistribution) {
        this.totalUsers = totalUsers;
        this.totalSavedRecipes = totalSavedRecipes;
        this.totalCustomRecipes = totalCustomRecipes;
        this.totalMealPlans = totalMealPlans;
        this.dietDistribution = dietDistribution;
    }
}