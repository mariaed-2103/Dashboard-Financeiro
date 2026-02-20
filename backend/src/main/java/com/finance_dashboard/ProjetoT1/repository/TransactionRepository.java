package com.finance_dashboard.ProjetoT1.repository;

import com.finance_dashboard.ProjetoT1.model.Category;
import com.finance_dashboard.ProjetoT1.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends MongoRepository<Transaction, String> {
    List<Transaction> findByDateBetween(LocalDate start, LocalDate end);

    List<Transaction> findByCategory(Category category);

    List<Transaction> findByUserEmail(String userEmail);

    List<Transaction> findByUserEmailAndDateBetween(
            String userEmail,
            Instant start,
            Instant end
    );

}