package com.ukhanyiso.matching.api;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public class LearnerMarksRepository {
    private final JdbcTemplate jdbc;

    public LearnerMarksRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<SavedMark> findByUser(String userId) {
        return jdbc.query("SELECT subject, mark FROM learner_marks WHERE user_id = ? ORDER BY subject",
                (rs, row) -> new SavedMark(rs.getString("subject"), rs.getInt("mark")), userId);
    }

    @Transactional
    public void replaceForUser(String userId, List<SavedMark> marks) {
        jdbc.update("DELETE FROM learner_marks WHERE user_id = ?", userId);
        for (SavedMark mark : marks) {
            jdbc.update("INSERT INTO learner_marks (user_id, subject, mark) VALUES (?, ?, ?)",
                    userId, mark.subject(), mark.mark());
        }
    }

    public record SavedMark(String subject, int mark) { }
}
