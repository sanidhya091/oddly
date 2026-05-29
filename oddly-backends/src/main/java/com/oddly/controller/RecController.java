package com.oddly.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.oddly.dto.RecRequest;
import com.oddly.service.ClaudeService;
import com.oddly.service.EnrichmentService;
import com.oddly.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/recs")
@RequiredArgsConstructor
public class RecController {

    private final ClaudeService claudeService;
    private final EnrichmentService enrichmentService;
    private final UserService userService;
    private final ObjectMapper mapper = new ObjectMapper();

    // ── Quiz ─────────────────────────────────────────────────────────────────
    @PostMapping("/quiz")
    public ResponseEntity<String> quizRecs(@RequestBody RecRequest req, Authentication auth) {
        userService.recordActivity(auth.getName());
        String raw = claudeService.getQuizRecs(req.getAnswers());
        return ResponseEntity.ok(enrichArray(raw));
    }

    // ── Taste Match ──────────────────────────────────────────────────────────
    @PostMapping("/taste-match")
    public ResponseEntity<String> tasteMatchRecs(@RequestBody RecRequest req, Authentication auth) {
        userService.recordActivity(auth.getName());
        String raw = claudeService.getTasteMatchRecs(req.getInput());
        return ResponseEntity.ok(enrichArray(raw));
    }

    // ── Serendipity ──────────────────────────────────────────────────────────
    @GetMapping("/serendipity")
    public ResponseEntity<String> serendipityRec(Authentication auth) {
        userService.recordActivity(auth.getName());
        String raw = claudeService.getSerendipityRec();
        return ResponseEntity.ok(enrichSingle(raw));
    }

    // ── Chat ─────────────────────────────────────────────────────────────────
    @PostMapping("/chat")
    public ResponseEntity<String> chat(@RequestBody Map<String, Object> body, Authentication auth) {
        List<Map<String, String>> messages = (List<Map<String, String>>) body.get("messages");
        userService.recordActivity(auth.getName());
        String raw = claudeService.getChatResponse(messages);
        log.info("GROQ CHAT RAW: {}", raw);
        return ResponseEntity.ok(enrichChatRecs(raw));
    }

    // ── Enrichment helpers ───────────────────────────────────────────────────

    // Enriches a JSON array of recs (Quiz, TasteMatch)
    private String enrichArray(String raw) {
        try {
            String clean = clean(raw);
            JsonNode array = mapper.readTree(clean);
            if (!array.isArray()) return raw;

            ArrayNode enriched = mapper.createArrayNode();
            for (JsonNode rec : array) {
                enriched.add(enrichmentService.enrich(rec));
            }
            return mapper.writeValueAsString(enriched);
        } catch (Exception e) {
            log.warn("enrichArray failed, returning raw: {}", e.getMessage());
            return raw;
        }
    }

    // Enriches a single JSON object (Serendipity)
    private String enrichSingle(String raw) {
        try {
            String clean = clean(raw);
            JsonNode rec = mapper.readTree(clean);
            return mapper.writeValueAsString(enrichmentService.enrich(rec));
        } catch (Exception e) {
            log.warn("enrichSingle failed, returning raw: {}", e.getMessage());
            return raw;
        }
    }

    // Enriches recs inside chat response { reply, recs: [] }
    private String enrichChatRecs(String raw) {
        try {
            String clean = clean(raw);
            JsonNode root = mapper.readTree(clean);
            if (!root.has("recs") || !root.path("recs").isArray()) return raw;

            ArrayNode enrichedRecs = mapper.createArrayNode();
            for (JsonNode rec : root.path("recs")) {
                enrichedRecs.add(enrichmentService.enrich(rec));
            }

            // Rebuild the response object with enriched recs
            ObjectMapper om = new ObjectMapper();
            var result = om.createObjectNode();
            result.put("reply", root.path("reply").asText(""));
            result.set("recs", enrichedRecs);
            return om.writeValueAsString(result);
        } catch (Exception e) {
            log.warn("enrichChatRecs failed, returning raw: {}", e.getMessage());
            return raw;
        }
    }

    // Strip markdown code fences Groq sometimes adds
    private String clean(String raw) {
        return raw.replaceAll("```json", "").replaceAll("```", "").trim();
    }
}