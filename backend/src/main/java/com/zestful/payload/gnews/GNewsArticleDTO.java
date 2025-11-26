package com.zestful.payload.gnews;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class GNewsArticleDTO {
    private String title;
    private String description;
    private String url;
    private String image;
}