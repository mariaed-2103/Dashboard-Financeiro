package com.finance_dashboard.ProjetoT1.security;

import com.finance_dashboard.ProjetoT1.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserKeyService {
    @Autowired
    private CryptoUtils cryptoUtils;

    public String getUserKey(User user) throws Exception {
        if (user.getEncryptedUserKey() == null) {
            // Você pode lançar uma exceção personalizada ou retornar null
            // Dependendo de como o Clarus lida com novos usuários
            throw new IllegalStateException("Usuário não possui chave de criptografia configurada.");
        }
        return cryptoUtils.decrypt(user.getEncryptedUserKey());
    }
}
