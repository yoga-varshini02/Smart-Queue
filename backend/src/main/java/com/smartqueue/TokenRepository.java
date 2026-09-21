package com.smartqueue;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TokenRepository extends JpaRepository<Token, Integer> {

    long countByTokenNumberLessThanAndStatus(
            Integer tokenNumber,
            String status
    );

    java.util.Optional<Token> findByTokenNumber(
            Integer tokenNumber
    );

    java.util.List<Token> findByStatusOrderByTokenNumberAsc(
            String status
    );

    java.util.List<Token> findByStatus(
            String status
    );

    java.util.Optional<Token> findFirstByUserIdAndStatusIn(
            Integer userId,
            java.util.List<String> statuses
    );

    java.util.Optional<Token> findByTokenNumberAndUserId(
            Integer tokenNumber,
            Integer userId
    );

    // TOKEN HISTORY
    java.util.List<Token> findByUserIdOrderByTokenIdDesc(
            Integer userId
    );
}