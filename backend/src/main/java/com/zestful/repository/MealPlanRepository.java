package com.zestful.repository;

import com.zestful.model.MealPlan;
import com.zestful.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {
    List<MealPlan> findByUser(User user);
    Optional<MealPlan> findByUserAndDayOfWeekAndMealType(User user, String dayOfWeek, String mealType);
}