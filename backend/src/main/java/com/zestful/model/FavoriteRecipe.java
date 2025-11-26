package com.zestful.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "favorite_recipes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "recipeUri"})
})
@Data
public class FavoriteRecipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String recipeUri;

    @Column(nullable = false)
    private String label;

    @Column(length = 1000)
    private String imageUrl;

    private Double calories;
}