package com.oddly.security;

import org.springframework.stereotype.Component;

/**
 * Validates and sanitizes user inputs before they hit the database.
 * Prevents injection attacks and enforces field constraints.
 */
@Component
public class InputValidator {

    // ── Email ─────────────────────────────────────────────────────────────────
    public void validateEmail(String email) {
        if (email == null || email.isBlank())
            throw new IllegalArgumentException("Email is required");
        if (email.length() > 254)
            throw new IllegalArgumentException("Email is too long");
        if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$"))
            throw new IllegalArgumentException("Invalid email format");
    }

    // ── Password ──────────────────────────────────────────────────────────────
    public void validatePassword(String password) {
        if (password == null || password.isBlank())
            throw new IllegalArgumentException("Password is required");
        if (password.length() < 6)
            throw new IllegalArgumentException("Password must be at least 6 characters");
        if (password.length() > 128)
            throw new IllegalArgumentException("Password is too long");
    }

    // ── Name ──────────────────────────────────────────────────────────────────
    public void validateName(String name) {
        if (name == null || name.isBlank())
            throw new IllegalArgumentException("Name is required");
        if (name.length() > 60)
            throw new IllegalArgumentException("Name is too long");
        // Strip any HTML/script tags
        if (name.matches(".*<[^>]+>.*"))
            throw new IllegalArgumentException("Name contains invalid characters");
    }

    // ── Handle ────────────────────────────────────────────────────────────────
    public void validateHandle(String handle) {
        if (handle == null || handle.isBlank()) return; // optional
        if (handle.length() < 3)
            throw new IllegalArgumentException("Handle must be at least 3 characters");
        if (handle.length() > 30)
            throw new IllegalArgumentException("Handle is too long");
        if (!handle.matches("^[a-z0-9_]+$"))
            throw new IllegalArgumentException("Handle can only contain lowercase letters, numbers and underscores");
    }

    // ── General string sanitizer ──────────────────────────────────────────────
    public String sanitize(String input) {
        if (input == null) return null;
        return input
            .trim()
            .replaceAll("<[^>]*>", "")       // strip HTML tags
            .replaceAll("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F]", ""); // strip control chars
    }
}