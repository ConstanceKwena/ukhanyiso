package com.ukhanyiso.matching;

import com.ukhanyiso.matching.model.MatchingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MatchingRepository extends JpaRepository<MatchingRecord, Long> {
}
