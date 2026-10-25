package com.ukhanyiso.matching.api;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

final class PasswordHasher {
    private static final int SALT_BYTES = 16;
    private static final int KEY_BITS = 256;
    private static final int ITERATIONS = 310_000;
    private static final String ALGORITHM = "PBKDF2WithHmacSHA256";
    private final SecureRandom random = new SecureRandom();

    Credentials hash(char[] password) {
        byte[] salt = new byte[SALT_BYTES];
        random.nextBytes(salt);
        return new Credentials(encode(salt), encode(derive(password, salt)));
    }

    boolean matches(char[] password, Credentials credentials) {
        byte[] salt = decode(credentials.salt());
        byte[] expected = decode(credentials.hash());
        byte[] actual = derive(password, salt);
        return MessageDigest.isEqual(expected, actual);
    }

    private byte[] derive(char[] password, byte[] salt) {
        PBEKeySpec spec = new PBEKeySpec(password, salt, ITERATIONS, KEY_BITS);
        try {
            return SecretKeyFactory.getInstance(ALGORITHM)
                    .generateSecret(spec)
                    .getEncoded();
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Password hashing is unavailable.", exception);
        } finally {
            spec.clearPassword();
        }
    }

    private String encode(byte[] value) {
        return Base64.getEncoder().encodeToString(value);
    }

    private byte[] decode(String value) {
        return Base64.getDecoder().decode(value);
    }

    record Credentials(String salt, String hash) { }
}
