package com.oddly.controller;

import com.oddly.model.Collection;
import com.oddly.model.SavedItem;
import com.oddly.model.User;
import com.oddly.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<User> getProfile(Authentication auth) {
        return ResponseEntity.ok(userService.getByEmail(auth.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(Authentication auth, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(userService.updateProfile(auth.getName(), body.get("name"), body.get("handle")));
    }

    @GetMapping("/me/saved")
    public ResponseEntity<List<SavedItem>> getSaved(Authentication auth) {
        return ResponseEntity.ok(userService.getSavedItems(auth.getName()));
    }

    @PostMapping("/me/saved")
    public ResponseEntity<SavedItem> saveItem(Authentication auth, @RequestBody SavedItem item) {
        return ResponseEntity.ok(userService.saveItem(auth.getName(), item));
    }

    @DeleteMapping("/me/saved/{itemId}")
    public ResponseEntity<Void> unsaveItem(Authentication auth, @PathVariable String itemId) {
        userService.unsaveItem(auth.getName(), itemId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/collections")
    public ResponseEntity<List<Collection>> getCollections(Authentication auth) {
        return ResponseEntity.ok(userService.getCollections(auth.getName()));
    }

    @PostMapping("/me/collections")
    public ResponseEntity<Collection> createCollection(Authentication auth, @RequestBody Collection collection) {
        return ResponseEntity.ok(userService.createCollection(auth.getName(), collection));
    }

    @DeleteMapping("/me/collections/{collectionId}")
    public ResponseEntity<Void> deleteCollection(Authentication auth, @PathVariable String collectionId) {
        userService.deleteCollection(auth.getName(), collectionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/me/collections/{collectionId}/items")
    public ResponseEntity<Void> addToCollection(Authentication auth,
                                                 @PathVariable String collectionId,
                                                 @RequestBody Map<String, String> body) {
        userService.addToCollection(auth.getName(), collectionId, body.get("itemId"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/me/collections/{collectionId}/items/{itemId}")
    public ResponseEntity<Void> removeFromCollection(Authentication auth,
                                                      @PathVariable String collectionId,
                                                      @PathVariable String itemId) {
        userService.removeFromCollection(auth.getName(), collectionId, itemId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/stats")
    public ResponseEntity<Map<String, Integer>> getStats(Authentication auth) {
        return ResponseEntity.ok(userService.getStats(auth.getName()));
    }
}