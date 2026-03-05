package com.finance_dashboard.ProjetoT1.config;

import com.finance_dashboard.ProjetoT1.model.Category;
import com.finance_dashboard.ProjetoT1.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
public class CategoryDataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    public CategoryDataInitializer(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {

        List<String> defaultCategories = List.of(
                "ALIMENTACAO",
                "TRANSPORTE",
                "MORADIA",
                "SAUDE",
                "EDUCACAO",
                "LAZER",
                "SALARIO",
                "INVESTIMENTOS",
                "OUTROS"
        );

        for (String name : defaultCategories) {

            String normalized = name.toLowerCase();

            boolean exists =
                    categoryRepository.existsByUserEmailAndNormalizedName(
                            null,
                            normalized
                    );

            if (!exists) {

                Category category = new Category();
                category.setName(name);
                category.setNormalizedName(normalized);
                category.setUserEmail(null);
                category.setDefault(true);
                category.setActive(true);
                category.setCreatedAt(Instant.now());

                categoryRepository.save(category);
            }
        }
    }
}