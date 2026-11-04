package com.library.library_management_system.config;

import com.library.library_management_system.security.JwtAuthenticationFilter;
import com.library.library_management_system.service.JwtService;
import com.library.library_management_system.service.PermissionService;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public UserDetailsService userDetailsService() {
        return new InMemoryUserDetailsManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtService jwtService,
            PermissionService permissionService
    ) throws Exception {

        JwtAuthenticationFilter jwtAuthenticationFilter =
                new JwtAuthenticationFilter(jwtService, permissionService);

        http
                .csrf(csrf -> csrf.disable())

                .httpBasic(basic -> basic.disable())

                .formLogin(form -> form.disable())

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .exceptionHandling(exception -> exception

                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.setCharacterEncoding("UTF-8");

                            response.getWriter().write(
                                    "{\"status\":401,\"message\":\"Authentication required\"}"
                            );
                        })

                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.setCharacterEncoding("UTF-8");

                            response.getWriter().write(
                                    "{\"status\":403,\"message\":\"Access denied: insufficient permissions\"}"
                            );
                        })
                )

                .authorizeHttpRequests(auth -> auth

                        // Public endpoints
                        .requestMatchers(HttpMethod.POST, "/api/members").permitAll()
                        .requestMatchers(
                                "/api/members/register",
                                "/api/members/login",
                                "/actuator/health",
                                "/actuator/health/**",
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // Member authorization handled by @PreAuthorize
                        .requestMatchers("/api/members/**").authenticated()

                        // Loan authorization handled by @PreAuthorize
                        .requestMatchers("/api/loans/**").authenticated()

                        // Other endpoints
                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}