package com.finance_dashboard.ProjetoT1.service;

import com.finance_dashboard.ProjetoT1.dto.AuthResponseDTO;
import com.finance_dashboard.ProjetoT1.dto.LoginRequestDTO;
import com.finance_dashboard.ProjetoT1.dto.RegisterRequestDTO;
import com.finance_dashboard.ProjetoT1.model.User;
import com.finance_dashboard.ProjetoT1.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CategoryService categoryService;

    public AuthService(
            UserService userService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            CategoryService categoryService
    ) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.categoryService = categoryService;
    }

    public void register(RegisterRequestDTO dto) {
        if (userRepository.existsByEmail(dto.email())) {
            throw new IllegalArgumentException("E-mail já cadastrado");
        }

        // Validação de força de senha antes de prosseguir
        validatePasswordStrength(dto.password());

        User user = new User(
                dto.name(),
                dto.email(),
                dto.password()
        );

        try {
            userService.registerUser(user);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao processar segurança do usuário: " + e.getMessage());
        }
    }

    private void validatePasswordStrength(String password) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("A senha deve ter pelo menos 8 caracteres.");
        }

        // Bloqueia sequências óbvias (123, abc, password, etc)
        if (password.toLowerCase().matches(".*(123|abc|password|qwerty|clarus).*")) {
            throw new IllegalArgumentException("A senha é muito óbvia ou comum.");
        }

        // Regex: Pelo menos uma maiúscula, uma minúscula, um número e um caractere especial
        String strongPasswordRegex = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$";

        if (!password.matches(strongPasswordRegex)) {
            throw new IllegalArgumentException("A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais.");
        }
    }

    public AuthResponseDTO login(LoginRequestDTO dto) {
        User user = userRepository.findByEmail(dto.email())
                .orElseThrow(() -> new IllegalArgumentException("Credenciais inválidas"));

        if (!passwordEncoder.matches(dto.password(), user.getPassword())) {
            throw new IllegalArgumentException("Credenciais inválidas");
        }

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponseDTO(token);
    }
}
