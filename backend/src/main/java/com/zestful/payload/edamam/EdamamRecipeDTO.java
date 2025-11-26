package com.zestful.payload.edamam;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class EdamamRecipeDTO {
    private String uri;
    private String label;
    private String image;
    private String url;
    private Double calories;

    private List<String> ingredientLines;
    private Map<String, NutrientDTO> totalNutrients;
    private List<String> dietLabels;
    private List<String> healthLabels;
    private List<String> cautions;
}