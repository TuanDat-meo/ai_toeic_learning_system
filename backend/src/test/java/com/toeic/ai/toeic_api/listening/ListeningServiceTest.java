package com.toeic.ai.toeic_api.listening;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

class ListeningServiceTest {

    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final ListeningService listeningService = new ListeningService(jdbc);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void returnsEmptyCardsWhenListeningTablesContainNoCards() {
        when(jdbc.query(anyString(), org.mockito.ArgumentMatchers.<RowMapper<ListeningDictationCard>>any(),
                any(Object[].class))).thenReturn(List.of());

        assertThat(listeningService.listCards(null)).isEmpty();
    }

    @Test
    void returnsEmptyUnitsWhenNoPartContentHasBeenCreated() {
        when(jdbc.query(anyString(), org.mockito.ArgumentMatchers.<RowMapper<ListeningService.ListeningUnit>>any()))
                .thenReturn(List.of());

        assertThat(listeningService.listUnits()).isEmpty();
    }

    @Test
    void normalizesPartLabelsAcrossFormats() {
        assertThat(ListeningService.canonicalPartLabel("PART_1")).isEqualTo("Part 1");
        assertThat(ListeningService.canonicalPartLabel("part 2")).isEqualTo("Part 2");
        assertThat(ListeningService.canonicalPartLabel("3")).isEqualTo("Part 3");
        assertThat(ListeningService.canonicalPartLabel("Part 4")).isEqualTo("Part 4");
    }

    @Test
    void syncsListeningUnitFromImportPayload() throws Exception {
        when(jdbc.queryForList(anyString(), eq(String.class), any(), any(), any())).thenReturn(List.of());

        var node = objectMapper.readTree("""
                {
                  "recordType": "UNIT",
                  "unitType": "level",
                  "part": "PART_2",
                  "title": "Level 2 – Cơ bản (450–600+)",
                  "targetLevel": "450-600+",
                  "theorySummary": "Nắm chắc từ để hỏi Wh-.",
                  "rules": ["Nghe kỹ từ đầu tiên."],
                  "audioUrl": "https://cdn.example.com/q7.mp3",
                  "transcript": "How old is this building?"
                }
                """);

        listeningService.syncFromImportItem(node);

        verify(jdbc).update(
                anyString(),
                anyString(),
                eq("Part 2"),
                eq("level"),
                eq("Level 2 – Cơ bản (450–600+)"),
                eq("450-600+"),
                eq(1),
                eq("Nắm chắc từ để hỏi Wh-."),
                anyString(),
                anyString(),
                anyString()
        );
    }

    @Test
    void savesListeningUnitProgressForAuthenticatedUser() {
        UUID userId = UUID.randomUUID();
        var req = new ListeningService.SaveListeningUnitProgressRequest(
                "p1-l1", 5, 10, 4, 1, List.of(102), List.of(101, 102, 103, 104, 105), "IN_PROGRESS", 4);

        listeningService.saveUnitProgress(userId, req);

        verify(jdbc).update(
                anyString(),
                eq(userId),
                eq("p1-l1"),
                eq(5),
                eq(10),
                eq(4),
                eq(1),
                eq("[102]"),
                eq("[101,102,103,104,105]"),
                eq("IN_PROGRESS"),
                eq(4)
        );
    }
}
