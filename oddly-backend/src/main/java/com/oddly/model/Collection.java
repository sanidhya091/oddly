package com.oddly.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Collection {

    private String id;
    private String name;
    private String emoji;
    private String color;
    private List<String> itemIds = new ArrayList<>();
}