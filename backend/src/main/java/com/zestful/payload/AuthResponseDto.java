package com.zestful.payload;

import lombok.Data;

@Data
public class AuthResponseDto {
    private String accessToken;
    private String tokenType = "Bearer";
    private String role;

    public AuthResponseDto(String accessToken, String role) {
        this.accessToken = accessToken;
        this.role = role;
    }
}