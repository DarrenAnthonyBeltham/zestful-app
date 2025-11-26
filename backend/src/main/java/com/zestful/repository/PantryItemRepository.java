package com.zestful.repository;

import com.zestful.model.PantryItem;
import com.zestful.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PantryItemRepository extends JpaRepository<PantryItem, Long> {
    List<PantryItem> findByUser(User user);
}