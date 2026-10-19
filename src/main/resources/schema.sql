-- Ukhanyiso: iteration 0 data model (portable SQL; tested in SQLite).
-- Rule: every fact a learner can see (APS, subject, date) points to a row in `sources`.

CREATE TABLE sources (
                         source_id        TEXT PRIMARY KEY,
                         institution_id   TEXT,
                         course_id        TEXT,                      -- NULL for institution-level facts
                         field            TEXT NOT NULL,             -- 'min_aps' | 'closing_date' | 'aps_method'
                         value_recorded   TEXT NOT NULL,
                         official_link    TEXT NOT NULL,
                         source_type      TEXT NOT NULL,             -- 'official' | 'secondary' | 'none'
                         date_checked     DATE NOT NULL,
                         checked_by       TEXT NOT NULL,
                         status           TEXT NOT NULL              -- 'verified' | 'partial' | 'unverified' | 'conflicting' | 'stale'
);

CREATE TABLE institutions (
                              institution_id       TEXT PRIMARY KEY,      -- 'UJ', 'UP', 'TUT'
                              name                 TEXT NOT NULL,
                              inst_type            TEXT NOT NULL,         -- 'university' | 'university_of_technology'
                              aps_method           TEXT NOT NULL,         -- 'BEST6_EXCL_LO' | 'ALL_EXCL_LO' | 'CUSTOM'
                              aps_method_verified  INTEGER NOT NULL DEFAULT 0,  -- 0 = confirm before trusting; results carry a caveat
                              aps_method_note      TEXT,
                              apply_url            TEXT NOT NULL,
                              app_fee_rand         INTEGER,               -- NULL = unknown, 0 = free
                              source_id            TEXT REFERENCES sources(source_id)
);

CREATE TABLE courses (
                         course_id        TEXT PRIMARY KEY,          -- e.g. 'UJ-BCOM-ACC'
                         institution_id   TEXT NOT NULL REFERENCES institutions(institution_id),
                         name             TEXT NOT NULL,             -- as published
                         course_code      TEXT,                      -- prospectus code if published
                         qualification    TEXT NOT NULL,             -- 'bachelor' | 'diploma' | 'higher_certificate'
                         faculty          TEXT,
                         min_aps          INTEGER,                   -- default/lowest APS; NULL = not published -> CANNOT_CHECK
                         closing_date     DATE,                      -- NULL = unknown
                         closing_time     TIME,                      -- e.g. UJ closes at 12:00
                         course_url       TEXT NOT NULL,             -- official programme page or prospectus PDF
                         intake_year      INTEGER NOT NULL,
                         source_id        TEXT NOT NULL REFERENCES sources(source_id)
);

CREATE TABLE subjects (
                          subject_id       TEXT PRIMARY KEY,
                          name             TEXT NOT NULL,
                          counts_in_aps    INTEGER NOT NULL DEFAULT 1 -- 0 for Life Orientation
);

-- One row per accepted subject. Same group_id = "any one of these" (OR); different groups = AND.
-- aps_required: if this alternative is the one the learner satisfies, the course needs THIS APS
--   instead of courses.min_aps (e.g. UJ LLB: 31 with Maths, 32 with Maths Literacy).
-- min_percent: only for courses that publish a % instead of a level (e.g. UP 5-year BEng: 65%).
CREATE TABLE course_requirements (
                                     req_id           INTEGER PRIMARY KEY,
                                     course_id        TEXT NOT NULL REFERENCES courses(course_id),
                                     group_id         INTEGER NOT NULL,
                                     subject_id       TEXT NOT NULL REFERENCES subjects(subject_id),
                                     min_level        INTEGER NOT NULL CHECK (min_level BETWEEN 1 AND 7),
                                     aps_required     INTEGER,
                                     min_percent      INTEGER,
                                     source_id        TEXT NOT NULL REFERENCES sources(source_id)
);

CREATE TABLE match_config (
                              aps_tolerance        INTEGER NOT NULL DEFAULT 2,
                              level_tolerance      INTEGER NOT NULL DEFAULT 1,
                              max_gaps_for_near    INTEGER NOT NULL DEFAULT 1,
                              closing_soon_days    INTEGER NOT NULL DEFAULT 14,
                              likely_aps_margin    INTEGER NOT NULL DEFAULT 3   -- APS points above cut-off needed for 'Likely'
);