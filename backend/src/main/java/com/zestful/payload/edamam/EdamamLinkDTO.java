package com.zestful.payload.edamam;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class EdamamLinkDTO {
    private String href;
    private String title;
}