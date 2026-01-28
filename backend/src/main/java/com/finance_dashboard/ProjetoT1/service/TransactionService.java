package com.finance_dashboard.ProjetoT1.service;

import com.finance_dashboard.ProjetoT1.dto.SummaryResponseDTO;
import com.finance_dashboard.ProjetoT1.dto.TransactionRequestDTO;
import com.finance_dashboard.ProjetoT1.model.Transaction;
import com.finance_dashboard.ProjetoT1.model.TransactionType;
import com.finance_dashboard.ProjetoT1.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public Transaction create(TransactionRequestDTO dto) {

        validateTransaction(dto);

        Transaction transaction = new Transaction(
                dto.getDescription(),
                dto.getAmount(),
                dto.getType(),
                dto.getCategory(),
                dto.getDate()
        );

        return transactionRepository.save(transaction);
    }

    public List<Transaction> findAll() {
        return transactionRepository.findAll();
    }

    public SummaryResponseDTO getSummary() {
        List<Transaction> transactions = transactionRepository.findAll();

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;

        for (Transaction transaction : transactions) {
            if (transaction.getType() == TransactionType.INCOME) {
                totalIncome = totalIncome.add(transaction.getAmount());
            } else {
                totalExpense = totalExpense.add(transaction.getAmount());
            }
        }

        BigDecimal balance = totalIncome.subtract(totalExpense);

        return new SummaryResponseDTO(totalIncome, totalExpense, balance);
    }

    private void validateTransaction(TransactionRequestDTO transaction) {
        if (transaction.getDescription() == null || transaction.getDescription().isBlank()) {
            throw new IllegalArgumentException("Descrição é obrigatória");
        }

        if (transaction.getAmount() == null || transaction.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valor deve ser maior que zero");
        }

        if (transaction.getType() == null) {
            throw new IllegalArgumentException("Tipo da transação é obrigatório");
        }

        if (transaction.getDate() == null) {
            throw new IllegalArgumentException("Data é obrigatória");
        }
    }

    public List<Transaction> findByMonth(int year, int month) {

        if (month < 1 || month > 12) {
            throw new IllegalArgumentException("Mês inválido");
        }

        YearMonth yearMonth = YearMonth.of(year, month);

        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();

        return transactionRepository.findByDateBetween(start, end);
    }

}
