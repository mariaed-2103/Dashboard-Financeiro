package com.finance_dashboard.ProjetoT1.service;

import com.finance_dashboard.ProjetoT1.config.AuthenticatedUser;
import com.finance_dashboard.ProjetoT1.model.Category;
import com.finance_dashboard.ProjetoT1.repository.CategoryRepository;
import com.finance_dashboard.ProjetoT1.repository.TransactionRepository;
import org.springframework.stereotype.Service;

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

        long customCount =
                repository.countByUserEmailAndIsDefaultFalse(userEmail);

        if (customCount >= 20) {
            throw new IllegalStateException("Limite atingido");
        }

        String normalized = normalize(name);

        if (repository.existsByUserEmailAndNormalizedName(userEmail, normalized)) {
            throw new IllegalArgumentException("Categoria já existe");
        }

        Category category = new Category();
        category.setName(name);
        category.setNormalizedName(normalized);
        category.setUserEmail(userEmail);
        category.setDefault(false);
        category.setActive(true);

        return repository.save(category);
    }

    public Category rename(String userEmail, String id, String newName) {

        Category category = repository.findByIdAndUserEmail(id, userEmail)
                .orElseThrow(() ->
            new IllegalArgumentException("Categoria não encontrada"));

        if (category.isDefault()) {
            throw new RuntimeException(
                    "Categorias padrão não podem ser renomeadas");
        }

        category.setName(newName);
        category.setNormalizedName(normalize(newName));

        return repository.save(category);
    }

    public void softDelete(String userEmail, String id) {

        Category category = repository
                .findByIdAndUserEmail(id, userEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("Categoria não encontrada"));

        if (category.isDefault()) {
            throw new IllegalArgumentException(
                    "Categorias padrão não podem ser removidas");
        }

        boolean hasTransactions =
                transactionRepository
                        .existsByUserEmailAndCategoryIdAndDeletedAtIsNull(
                                userEmail,
                                id
                        );

        if (hasTransactions) {
            throw new IllegalArgumentException(
                    "Não é possível excluir categoria com transações");
        }

        category.setActive(false);
        repository.save(category);
    }

    public void createDefaultCategories(String userEmail) {
        List<String> defaults = List.of(
                "Alimentação",
                "Transporte",
                "Moradia",
                "Lazer",
                "Saúde"
        );

        for (String name : defaults) {

            if (!repository.existsByUserEmailAndNormalizedName(
                    userEmail,
                    normalize(name))) {

                Category category = new Category();
                category.setUserEmail(userEmail);
                category.setName(name);
                category.setNormalizedName(normalize(name));
                category.setDefault(true);
                category.setActive(true);

                repository.save(category);
            }
        }
    }

    private String normalize(String value) {
        return value.toLowerCase().trim();
    }

    public List<Category> findAllByUser(String userEmail) {
        return repository.findByUserEmailAndActiveTrue(userEmail);
    }
}
