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

        // 1. Criamos o objeto User com os dados do DTO.
        // Passamos a senha pura, pois o userService.registerUser cuidará do encode.
        User user = new User(
                dto.name(),
                dto.email(),
                dto.password()
        );

        try {
            // 2. Chamamos o service que gera a chave criptográfica e salva no MongoDB.
            userService.registerUser(user);
        } catch (Exception e) {
            // 3. Tratamento de erro caso a criptografia falhe (ex: Master Key ausente).
            throw new RuntimeException("Erro ao processar segurança do usuário: " + e.getMessage());
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
