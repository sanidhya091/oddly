package com.oddly.controller;

import com.oddly.dto.RecRequest;
import com.oddly.service.ClaudeService;
import com.oddly.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recs")
@RequiredArgsConstructor
public class RecController {

    private final ClaudeService claudeService;
    private final UserService userService;

    @PostMapping("/quiz")
    public ResponseEntity<String> quizRecs(@RequestBody RecRequest req, Authentication auth) {
        userService.recordActivity(auth.getName());
        return ResponseEntity.ok(claudeService.getQuizRecs(req.getAnswers()));
    }

    @PostMapping("/taste-match")
    public ResponseEntity<String> tasteMatchRecs(@RequestBody RecRequest req, Authentication auth) {
        userService.recordActivity(auth.getName());
        return ResponseEntity.ok(claudeService.getTasteMatchRecs(req.getInput()));
    }

    @GetMapping("/serendipity")
    public ResponseEntity<String> serendipityRec(Authentication auth) {
        userService.recordActivity(auth.getName());
        return ResponseEntity.ok(claudeService.getSerendipityRec());
    }

    @PostMapping("/chat")
    public ResponseEntity<String> chat(@RequestBody Map<String, Object> body, Authentication auth) {
        List<Map<String, String>> messages = (List<Map<String, String>>) body.get("messages");
        userService.recordActivity(auth.getName());
        String response = claudeService.getChatResponse(messages);
        System.out.println("GROQ CHAT RAW: " + response);
        return ResponseEntity.ok(response);
    }
}