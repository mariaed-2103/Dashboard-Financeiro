package com.finance_dashboard.ProjetoT1.repository;

import com.finance_dashboard.ProjetoT1.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends MongoRepository<Transaction, String> {
    List<Transaction> findByDateBetween(LocalDate start, LocalDate end);
}