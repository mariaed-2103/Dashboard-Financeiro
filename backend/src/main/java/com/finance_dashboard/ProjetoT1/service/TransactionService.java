package com.finance_dashboard.ProjetoT1.service;

import com.finance_dashboard.ProjetoT1.config.AuthenticatedUser;
import com.finance_dashboard.ProjetoT1.dto.CategorySummaryDTO;
import com.finance_dashboard.ProjetoT1.dto.SummaryResponseDTO;
import com.finance_dashboard.ProjetoT1.dto.TransactionRequestDTO;
import com.finance_dashboard.ProjetoT1.model.Category;
import com.finance_dashboard.ProjetoT1.model.Transaction;
import com.finance_dashboard.ProjetoT1.model.TransactionType;
import com.finance_dashboard.ProjetoT1.repository.TransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public Transaction create(TransactionRequestDTO dto) {

        validateTransaction(dto);

        String userEmail = AuthenticatedUser.getEmail();

        Transaction transaction = new Transaction(
                dto.getDescription(),
                dto.getAmount(),
                dto.getType(),
                dto.getCategory(),
                Instant.parse(dto.getDate() + "T00:00:00Z")
        );

        transaction.setUserEmail(userEmail);

        return transactionRepository.save(transaction);
    }


    public List<Transaction> findAll() {
        String userEmail = AuthenticatedUser.getEmail();
        return transactionRepository.findByUserEmail(userEmail);
    }


    public SummaryResponseDTO getSummary() {
        String userEmail = AuthenticatedUser.getEmail();

        List<Transaction> transactions =
                transactionRepository.findByUserEmail(userEmail);

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

    public List<Transaction> findByCategory(Category category) {

        if (category == null) {
            throw new IllegalArgumentException("Categoria é obrigatória");
        }

        return transactionRepository.findByCategory(category);
    }

    public List<CategorySummaryDTO> getCategorySummary(int year, int month) {

        if (month < 1 || month > 12) {
            throw new IllegalArgumentException("Mês inválido");
        }

        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();

        List<Transaction> transactions =
                transactionRepository.findByDateBetween(start, end);

        Map<Category, BigDecimal[]> totals = new EnumMap<>(Category.class);

        // inicializa todas as categorias
        for (Category category : Category.values()) {
            totals.put(category, new BigDecimal[]{
                    BigDecimal.ZERO, // income
                    BigDecimal.ZERO  // expense
            });
        }

        // acumula corretamente
        for (Transaction transaction : transactions) {
            BigDecimal[] values = totals.get(transaction.getCategory());

            if (transaction.getType() == TransactionType.INCOME) {
                values[0] = values[0].add(transaction.getAmount());
            } else {
                values[1] = values[1].add(transaction.getAmount());
            }
        }

        // monta o DTO
        return totals.entrySet().stream()
                // opcional: remover categorias zeradas
                .filter(e ->
                        e.getValue()[0].compareTo(BigDecimal.ZERO) > 0 ||
                                e.getValue()[1].compareTo(BigDecimal.ZERO) > 0
                )
                .map(e -> new CategorySummaryDTO(
                        e.getKey(),
                        e.getValue()[0], // income
                        e.getValue()[1]  // expense
                ))
                .toList();
    }

    public List<CategorySummaryDTO> getCategorySummaryByUser(
            int year,
            int month
    ) {
        YearMonth yearMonth = YearMonth.of(year, month);

        Instant start = yearMonth
                .atDay(1)
                .atStartOfDay(ZoneOffset.UTC)
                .toInstant();

        Instant end = yearMonth
                .atEndOfMonth()
                .atTime(23, 59, 59)
                .atZone(ZoneOffset.UTC)
                .toInstant();

        String userEmail = AuthenticatedUser.getEmail();

        System.out.println("START INSTANT: " + start);
        System.out.println("END INSTANT: " + end);
        System.out.println("USER EMAIL: " + userEmail);

        List<Transaction> transactions =
                transactionRepository.findByUserEmailAndDateBetween(
                        userEmail,
                        start,
                        end
                );

        System.out.println("TRANSACTIONS FOUND: " + transactions.size());

        Map<Category, BigDecimal[]> totals = new EnumMap<>(Category.class);

        for (Transaction t : transactions) {
            totals.putIfAbsent(
                    t.getCategory(),
                    new BigDecimal[]{ BigDecimal.ZERO, BigDecimal.ZERO }
            );

            BigDecimal[] values = totals.get(t.getCategory());

            if (t.getType() == TransactionType.INCOME) {
                values[0] = values[0].add(t.getAmount());
            } else {
                values[1] = values[1].add(t.getAmount());
            }
        }

        return totals.entrySet()
                .stream()
                .map(e ->
                        new CategorySummaryDTO(
                                e.getKey(),
                                e.getValue()[0],
                                e.getValue()[1]
                        )
                )
                .toList();
    }


}
