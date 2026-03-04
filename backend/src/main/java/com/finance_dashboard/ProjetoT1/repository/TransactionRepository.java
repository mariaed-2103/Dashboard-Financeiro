package com.finance_dashboard.ProjetoT1.repository;

import com.finance_dashboard.ProjetoT1.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends MongoRepository<Transaction, String> {

    List<Transaction> findByUserEmailAndCategoryIdAndDeletedAtIsNull(
            String userEmail,
            String categoryId
    );

    List<Transaction> findByUserEmailAndDeletedAtIsNull(String userEmail);

    Optional<Transaction> findByIdAndUserEmailAndDeletedAtIsNull(
            String id,
            String userEmail
    );

    List<Transaction> findByUserEmailAndDateBetweenAndDeletedAtIsNull(
            String userEmail,
            Instant start,
            Instant end
    );

    boolean existsByUserEmailAndCategoryIdAndDeletedAtIsNull(
            String userEmail,
            String categoryId
    );

}