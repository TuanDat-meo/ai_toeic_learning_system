package com.toeic.ai.toeic_api.listening;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

class ListeningServiceTest {

    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final ListeningService listeningService = new ListeningService(jdbc);

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
}
