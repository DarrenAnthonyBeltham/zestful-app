package com.zestful.payload.ai;

import lombok.Data;

@Data
public class AiMealPlanItem {
    private String day;      
    private String mealType; 
    private String suggestion; 
}