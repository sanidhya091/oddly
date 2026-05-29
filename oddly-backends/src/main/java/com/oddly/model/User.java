package com.oddly.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String password; // stored hashed

    private String handle;

    private LocalDateTime joinedDate = LocalDateTime.now();

    private int discoveries = 0;
    private int streak = 0;
    
    private LocalDateTime lastActiveDate;

    private List<SavedItem> savedItems = new ArrayList<>();
    private List<Collection> collections = new ArrayList<>();
}