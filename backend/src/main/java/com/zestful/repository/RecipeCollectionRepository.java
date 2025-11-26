package com.zestful.repository;

import com.zestful.model.RecipeCollection;
import com.zestful.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeCollectionRepository extends JpaRepository<RecipeCollection, Long> {
    List<RecipeCollection> findByUser(User user);
}