#!/usr/bin/env bash
# Backs up the H2 file database used by Ukhanyiso.
# Uses the H2 SCRIPT command, which is safe to run even while the app is running.
#
# Usage: scripts/backup_db.sh [backup_dir]
# Defaults to ./data/backups. Keeps the 10 most recent backups.
set -euo pipefail

cd "$(dirname "$0")/.."

BACKUP_DIR="${1:-data/backups}"
DB_PATH="data/ukhanyiso"
KEEP=10

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/ukhanyiso-$STAMP.sql.zip"

H2_JAR="$(find "${H2_JAR_DIR:-$HOME/.m2/repository/com/h2database}" -name 'h2-*.jar' ! -name '*sources*' ! -name '*javadoc*' | sort | tail -1)"
if [ -z "$H2_JAR" ]; then
    echo "Error: H2 jar not found. Build the project first (mvn -q compile) or set H2_JAR_DIR." >&2
    exit 1
fi

java -cp "$H2_JAR" org.h2.tools.Script \
    -url "jdbc:h2:file:./$DB_PATH" -user sa -password "" \
    -script "$OUT" -options compression zip

echo "Backup written to $OUT"

# Keep only the newest $KEEP backups
ls -1t "$BACKUP_DIR"/ukhanyiso-*.sql.zip 2>/dev/null | tail -n +$((KEEP + 1)) | while read -r old; do
    rm "$old"
    echo "Removed old backup $old"
done
