package za.ukhanyiso;

import io.javalin.Javalin;
import io.javalin.http.staticfiles.Location;

import java.util.Map;

public class App {
    public static void main(String[] args) throws Exception {
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "7070"));

        Db.init();

        Javalin app = Javalin.create(config -> {
            // Serves src/main/resources/public/* (index.html at "/")
            config.staticFiles.add("/public", Location.CLASSPATH);
        });

        app.get("/api/health", ctx -> ctx.json(Map.of(
                "status", "ok",
                "app", "ukhanyiso",
                "sqlite", Db.sqliteVersion()
        )));

        app.exception(Exception.class, (e, ctx) -> {
            e.printStackTrace(); // log details server-side only
            ctx.status(500).json(Map.of("error", "Something went wrong. Please try again."));
        });

        app.start(port);
    }
}
