package com.zestful.payload.edamam;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class EdamamHitDTO {
    private EdamamRecipeDTO recipe;
}