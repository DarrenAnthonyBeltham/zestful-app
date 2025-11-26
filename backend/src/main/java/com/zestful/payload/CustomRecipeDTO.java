package com.zestful.payload;

import lombok.Data;
import java.util.List;

@Data
public class CustomRecipeDTO {
    private String title;
    private String instructions;
    private String imageUrl;
    private List<String> ingredients;
}