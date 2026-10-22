package za.ukhanyiso;

import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class Db {
    private static final String DB_PATH = System.getenv().getOrDefault("DB_PATH", "data/ukhanyiso.db");

    public static Connection connect() throws SQLException {
        return DriverManager.getConnection("jdbc:sqlite:" + DB_PATH);
    }

    public static void init() throws Exception {
        Path parent = Path.of(DB_PATH).toAbsolutePath().getParent();
        if (parent != null) Files.createDirectories(parent);
        try (Connection c = connect(); Statement s = c.createStatement()) {
            s.execute("CREATE TABLE IF NOT EXISTS app_info (key TEXT PRIMARY KEY, value TEXT NOT NULL)");
            s.execute("INSERT OR IGNORE INTO app_info (key, value) VALUES ('created_by', 'ukhanyiso-hello-world')");
        }
    }

    public static String sqliteVersion() throws SQLException {
        try (Connection c = connect(); Statement s = c.createStatement();
             ResultSet rs = s.executeQuery("SELECT sqlite_version()")) {
            return rs.next() ? rs.getString(1) : "unknown";
        }
    }
}
