package com.ukhanyiso.matching;

import org.junit.jupiter.api.Test;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class SourceVerificationTest {

    @Test
    public void verifySourceSheetExistsAndHasContent() throws Exception {
        Path sourceSheetPath = Paths.get("src/main/resources/source_sheet.csv");
        if (!Files.exists(sourceSheetPath)) {
            sourceSheetPath = Paths.get("iteration-0/data/source_sheet.csv");
        }

        assertTrue(Files.exists(sourceSheetPath), "source_sheet.csv must exist to provide official data row sources.");
        
        List<String> lines = Files.readAllLines(sourceSheetPath);
        assertTrue(lines.size() > 1, "source_sheet.csv must contain a header and official source rows.");
    }
}
