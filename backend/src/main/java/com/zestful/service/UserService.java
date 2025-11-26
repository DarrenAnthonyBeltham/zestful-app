package com.zestful.service;

import com.zestful.model.User;
import com.zestful.payload.UserPreferencesDTO;
import com.zestful.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    public User updatePreferences(String email, UserPreferencesDTO preferencesDTO) {
        User user = findByEmail(email);
        user.setPreferredDiet(preferencesDTO.getPreferredDiet());
        user.setPreferredHealth(preferencesDTO.getPreferredHealth());
        return userRepository.save(user);
    }
}