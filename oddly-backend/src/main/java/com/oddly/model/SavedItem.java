package com.oddly.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SavedItem {

    private String id;
    private String type;
    private String title;
    private String subtitle;
    private List<String> tags;
    private String description;
    private String url;
    private LocalDateTime savedAt = LocalDateTime.now();
}