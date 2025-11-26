package com.zestful.payload;

import lombok.Data;

@Data
public class RatingDTO {
    private String recipeId;
    private Integer rating;
    private String comment;
}