package com.oddly.service;

import com.oddly.model.Collection;
import com.oddly.model.SavedItem;
import com.oddly.model.User;
import com.oddly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateProfile(String email, String name, String handle) {
        User user = getByEmail(email);
        if (name != null) user.setName(name);
        if (handle != null) user.setHandle(handle);
        return userRepository.save(user);
    }

    // ── Saved Items ──────────────────────────────────────────────────────────

    public List<SavedItem> getSavedItems(String email) {
        return getByEmail(email).getSavedItems();
    }

    public SavedItem saveItem(String email, SavedItem item) {
        User user = getByEmail(email);
        item.setId(UUID.randomUUID().toString());
        user.getSavedItems().add(0, item);
        userRepository.save(user);
        return item;
    }

    public void unsaveItem(String email, String itemId) {
        User user = getByEmail(email);
        user.getSavedItems().removeIf(i -> i.getId().equals(itemId));
        userRepository.save(user);
    }

    // ── Collections ──────────────────────────────────────────────────────────

    public List<Collection> getCollections(String email) {
        return getByEmail(email).getCollections();
    }

    public Collection createCollection(String email, Collection collection) {
        User user = getByEmail(email);
        collection.setId(UUID.randomUUID().toString());
        user.getCollections().add(collection);
        userRepository.save(user);
        return collection;
    }

    public void deleteCollection(String email, String collectionId) {
        User user = getByEmail(email);
        user.getCollections().removeIf(c -> c.getId().equals(collectionId));
        userRepository.save(user);
    }

    public void addToCollection(String email, String collectionId, String itemId) {
        User user = getByEmail(email);
        user.getCollections().stream()
                .filter(c -> c.getId().equals(collectionId))
                .findFirst()
                .ifPresent(c -> c.getItemIds().add(itemId));
        userRepository.save(user);
    }

    public void removeFromCollection(String email, String collectionId, String itemId) {
        User user = getByEmail(email);
        user.getCollections().stream()
                .filter(c -> c.getId().equals(collectionId))
                .findFirst()
                .ifPresent(c -> c.getItemIds().remove(itemId));
        userRepository.save(user);
    }

    // ── Stats ────────────────────────────────────────────────────────────────

    public java.util.Map<String, Integer> getStats(String email) {
        User user = getByEmail(email);
        return java.util.Map.of(
                "saved", user.getSavedItems().size(),
                "collections", user.getCollections().size(),
                "discoveries", user.getDiscoveries(),
                "streak", user.getStreak()
        );
    }
    public void recordActivity(String email) {
        User user = getByEmail(email);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime last = user.getLastActiveDate();

        if (last == null) {
            // First time
            user.setStreak(1);
        } else {
            long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(last.toLocalDate(), now.toLocalDate());
            if (daysBetween == 1) {
                // Consecutive day
                user.setStreak(user.getStreak() + 1);
            } else if (daysBetween > 1) {
                // Missed a day — reset
                user.setStreak(1);
            }
            // daysBetween == 0 means same day, streak unchanged
        }

        user.setLastActiveDate(now);
        user.setDiscoveries(user.getDiscoveries() + 1);
        userRepository.save(user);
    }
}