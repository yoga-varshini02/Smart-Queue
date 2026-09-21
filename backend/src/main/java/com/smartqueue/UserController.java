package com.smartqueue;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public UserController(
            UserRepository userRepository,
            TokenRepository tokenRepository) {

        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
    }

    // =========================
    // LOGIN
    // =========================
    @PostMapping("/login")
    public User login(@RequestBody User user) {

        // INPUT VALIDATION
        if (user.getEmail() == null ||
                user.getEmail().isBlank()) {

            throw new RuntimeException(
                    "Email is required"
            );
        }

        if (user.getPassword() == null ||
                user.getPassword().isBlank()) {

            throw new RuntimeException(
                    "Password is required"
            );
        }

        User existingUser =
                userRepository.findByEmail(
                        user.getEmail()
                );

        if (existingUser == null) {
            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        String storedPassword =
                existingUser.getPassword();

        // OLD PASSWORD SUPPORT
        if (
                storedPassword != null &&
                !storedPassword.startsWith("$2a$") &&
                !storedPassword.startsWith("$2b$") &&
                !storedPassword.startsWith("$2y$")
        ) {

            if (
                    storedPassword.equals(
                            user.getPassword()
                    )
            ) {

                String hashedPassword =
                        passwordEncoder.encode(
                                user.getPassword()
                        );

                existingUser.setPassword(
                        hashedPassword
                );

                userRepository.save(
                        existingUser
                );

                return existingUser;
            }

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        // BCRYPT PASSWORD
        if (
                passwordEncoder.matches(
                        user.getPassword(),
                        storedPassword
                )
        ) {

            return existingUser;
        }

        throw new RuntimeException(
                "Invalid email or password"
        );
    }

    // =========================
    // REGISTER
    // =========================
    @PostMapping("/register")
    public String register(
            @RequestBody User user) {

        // INPUT VALIDATION

        if (user.getEmail() == null ||
                user.getEmail().isBlank()) {

            throw new RuntimeException(
                    "Email is required"
            );
        }

        if (user.getPassword() == null ||
                user.getPassword().isBlank()) {

            throw new RuntimeException(
                    "Password is required"
            );
        }

        if (!user.getEmail().matches(
                "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {

            throw new RuntimeException(
                    "Invalid email format"
            );
        }

        if (user.getPassword().length() < 6) {

            throw new RuntimeException(
                    "Password must be at least 6 characters"
            );
        }

        User existingUser =
                userRepository.findByEmail(
                        user.getEmail()
                );

        if (existingUser != null) {
            return "Email already registered";
        }

        // DEFAULT USER ROLE
        user.setRole("USER");

        // PASSWORD HASHING
        String hashedPassword =
                passwordEncoder.encode(
                        user.getPassword()
                );

        user.setPassword(
                hashedPassword
        );

        userRepository.save(user);

        return "Registration successful";
    }

    // =========================
    // GET USER
    // =========================
    @GetMapping("/user/{email}")
    public User getUser(
            @PathVariable String email) {

        User user =
                userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException(
                    "User not found"
            );
        }

        return user;
    }

    // =========================
    // GENERATE TOKEN
    // =========================
    @PostMapping("/token")
    public Token generateToken(
            @RequestBody Token token) {

        if (token.getUserId() == null) {
            throw new RuntimeException(
                    "User ID is required"
            );
        }

        Optional<Token> existingToken =
                tokenRepository
                        .findFirstByUserIdAndStatusIn(
                                token.getUserId(),
                                List.of(
                                        "WAITING",
                                        "SERVING"
                                )
                        );

        // DUPLICATE TOKEN PREVENTION
        if (existingToken.isPresent()) {
            return existingToken.get();
        }

        int nextTokenNumber =
                tokenRepository.findAll()
                        .stream()
                        .mapToInt(
                                Token::getTokenNumber
                        )
                        .max()
                        .orElse(0) + 1;

        token.setTokenNumber(
                nextTokenNumber
        );

        token.setIssueDate(
                LocalDate.now()
        );

        token.setStatus(
                "WAITING"
        );

        return tokenRepository.save(token);
    }

    // =========================
    // TOKEN HISTORY
    // =========================
    @GetMapping("/token/history/{userId}")
    public List<Token> getTokenHistory(
            @PathVariable Integer userId) {

        if (userId == null) {
            throw new RuntimeException(
                    "User ID is required"
            );
        }

        return tokenRepository
                .findByUserIdOrderByTokenIdDesc(
                        userId
                );
    }

    // =========================
    // PEOPLE AHEAD
    // =========================
    @GetMapping(
            "/queue/people-ahead/{tokenNumber}"
    )
    public long getPeopleAhead(
            @PathVariable Integer tokenNumber) {

        if (tokenNumber == null ||
                tokenNumber <= 0) {

            throw new RuntimeException(
                    "Invalid token number"
            );
        }

        return tokenRepository
                .countByTokenNumberLessThanAndStatus(
                        tokenNumber,
                        "WAITING"
                );
    }

    // =========================
    // WAITING TOKENS
    // =========================
    @GetMapping("/queue/waiting")
    public List<Token> getWaitingTokens() {

        return tokenRepository
                .findByStatusOrderByTokenNumberAsc(
                        "WAITING"
                );
    }

    // =========================
    // SERVING TOKENS
    // =========================
    @GetMapping("/queue/serving")
    public List<Token> getServingTokens() {

        return tokenRepository
                .findByStatus(
                        "SERVING"
                );
    }

    // =========================
    // GET TOKEN
    // =========================
    @GetMapping("/token/{tokenNumber}/{userId}")
    public Token getToken(
            @PathVariable Integer tokenNumber,
            @PathVariable Integer userId) {

        if (tokenNumber == null ||
                tokenNumber <= 0) {

            throw new RuntimeException(
                    "Invalid token number"
            );
        }

        if (userId == null ||
                userId <= 0) {

            throw new RuntimeException(
                    "Invalid user ID"
            );
        }

        return tokenRepository
                .findByTokenNumberAndUserId(
                        tokenNumber,
                        userId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Token not found"
                        ));
    }

    // =========================
    // UPDATE TOKEN STATUS
    // =========================
    @PutMapping(
            "/token/{tokenNumber}/status"
    )
    public String updateTokenStatus(
            @PathVariable Integer tokenNumber,
            @RequestParam String status) {

        if (tokenNumber == null ||
                tokenNumber <= 0) {

            throw new RuntimeException(
                    "Invalid token number"
            );
        }

        if (status == null ||
                status.isBlank()) {

            throw new RuntimeException(
                    "Status is required"
            );
        }

        if (
                !status.equals("WAITING") &&
                !status.equals("SERVING") &&
                !status.equals("COMPLETED")
        ) {

            throw new RuntimeException(
                    "Invalid token status"
            );
        }

        Token token =
                tokenRepository
                        .findByTokenNumber(
                                tokenNumber
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Token not found"
                                ));

        // ONLY ONE SERVING TOKEN
        if ("SERVING".equals(status)) {

            List<Token> servingTokens =
                    tokenRepository.findByStatus(
                            "SERVING"
                    );

            for (
                    Token servingToken :
                    servingTokens
            ) {

                servingToken.setStatus(
                        "WAITING"
                );

                tokenRepository.save(
                        servingToken
                );
            }
        }

        token.setStatus(status);

        tokenRepository.save(token);

        return "Token status updated to "
                + status;
    }
}