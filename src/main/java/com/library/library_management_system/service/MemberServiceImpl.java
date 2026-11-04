
package com.library.library_management_system.service;

import com.library.library_management_system.dto.member.LoginRequest;
import com.library.library_management_system.dto.member.LoginResponse;
import com.library.library_management_system.dto.member.MemberRequest;
import com.library.library_management_system.dto.member.MemberResponse;
import com.library.library_management_system.entity.Member;
import com.library.library_management_system.entity.Role;
import com.library.library_management_system.entity.User;
import com.library.library_management_system.exception.BusinessRuleException;
import com.library.library_management_system.exception.DuplicateResourceException;
import com.library.library_management_system.exception.ResourceNotFoundException;
import com.library.library_management_system.repository.MemberRepository;
import com.library.library_management_system.repository.RoleRepository;
import com.library.library_management_system.repository.UserRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MemberServiceImpl implements MemberService {

    private final JdbcTemplate jdbcTemplate;

    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public MemberServiceImpl(
            MemberRepository memberRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbcTemplate,
            JwtService jwtService) {

        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
        this.jwtService = jwtService;
    }


    @Override
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {

        System.out.println("========== LOGIN DEBUG ==========");
        System.out.println("Email received: [" + request.getEmail() + "]");

        // 1. Check database directly using JdbcTemplate
        System.out.println("Database: " +
                jdbcTemplate.queryForObject(
                        "SELECT DATABASE()", String.class));

        System.out.println("SQL Users Count: " +
                jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM users", Long.class));

        System.out.println("ADMIN Exists: " +
                jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM users WHERE email = ?",
                        Long.class,
                        request.getEmail().trim()));

        // 2. Check database using JPA
        System.out.println("JPA Users Count: " + userRepository.count());
        System.out.println("JPA Members Count: " + memberRepository.count());

        // 3. Find user by email
        User user = userRepository.findByEmail(
                request.getEmail().trim()
        ).orElse(null);

        if (user == null) {
            System.out.println("RESULT: USER NOT FOUND");
            System.out.println("=================================");

            throw new BusinessRuleException("Invalid email or password");
        }

        System.out.println("RESULT: USER FOUND");
        System.out.println("User ID: " + user.getUserId());
        System.out.println("Email: " + user.getEmail());
        System.out.println("Status: " + user.getStatus());

        // 4. Verify password
        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash()
        );

        System.out.println("Password matches: " + passwordMatches);

        if (!passwordMatches) {
            System.out.println("RESULT: INVALID PASSWORD");
            System.out.println("=================================");

            throw new BusinessRuleException("Invalid email or password");
        }

        // 5. Check user account status
        if (user.getStatus() != User.Status.ACTIVE) {
            System.out.println("RESULT: ACCOUNT INACTIVE");
            System.out.println("=================================");

            throw new BusinessRuleException("User account is inactive");
        }

        // 6. Get user role
        String roleName = user.getRole().getRoleName();

        System.out.println("User Role: " + roleName);

        // 7. Generate JWT token
        String token = jwtService.generateToken(
                user.getEmail(),
                roleName
        );

        // 8. Prepare login response
        LoginResponse response = new LoginResponse();

        response.setMessage("Login Successful");
        response.setEmail(user.getEmail());
        response.setRole(roleName);
        response.setToken(token);

        // 9. Load member details for STUDENT or ADMIN
        memberRepository.findByUser_Email(user.getEmail()).ifPresent(member -> {
            response.setMemberId(member.getMemberId());
            response.setName(member.getName());
        });

        // Fallback name if admin profile record does not exist
        if (response.getName() == null) {
            response.setName("ADMIN".equalsIgnoreCase(roleName) ? "System Administrator" : "User");
        }
        return response;
    }


    // Create Member
    @Override
    @Transactional
    public MemberResponse createMember(MemberRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "User with this email already exists");
        }

        if (request.getPassword() == null ||
                request.getPassword().isBlank()) {
            throw new BusinessRuleException("Password is required");
        }

        Role studentRole = roleRepository.findByRoleName("STUDENT")
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "STUDENT role not found"));

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword()));
        user.setRole(studentRole);
        user.setStatus(User.Status.ACTIVE);

        User savedUser = userRepository.save(user);

        Member member = new Member();
        member.setUser(savedUser);
        member.setName(request.getName());
        member.setPhone(request.getPhone());

        Member savedMember = memberRepository.save(member);

        return toResponse(savedMember);
    }

    // Get Member By ID
    @Override
    @Transactional(readOnly = true)
    public MemberResponse getMemberById(Long memberId) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Member not found with Id " + memberId));

        return toResponse(member);
    }

    // Get All Student Members
    @Override
    @Transactional(readOnly = true)
    public Page<MemberResponse> getAllMembers(Pageable pageable) {

        return memberRepository.findByUser_Role_RoleName(
                "STUDENT", pageable
        ).map(this::toResponse);
    }

    // Search Members
    @Override
    @Transactional(readOnly = true)
    public Page<MemberResponse> searchMember(
            String search, Pageable pageable) {

        return memberRepository
                .findByNameContainingIgnoreCaseOrUser_EmailContainingIgnoreCase(
                        search, search, pageable)
                .map(this::toResponse);
    }

    // Get Members By Status
    @Override
    @Transactional(readOnly = true)
    public Page<MemberResponse> getMemberByStatus(
            String status, Pageable pageable) {

        User.Status userStatus;

        try {
            userStatus = User.Status.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new IllegalArgumentException(
                    "Invalid status. Allowed values: ACTIVE, INACTIVE");
        }

        return memberRepository.findByUser_Status(
                userStatus, pageable
        ).map(this::toResponse);
    }

    // Update Member
    @Override
    @Transactional
    public MemberResponse updateMember(
            Long memberId, MemberRequest request) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Member not found with Id " + memberId));

        member.setName(request.getName());
        member.setPhone(request.getPhone());

        Member updatedMember = memberRepository.save(member);

        return toResponse(updatedMember);
    }

    // Deactivate Member
    @Override
    @Transactional
    public MemberResponse deactivateMember(Long memberId) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Member not found with Id " + memberId));

        member.getUser().setStatus(User.Status.INACTIVE);
        userRepository.save(member.getUser());
        memberRepository.save(member);

        return toResponse(member);
    }

    // Convert Entity To Response DTO
    private MemberResponse toResponse(Member member) {

        MemberResponse response = new MemberResponse();

        response.setMemberId(member.getMemberId());
        response.setName(member.getName());
        response.setEmail(member.getUser().getEmail());
        response.setPhone(member.getPhone());
        response.setRole(member.getUser().getRole().getRoleName());
        response.setStatus(member.getUser().getStatus().name());
        response.setCreatedAt(member.getCreatedAt());
        response.setUpdatedAt(member.getUpdatedAt());

        return response;
    }
}
