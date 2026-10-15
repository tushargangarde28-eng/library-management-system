
CREATE TABLE members (
                         member_id BIGINT NOT NULL AUTO_INCREMENT,
                         name VARCHAR(100) NOT NULL,
                         email VARCHAR(150) NOT NULL,
                         phone VARCHAR(15),

                         password_hash VARCHAR(255) NOT NULL,
                         role VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
                         status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

                         created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                             ON UPDATE CURRENT_TIMESTAMP,

                         CONSTRAINT pk_members
                             PRIMARY KEY (member_id),

                         CONSTRAINT uk_members_email
                             UNIQUE (email),

                         CONSTRAINT chk_members_role
                             CHECK (role IN ('ADMIN', 'STUDENT')),

                         CONSTRAINT chk_members_status
                             CHECK (status IN ('ACTIVE', 'INACTIVE'))
);
