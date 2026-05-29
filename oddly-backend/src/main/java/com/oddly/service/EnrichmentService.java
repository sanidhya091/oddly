package com.oddly.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
@RequiredArgsConstructor
public class EnrichmentService {

    @Value("${lastfm.api.key}")
    private String lastfmKey;

    @Value("${omdb.api.key}")
    private String omdbKey;

    private final WebClient webClient = WebClient.create();
    private final ObjectMapper mapper = new ObjectMapper();

    // ── Main entry point ─────────────────────────────────────────────────────
    // Takes a single rec JsonNode, returns it enriched with imageUrl, rating, externalUrl
    public JsonNode enrich(JsonNode rec) {
        try {
            String type = rec.path("type").asText("").toLowerCase();
            String title = rec.path("title").asText("");
            String subtitle = rec.path("subtitle").asText("");

            ObjectNode enriched = rec.deepCopy();

            switch (type) {
                case "music"   -> enrichMusic(enriched, title, subtitle);
                case "film"    -> enrichFilm(enriched, title);
                case "book"    -> enrichBook(enriched, title);
                case "podcast" -> enrichPodcast(enriched, title);
                // experience / product — no external API, leave as-is
                default        -> {}
            }

            return enriched;
        } catch (Exception e) {
            log.warn("Enrichment failed for rec '{}': {}", rec.path("title").asText(), e.getMessage());
            return rec; // always return original if enrichment fails
        }
    }

    // ── Music → Last.fm ──────────────────────────────────────────────────────
    private void enrichMusic(ObjectNode rec, String title, String subtitle) {
        try {
            // subtitle is usually "Artist Name" or "Artist Name · Album"
            String artist = subtitle.contains("·")
                    ? subtitle.split("·")[0].trim()
                    : subtitle.trim();

            String url = String.format(
                    "http://ws.audioscrobbler.com/2.0/?method=album.search&album=%s&artist=%s&api_key=%s&format=json&limit=1",
                    encode(title), encode(artist), lastfmKey
            );

            String response = webClient.get().uri(url)
                    .retrieve().bodyToMono(String.class).block();

            JsonNode root = mapper.readTree(response);
            JsonNode albums = root.path("results").path("albummatches").path("album");

            if (albums.isArray() && albums.size() > 0) {
                JsonNode album = albums.get(0);
                String imageUrl = getLargestLastfmImage(album.path("image"));
                String lastfmUrl = album.path("url").asText("");

                if (!imageUrl.isEmpty()) rec.put("imageUrl", imageUrl);
                if (!lastfmUrl.isEmpty() && rec.path("url").asText("").isEmpty()) {
                    rec.put("url", lastfmUrl);
                }
                rec.put("externalSource", "Last.fm");
            }
        } catch (Exception e) {
            log.debug("Last.fm enrichment failed: {}", e.getMessage());
        }
    }

    private String getLargestLastfmImage(JsonNode images) {
        String[] sizes = {"extralarge", "large", "medium", "small"};
        for (String size : sizes) {
            for (JsonNode img : images) {
                if (size.equals(img.path("size").asText()) && !img.path("#text").asText().isEmpty()) {
                    return img.path("#text").asText();
                }
            }
        }
        return "";
    }

    // ── Film → OMDb ──────────────────────────────────────────────────────────
    private void enrichFilm(ObjectNode rec, String title) {
        try {
            String url = String.format(
                    "http://www.omdbapi.com/?t=%s&apikey=%s",
                    encode(title), omdbKey
            );

            String response = webClient.get().uri(url)
                    .retrieve().bodyToMono(String.class).block();

            JsonNode root = mapper.readTree(response);

            if ("True".equals(root.path("Response").asText())) {
                String poster = root.path("Poster").asText("");
                String rating = root.path("imdbRating").asText("");
                String imdbId = root.path("imdbID").asText("");

                if (!poster.isEmpty() && !"N/A".equals(poster)) rec.put("imageUrl", poster);
                if (!rating.isEmpty() && !"N/A".equals(rating))  rec.put("rating", rating + " IMDb");
                if (!imdbId.isEmpty()) {
                    String imdbUrl = "https://www.imdb.com/title/" + imdbId;
                    if (rec.path("url").asText("").isEmpty()) rec.put("url", imdbUrl);
                }
                rec.put("externalSource", "IMDb");
            }
        } catch (Exception e) {
            log.debug("OMDb enrichment failed: {}", e.getMessage());
        }
    }

    // ── Book → Open Library ──────────────────────────────────────────────────
    private void enrichBook(ObjectNode rec, String title) {
        try {
            String url = String.format(
                    "https://openlibrary.org/search.json?title=%s&limit=1&fields=key,title,author_name,cover_i,editions",
                    encode(title)
            );

            String response = webClient.get().uri(url)
                    .retrieve().bodyToMono(String.class).block();

            JsonNode root = mapper.readTree(response);
            JsonNode docs = root.path("docs");

            if (docs.isArray() && docs.size() > 0) {
                JsonNode book = docs.get(0);
                long coverId = book.path("cover_i").asLong(0);
                String key = book.path("key").asText("");

                if (coverId > 0) {
                    rec.put("imageUrl", "https://covers.openlibrary.org/b/id/" + coverId + "-L.jpg");
                }
                if (!key.isEmpty() && rec.path("url").asText("").isEmpty()) {
                    rec.put("url", "https://openlibrary.org" + key);
                }
                rec.put("externalSource", "Open Library");
            }
        } catch (Exception e) {
            log.debug("Open Library enrichment failed: {}", e.getMessage());
        }
    }

    // ── Podcast → iTunes ─────────────────────────────────────────────────────
    private void enrichPodcast(ObjectNode rec, String title) {
        try {
            String url = String.format(
                    "https://itunes.apple.com/search?term=%s&media=podcast&limit=1",
                    encode(title)
            );

            String response = webClient.get().uri(url)
                    .retrieve().bodyToMono(String.class).block();

            JsonNode root = mapper.readTree(response);
            JsonNode results = root.path("results");

            if (results.isArray() && results.size() > 0) {
                JsonNode podcast = results.get(0);
                String artwork = podcast.path("artworkUrl600").asText(
                        podcast.path("artworkUrl100").asText("")
                );
                String trackUrl = podcast.path("collectionViewUrl").asText("");

                if (!artwork.isEmpty())   rec.put("imageUrl", artwork);
                if (!trackUrl.isEmpty() && rec.path("url").asText("").isEmpty()) {
                    rec.put("url", trackUrl);
                }
                rec.put("externalSource", "iTunes");
            }
        } catch (Exception e) {
            log.debug("iTunes enrichment failed: {}", e.getMessage());
        }
    }

    // ── Util ─────────────────────────────────────────────────────────────────
    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}