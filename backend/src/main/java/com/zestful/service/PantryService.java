package com.zestful.service;

import com.zestful.model.PantryItem;
import com.zestful.model.User;
import com.zestful.repository.PantryItemRepository;
import com.zestful.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PantryService {

    private final PantryItemRepository pantryItemRepository;
    private final UserRepository userRepository;

    public PantryService(PantryItemRepository pantryItemRepository, UserRepository userRepository) {
        this.pantryItemRepository = pantryItemRepository;
        this.userRepository = userRepository;
    }

    public List<PantryItem> getPantryItems(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return pantryItemRepository.findByUser(user);
    }

    public PantryItem addItem(String name, LocalDate expirationDate, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        PantryItem item = new PantryItem();
        item.setName(name);
        item.setExpirationDate(expirationDate);
        item.setUser(user);
        return pantryItemRepository.save(item);
    }

    public void deleteItem(Long id, String userEmail) {
        PantryItem item = pantryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        
        if (!item.getUser().getEmail().equals(userEmail)) {
            throw new SecurityException("Not authorized");
        }
        pantryItemRepository.delete(item);
    }
}