
package com.library.library_management_system.security;

import com.library.library_management_system.service.JwtService;
import com.library.library_management_system.service.PermissionService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final PermissionService permissionService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            PermissionService permissionService
    ) {
        this.jwtService = jwtService;
        this.permissionService = permissionService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader == null
                || !authorizationHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authorizationHeader.substring(7);

        try {
            String email = jwtService.extractEmail(token);
            String role = jwtService.extractRole(token);

            if (email == null || role == null
                    || (!role.equals("ADMIN") && !role.equals("STUDENT"))) {
                sendUnauthorized(response);
                return;
            }

            if (jwtService.isTokenValid(token, email)) {

                if (SecurityContextHolder.getContext()
                        .getAuthentication() == null) {

                    Set<String> permissions =
                            permissionService.getPermissions(email);

                    List<SimpleGrantedAuthority> authorities =
                            new ArrayList<>();

                    // Add role authority
                    authorities.add(
                            new SimpleGrantedAuthority("ROLE_" + role)
                    );

                    // Add database permissions
                    permissions.forEach(permission ->
                            authorities.add(
                                    new SimpleGrantedAuthority(permission)
                            )
                    );

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    email,
                                    null,
                                    authorities
                            );

                    SecurityContextHolder.getContext()
                            .setAuthentication(authentication);
                }

            } else {
                sendUnauthorized(response);
                return;
            }

        } catch (JwtException | IllegalArgumentException exception) {
            SecurityContextHolder.clearContext();
            sendUnauthorized(response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void sendUnauthorized(HttpServletResponse response)
            throws IOException {

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        response.getWriter().write(
                "{\"status\":401,\"message\":\"Invalid or expired JWT token\"}"
        );
    }
}
