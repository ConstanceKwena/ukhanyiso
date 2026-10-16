# ukhanyiso
Ukhanyiso helps learners find clear info on courses, entry requirements, application dates and funding after matric. Built by Ubuntu Innovators for the FNB AOTY Hackathon 2026.

## Run locally
1. Install Java 21+ and Maven
2. `mvn clean package`
3. `java -jar target/ukhanyiso.jar`
4. Open http://localhost:7070 and http://localhost:7070/api/health

Optional environment variables (see `.env.example`): `PORT` (default 7070), `DB_PATH` (default `data/ukhanyiso.db`).
