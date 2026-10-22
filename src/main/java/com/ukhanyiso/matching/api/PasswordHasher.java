package com.ukhanyiso.matching.api;

import org.springframework.stereotype.Component;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;

/** PBKDF2 password hashing; plaintext passwords are never stored. */
@Component
public final class PasswordHasher {
    private static final String ALGORITHM = "PBKDF2WithHmacSHA256";
    private static final int ITERATIONS = 120_000;
    private static final int KEY_BITS = 256;
    private static final int SALT_BYTES = 16;
    private final SecureRandom random = new SecureRandom();

    public String hash(String password) {
        byte[] salt = new byte[SALT_BYTES];
        random.nextBytes(salt);
        return encode(salt, derive(password, salt));
    }

    public boolean matches(String password, String encoded) {
        if (password == null || encoded == null) return false;
        try {
            String[] parts = encoded.split("\\$", -1);
            if (parts.length != 3 || !Integer.toString(ITERATIONS).equals(parts[0])) return false;
            byte[] salt = Base64.getDecoder().decode(parts[1]);
            byte[] expected = Base64.getDecoder().decode(parts[2]);
            byte[] actual = derive(password, salt);
            return java.security.MessageDigest.isEqual(expected, actual);
        } catch (RuntimeException e) {
            return false;
        }
    }

    private byte[] derive(String password, byte[] salt) {
        try {
            return SecretKeyFactory.getInstance(ALGORITHM)
                    .generateSecret(new PBEKeySpec(password.toCharArray(), salt, ITERATIONS, KEY_BITS))
                    .getEncoded();
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Password hashing is unavailable", e);
        }
    }

    private static String encode(byte[] salt, byte[] key) {
        return ITERATIONS + "$" + Base64.getEncoder().encodeToString(salt)
                + "$" + Base64.getEncoder().encodeToString(key);
    }
}
