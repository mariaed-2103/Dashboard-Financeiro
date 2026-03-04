package com.finance_dashboard.ProjetoT1.service;

import com.finance_dashboard.ProjetoT1.dto.CategoriesResponseDTO;
import com.finance_dashboard.ProjetoT1.model.Category;
import com.finance_dashboard.ProjetoT1.model.User;
import com.finance_dashboard.ProjetoT1.repository.CategoryRepository;
import com.finance_dashboard.ProjetoT1.repository.UserRepository;
import com.finance_dashboard.ProjetoT1.config.AuthenticatedUser;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public CategoryService(CategoryRepository categoryRepository,
                           UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public CategoriesResponseDTO getCategories() {
        String email = AuthenticatedUser.getEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        List<Category> globals = categoryRepository.findByUserEmailIsNull();
        List<Category> custom = categoryRepository.findByUserEmail(email);

        return new CategoriesResponseDTO(globals, custom);
    }

    public Category createCategory(String name) {

        if (name == null || name.trim().length() < 2 || name.length() > 50)
            throw new RuntimeException("Nome inválido");

        String email = AuthenticatedUser.getEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (categoryRepository.findByUserEmailAndName(email, name).isPresent())
            throw new RuntimeException("Categoria já existe");

        if (categoryRepository.findByUserEmail(email).size() >= 20)
            throw new RuntimeException("Limite de categorias atingido");

        Category category = new Category(
                UUID.randomUUID().toString(),
                name,
                email,
                LocalDateTime.now()
        );

        return categoryRepository.save(category);
    }

    public void deleteCategory(String categoryId) {

        String email = AuthenticatedUser.getEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        if (category.getUserEmail() == null)
            throw new RuntimeException("Categoria global não pode ser deletada");

        if (!category.getUserEmail().equals(email))
            throw new RuntimeException("Não autorizado");

        categoryRepository.delete(category);
    }

    public CategoriesResponseDTO findAllByUser() {

        String email = AuthenticatedUser.getEmail();

        List<Category> global =
                categoryRepository.findByUserEmailIsNull();

        List<Category> custom =
                categoryRepository.findByUserEmail(email);

        return new CategoriesResponseDTO(global, custom);
    }
}