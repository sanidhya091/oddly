package com.oddly.dto;

import lombok.Data;
import java.util.List;

@Data
public class RecRequest {
    private String input;
    private List<String> answers;
    private List<Message> messages;

    @Data
    public static class Message {
        private String role;
        private String content;
    }
}