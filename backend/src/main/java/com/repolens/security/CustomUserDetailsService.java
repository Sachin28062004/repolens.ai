package com.codelensai.security;

import com.codelensai.repository.UserAccountRepository;
import java.util.List;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserAccountRepository userAccountRepository;

    public CustomUserDetailsService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        return userAccountRepository.findByEmail(username.toLowerCase())
                .map(user -> new User(
                        user.getEmail(),
                        user.getPassword() == null ? "" : user.getPassword(),
                        List.of(new SimpleGrantedAuthority("ROLE_USER"))))
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
