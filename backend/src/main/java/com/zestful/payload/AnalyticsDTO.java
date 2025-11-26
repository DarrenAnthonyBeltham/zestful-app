package com.zestful.payload;

import lombok.Data;
import java.util.Map;

@Data
public class AnalyticsDTO {
    private double totalCalories;
    private double totalProtein;
    private double totalCarbs;
    private double totalFat;
    private int totalMeals;
    private Map<String, Double> dailyCalories; 
}