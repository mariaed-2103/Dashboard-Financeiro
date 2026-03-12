package com.finance_dashboard.ProjetoT1.controller;

import com.finance_dashboard.ProjetoT1.config.AuthenticatedUser;
import com.finance_dashboard.ProjetoT1.dto.CategoriesResponseDTO;
import com.finance_dashboard.ProjetoT1.dto.CategoryRequestDTO;
import com.finance_dashboard.ProjetoT1.model.Category;
import com.finance_dashboard.ProjetoT1.repository.CategoryRepository;
import com.finance_dashboard.ProjetoT1.service.CategoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final CategoryRepository categoryRepository;

    public CategoryController(
            CategoryService categoryService,
            CategoryRepository categoryRepository
    ) {
        this.categoryService = categoryService;
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public CategoriesResponseDTO getCategories() {

        String email = AuthenticatedUser.getEmail();

        List<Category> global =
                categoryRepository.findByUserEmailIsNullAndActiveTrue();

        List<Category> custom =
                categoryService.listActiveByUser(email);

        return new CategoriesResponseDTO(global, custom);
    }

    @PostMapping
    public Category createCategory(@RequestBody CategoryRequestDTO body) {

        String email = AuthenticatedUser.getEmail();

        return categoryService.create(email, body.getName());
    }

    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable String id) {

        String email = AuthenticatedUser.getEmail();

        categoryService.softDelete(email, id);
    }

    @PutMapping("/{id}")
    public Category updateCategory(@PathVariable String id, @RequestBody CategoryRequestDTO body) {
        String email = AuthenticatedUser.getEmail();
        return categoryService.rename(email, id, body.getName());
    }
}