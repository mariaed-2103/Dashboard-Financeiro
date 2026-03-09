package com.finance_dashboard.ProjetoT1.service;

import com.finance_dashboard.ProjetoT1.config.AuthenticatedUser;
import com.finance_dashboard.ProjetoT1.dto.CategorySummaryDTO;
import com.finance_dashboard.ProjetoT1.dto.SummaryResponseDTO;
import com.finance_dashboard.ProjetoT1.dto.TransactionRequestDTO;
import com.finance_dashboard.ProjetoT1.model.Category;
import com.finance_dashboard.ProjetoT1.model.Transaction;
import com.finance_dashboard.ProjetoT1.model.TransactionType;
import com.finance_dashboard.ProjetoT1.model.User;
import com.finance_dashboard.ProjetoT1.repository.CategoryRepository;
import com.finance_dashboard.ProjetoT1.repository.TransactionRepository;
import com.finance_dashboard.ProjetoT1.repository.UserRepository;
import com.finance_dashboard.ProjetoT1.security.DataCrypto;
import com.finance_dashboard.ProjetoT1.security.UserKeyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TransactionService {

    @Autowired
    private UserKeyService userKeyService;
    @Autowired
    private UserRepository userRepository;

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public TransactionService(
            TransactionRepository transactionRepository,
            CategoryRepository categoryRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }

    public Transaction create(TransactionRequestDTO dto) {
        validateTransaction(dto);
        String userEmail = AuthenticatedUser.getEmail();

        // 1. Buscar o usuário completo para ter acesso à encryptedUserKey
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        try {
            // 2. Recuperar a chave do usuário (descriptografada pela Master Key)
            String userKey = userKeyService.getUserKey(user);

            // 3. Criptografar description, amount e type antes de salvar
            String encryptedDescription = DataCrypto.encryptWithUserKey(dto.getDescription(), userKey);
            String encryptedAmount      = DataCrypto.encryptWithUserKey(dto.getAmount().toPlainString(), userKey);
            String encryptedType        = DataCrypto.encryptWithUserKey(dto.getType().name(), userKey);

            Category category = categoryRepository.findById(dto.getCategoryId())
                    .filter(c -> c.isActive() && (c.getUserEmail() == null || c.getUserEmail().equals(userEmail)))
                    .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada"));

            Transaction transaction = new Transaction(
                    encryptedDescription,
                    encryptedAmount,
                    encryptedType,
                    dto.getCategoryId(),
                    dto.getDate().atStartOfDay(ZoneOffset.UTC).toInstant()
            );

            Instant now = Instant.now();
            transaction.setUserEmail(userEmail);
            transaction.setCreatedAt(now);
            transaction.setUpdatedAt(now);

            Transaction saved = transactionRepository.save(transaction);

            // Descriptografar antes de retornar ao controller (o Jackson não aceita
            // campos criptografados onde espera valores numéricos/enum)
            decryptTransactions(List.of(saved), userEmail);

            return saved;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao processar criptografia da transação", e);
        }
    }

    public List<Transaction> findAll() {
        String userEmail = AuthenticatedUser.getEmail();
        List<Transaction> transactions = transactionRepository.findByUserEmailAndDeletedAtIsNull(userEmail);

        decryptTransactions(transactions, userEmail);
        return transactions;
    }

    public SummaryResponseDTO getSummary() {
        String userEmail = AuthenticatedUser.getEmail();

        List<Transaction> transactions =
                transactionRepository.findByUserEmailAndDeletedAtIsNull(userEmail);

        // Descriptografar antes de usar amount e type
        decryptTransactions(transactions, userEmail);

        BigDecimal totalIncome  = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;

        for (Transaction transaction : transactions) {
            if (TransactionType.INCOME.name().equals(transaction.getType())) {
                totalIncome = totalIncome.add(transaction.getAmountAsDecimal());
            } else {
                totalExpense = totalExpense.add(transaction.getAmountAsDecimal());
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
        List<Transaction> transactions = transactionRepository
                .findByUserEmailAndDateBetweenAndDeletedAtIsNull(userEmail, start, end);

        decryptTransactions(transactions, userEmail);
        return transactions;
    }

    public List<Transaction> findByCategory(String categoryId) {
        if (categoryId == null) {
            throw new IllegalArgumentException("Categoria é obrigatória");
        }

        String userEmail = AuthenticatedUser.getEmail();

        List<Transaction> transactions = transactionRepository
                .findByUserEmailAndCategoryIdAndDeletedAtIsNull(userEmail, categoryId);

        decryptTransactions(transactions, userEmail);

        return transactions;
    }

    public List<CategorySummaryDTO> getCategorySummary(int year, int month) {

        if (month < 1 || month > 12) {
            throw new IllegalArgumentException("Mês inválido");
        }

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

        List<Transaction> transactions =
                transactionRepository
                        .findByUserEmailAndDateBetweenAndDeletedAtIsNull(
                                userEmail,
                                start,
                                end
                        );

        // Descriptografar antes de usar amount e type
        decryptTransactions(transactions, userEmail);

        Map<String, BigDecimal[]> totals = new HashMap<>();
        for (Transaction transaction : transactions) {
            totals.putIfAbsent(transaction.getCategoryId(), new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            BigDecimal[] values = totals.get(transaction.getCategoryId());
            if (TransactionType.INCOME.name().equals(transaction.getType())) {
                values[0] = values[0].add(transaction.getAmountAsDecimal());
            } else {
                values[1] = values[1].add(transaction.getAmountAsDecimal());
            }
        }

        return totals.entrySet().stream()
                .map(e -> {
                    String categoryName = categoryRepository.findById(e.getKey())
                            .map(Category::getName)
                            .orElse("Sem categoria");

                    return new CategorySummaryDTO(
                            e.getKey(),
                            categoryName,
                            e.getValue()[0],
                            e.getValue()[1]
                    );
                })
                .toList();
    }

    public List<CategorySummaryDTO> getCategorySummaryByUser(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        Instant start = yearMonth.atDay(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant end = yearMonth.atEndOfMonth().atTime(23, 59, 59).atZone(ZoneOffset.UTC).toInstant();
        String userEmail = AuthenticatedUser.getEmail();

        List<Transaction> transactions = transactionRepository.findByUserEmailAndDateBetweenAndDeletedAtIsNull(userEmail, start, end);

        // Descriptografar antes de usar amount e type
        decryptTransactions(transactions, userEmail);

        Map<String, BigDecimal[]> totals = new HashMap<>();
        for (Transaction t : transactions) {
            totals.putIfAbsent(t.getCategoryId(), new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            BigDecimal[] values = totals.get(t.getCategoryId());
            if (TransactionType.INCOME.name().equals(t.getType())) {
                values[0] = values[0].add(t.getAmountAsDecimal());
            } else {
                values[1] = values[1].add(t.getAmountAsDecimal());
            }
        }

        return totals.entrySet().stream()
                .map(e -> {
                    String categoryName = categoryRepository.findById(e.getKey())
                            .map(Category::getName)
                            .orElse("Sem categoria");

                    return new CategorySummaryDTO(
                            e.getKey(),
                            categoryName,
                            e.getValue()[0],
                            e.getValue()[1]
                    );
                })
                .toList();
    }

    public Transaction update(String id, TransactionRequestDTO dto) {
        String userEmail = AuthenticatedUser.getEmail();

        Transaction transaction = transactionRepository
                .findByIdAndUserEmailAndDeletedAtIsNull(id, userEmail)
                .orElseThrow(() -> new RuntimeException("Transação não encontrada"));

        validateTransaction(dto);

        categoryRepository.findById(dto.getCategoryId())
                .filter(c -> c.isActive() && (c.getUserEmail() == null || c.getUserEmail().equals(userEmail)))
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada"));

        try {
            // Buscar a chave do usuário para re-criptografar os campos
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
            String userKey = userKeyService.getUserKey(user);

            String encryptedDescription = DataCrypto.encryptWithUserKey(dto.getDescription(), userKey);
            String encryptedAmount      = DataCrypto.encryptWithUserKey(dto.getAmount().toPlainString(), userKey);
            String encryptedType        = DataCrypto.encryptWithUserKey(dto.getType().name(), userKey);

            transaction.setDescription(encryptedDescription);
            transaction.setAmount(encryptedAmount);
            transaction.setType(encryptedType);
            transaction.setCategoryId(dto.getCategoryId());
            transaction.setDate(Instant.parse(dto.getDate() + "T00:00:00Z"));
            transaction.setUpdatedAt(Instant.now());

            Transaction saved = transactionRepository.save(transaction);

            // Descriptografar antes de retornar ao controller
            decryptTransactions(List.of(saved), userEmail);

            return saved;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao processar criptografia na atualização da transação", e);
        }
    }

    public void delete(String id) {

        String userEmail = AuthenticatedUser.getEmail();

        Transaction transaction = transactionRepository
                .findByIdAndUserEmailAndDeletedAtIsNull(id, userEmail)
                .orElseThrow(() ->
                        new RuntimeException("Transação não encontrada")
                );

        transaction.setDeletedAt(Instant.now());
        transaction.setUpdatedAt(Instant.now());
        transactionRepository.save(transaction);
    }

    public List<Transaction> findByDateRange(Instant start, Instant end) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("Intervalo inválido");
        }

        if (start.isAfter(end)) {
            throw new IllegalArgumentException("Data inicial maior que final");
        }

        String userEmail = AuthenticatedUser.getEmail();

        List<Transaction> transactions = transactionRepository
                .findByUserEmailAndDateBetweenAndDeletedAtIsNull(
                        userEmail,
                        start,
                        end
                );

        decryptTransactions(transactions, userEmail);

        return transactions;
    }

    public SummaryResponseDTO getSummaryByDateRange(Instant start, Instant end) {

        // findByDateRange já chama decryptTransactions internamente
        List<Transaction> transactions = findByDateRange(start, end);

        BigDecimal totalIncome  = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;

        for (Transaction t : transactions) {
            if (TransactionType.INCOME.name().equals(t.getType())) {
                totalIncome = totalIncome.add(t.getAmountAsDecimal());
            } else {
                totalExpense = totalExpense.add(t.getAmountAsDecimal());
            }
        }

        BigDecimal balance = totalIncome.subtract(totalExpense);

        return new SummaryResponseDTO(totalIncome, totalExpense, balance);
    }

    public List<CategorySummaryDTO> getCategorySummaryByDateRange(Instant start, Instant end) {
        // findByDateRange já chama decryptTransactions internamente
        List<Transaction> transactions = findByDateRange(start, end);

        Map<String, BigDecimal[]> totals = new HashMap<>();
        for (Transaction t : transactions) {
            totals.putIfAbsent(t.getCategoryId(), new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            BigDecimal[] values = totals.get(t.getCategoryId());
            if (TransactionType.INCOME.name().equals(t.getType())) {
                values[0] = values[0].add(t.getAmountAsDecimal());
            } else {
                values[1] = values[1].add(t.getAmountAsDecimal());
            }
        }

        return totals.entrySet().stream()
                .map(e -> {
                    String categoryName = categoryRepository.findById(e.getKey())
                            .map(Category::getName)
                            .orElse("Sem categoria");

                    return new CategorySummaryDTO(
                            e.getKey(),
                            categoryName,
                            e.getValue()[0],
                            e.getValue()[1]
                    );
                })
                .toList();
    }

    private void decryptTransactions(List<Transaction> transactions, String userEmail) {
        try {
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            // Se o usuário (como os antigos) não tiver chave ainda,
            // apenas retornamos para exibir o texto puro que já existe no banco.
            if (user.getEncryptedUserKey() == null) {
                return;
            }

            String userKey = userKeyService.getUserKey(user);

            transactions.forEach(t -> {
                try {
                    // O dado criptografado SEMPRE contém ":" separando IV do conteúdo.
                    // Dados antigos (plain text) não têm ":", então são mantidos como estão.
                    if (t.getDescription() != null && t.getDescription().contains(":")) {
                        t.setDescription(DataCrypto.decryptWithUserKey(t.getDescription(), userKey));
                    }

                    if (t.getAmount() != null && t.getAmount().contains(":")) {
                        t.setAmount(DataCrypto.decryptWithUserKey(t.getAmount(), userKey));
                    }

                    if (t.getType() != null && t.getType().contains(":")) {
                        t.setType(DataCrypto.decryptWithUserKey(t.getType(), userKey));
                    }

                } catch (Exception e) {
                    // Em caso de erro técnico na chave, protegemos os campos.
                    t.setDescription("[Conteúdo Protegido]");
                    t.setAmount("0");
                    t.setType(TransactionType.EXPENSE.name());
                }
            });
        } catch (Exception e) {
            System.err.println("Aviso: Falha ao processar camada de segurança para " + userEmail);
        }
    }
}