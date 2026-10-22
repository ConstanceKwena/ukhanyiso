package com.ukhanyiso.bursary;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

/** Read-only access to the fixed bursary list bundled with the application. */
@Repository
public class BursaryRepository {
    private final List<Bursary> bursaries;

    public BursaryRepository(ObjectMapper mapper) {
        try (InputStream in = new ClassPathResource("bursaries.json").getInputStream()) {
            this.bursaries = List.copyOf(mapper.readValue(in, new TypeReference<List<Bursary>>() { }));
        } catch (IOException e) {
            throw new IllegalStateException("Could not read bursaries.json", e);
        }
    }

    public List<Bursary> findAll() {
        return bursaries;
    }
}
