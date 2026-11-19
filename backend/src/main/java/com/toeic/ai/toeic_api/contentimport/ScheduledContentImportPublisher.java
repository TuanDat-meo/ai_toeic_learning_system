package com.toeic.ai.toeic_api.contentimport;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ScheduledContentImportPublisher {
    private static final Logger logger = LoggerFactory.getLogger(ScheduledContentImportPublisher.class);

    private final ContentImportService importService;

    public ScheduledContentImportPublisher(ContentImportService importService) {
        this.importService = importService;
    }

    @Scheduled(fixedDelayString = "${app.content-import.schedule-poll-ms:30000}")
    public void publishDueBatches() {
        for (var batchId : importService.listScheduledBatches()) {
            try {
                importService.publishScheduledBatch(batchId);
            } catch (RuntimeException exception) {
                logger.error("Scheduled content import publication failed for batch {}", batchId, exception);
            }
        }
    }
}
