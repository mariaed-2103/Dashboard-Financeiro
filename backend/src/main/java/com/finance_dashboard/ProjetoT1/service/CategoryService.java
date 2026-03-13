package com.finance_dashboard.ProjetoT1.service;

import com.finance_dashboard.ProjetoT1.config.AuthenticatedUser;
import com.finance_dashboard.ProjetoT1.model.Category;
import com.finance_dashboard.ProjetoT1.repository.CategoryRepository;
import com.finance_dashboard.ProjetoT1.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository repository;
    private final TransactionRepository transactionRepository;

    public CategoryService(
            CategoryRepository repository,
            TransactionRepository transactionRepository
    ) {
        this.repository = repository;
        this.transactionRepository = transactionRepository;
    }

    public List<Category> listActiveByUser(String userEmail) {
        return repository.findByUserEmailAndActiveTrue(userEmail);
    }

    public Category create(String userEmail, String name) {

        // Corrigido: conta apenas categorias ATIVAS para não penalizar soft deletes
        long customCount =
                repository.countByUserEmailAndIsDefaultFalseAndActiveTrue(userEmail);

        if (customCount >= 20) {
            throw new IllegalStateException("Limite atingido");
        }

        String normalized = normalize(name);

        // ✅ Verifica se já existe nas GLOBAIS ou nas CUSTOM do usuário
        boolean existsGlobal = repository.existsByUserEmailAndNormalizedName(null, normalized);
        boolean existsCustom = repository.existsByUserEmailAndNormalizedName(userEmail, normalized);

        if (existsGlobal || existsCustom) {
            throw new IllegalArgumentException("Esta categoria já existe no sistema.");
        }

        Category category = new Category();
        category.setName(name);
        category.setNormalizedName(normalized);
        category.setUserEmail(userEmail);
        category.setDefault(false);
        category.setActive(true);
        category.setCreatedAt(Instant.now());

        return repository.save(category);
    }

    public Category rename(String userEmail, String id, String newName) {

        Category category = repository.findByIdAndUserEmail(id, userEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("Categoria não encontrada"));

        if (category.isDefault()) {
            throw new RuntimeException(
                    "Categorias padrão não podem ser renomeadas.");
        }

        category.setName(newName);
        category.setNormalizedName(normalize(newName));
        category.setUpdatedAt(Instant.now());

        return repository.save(category);
    }

    public void softDelete(String userEmail, String id) {

        // Corrigido: busca apenas categorias ativas — evita reprocessar categorias já deletadas
        Category category = repository
                .findByIdAndUserEmailAndActiveTrue(id, userEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("Categoria não encontrada ou já removida."));

        if (category.isDefault()) {
            throw new IllegalArgumentException(
                    "Categorias padrão não podem ser removidas.");
        }

        boolean hasTransactions =
                transactionRepository
                        .existsByUserEmailAndCategoryIdAndDeletedAtIsNull(
                                userEmail,
                                id
                        );

        if (hasTransactions) {
            throw new IllegalArgumentException(
                    "Não é possível excluir categoria com transações.");
        }

        category.setActive(false);
        category.setUpdatedAt(Instant.now());
        repository.save(category);
    }


    private String normalize(String value) {
        if (value == null) return "";
        return value.toLowerCase()
                .trim()
                .replaceAll("[áàâãä]", "a")
                .replaceAll("[éèêë]", "e")
                .replaceAll("[íìîï]", "i")
                .replaceAll("[óòôõö]", "o")
                .replaceAll("[úùûü]", "u")
                .replaceAll("ç", "c");
    }

    public List<Category> findAllByUser(String userEmail) {
        return repository.findByUserEmailAndActiveTrue(userEmail);
    }
}