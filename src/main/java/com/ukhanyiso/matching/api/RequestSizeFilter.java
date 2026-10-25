package com.ukhanyiso.matching.api;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;

@Component
public class RequestSizeFilter extends OncePerRequestFilter {

    static final long MAX_API_BYTES = 16_384;
    static final long MAX_MATCH_BYTES = 4_096;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {

        long limit = "/api/match".equals(request.getRequestURI())
                ? MAX_MATCH_BYTES
                : MAX_API_BYTES;

        // Reject known oversized bodies before reading them.
        if (request.getContentLengthLong() > limit) {
            writeTooLarge(response);
            return;
        }

        // Also enforce the limit when Content-Length is absent (for example,
        // chunked requests). Buffer at most limit + 1 bytes before dispatching.
        if (mayHaveBody(request)) {
            byte[] body = readBounded(request, limit);
            if (body == null) {
                writeTooLarge(response);
                return;
            }
            chain.doFilter(new BufferedBodyRequest(request, body), response);
            return;
        }

        chain.doFilter(request, response);
    }

    private static boolean mayHaveBody(HttpServletRequest request) {
        String method = request.getMethod();
        return "POST".equalsIgnoreCase(method)
                || "PUT".equalsIgnoreCase(method)
                || "PATCH".equalsIgnoreCase(method)
                || "DELETE".equalsIgnoreCase(method);
    }

    /** Returns null when the request exceeds the configured limit. */
    private static byte[] readBounded(HttpServletRequest request, long limit) throws IOException {
        int maximum = Math.toIntExact(limit);
        ByteArrayOutputStream buffer = new ByteArrayOutputStream(Math.min(maximum, 8192));
        byte[] chunk = new byte[4096];
        int total = 0;
        int count;
        while ((count = request.getInputStream().read(chunk, 0,
                Math.min(chunk.length, maximum + 1 - total))) != -1) {
            total += count;
            if (total > maximum) {
                return null;
            }
            buffer.write(chunk, 0, count);
        }
        return buffer.toByteArray();
    }

    private static void writeTooLarge(HttpServletResponse response) throws IOException {
        response.setStatus(413);
        response.setContentType("application/json");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("{\"errors\":[\"That request is too large.\"]}");
    }

    private static final class BufferedBodyRequest extends HttpServletRequestWrapper {
        private final byte[] body;

        private BufferedBodyRequest(HttpServletRequest request, byte[] body) {
            super(request);
            this.body = body;
        }

        @Override
        public int getContentLength() {
            return body.length;
        }

        @Override
        public long getContentLengthLong() {
            return body.length;
        }

        @Override
        public ServletInputStream getInputStream() {
            ByteArrayInputStream input = new ByteArrayInputStream(body);
            return new ServletInputStream() {
                @Override
                public int read() {
                    return input.read();
                }

                @Override
                public boolean isFinished() {
                    return input.available() == 0;
                }

                @Override
                public boolean isReady() {
                    return true;
                }

                @Override
                public void setReadListener(ReadListener readListener) {
                    throw new IllegalStateException("Non-blocking reads are not supported by this wrapper.");
                }
            };
        }

        @Override
        public BufferedReader getReader() {
            Charset charset;
            try {
                charset = Charset.forName(getCharacterEncoding());
            } catch (Exception ex) {
                charset = StandardCharsets.UTF_8;
            }
            return new BufferedReader(new InputStreamReader(getInputStream(), charset));
        }
    }
}
