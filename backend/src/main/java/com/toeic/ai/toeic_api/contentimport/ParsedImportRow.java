package com.toeic.ai.toeic_api.contentimport;

import com.fasterxml.jackson.databind.JsonNode;

public record ParsedImportRow(int rowNumber, JsonNode data) { }
