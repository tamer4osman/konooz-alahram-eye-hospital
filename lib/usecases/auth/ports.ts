// ISP ports for the split identity stores (D6). One minimal interface per
// use case; adapters in lib/adapters/prisma implement these. Framework-free.

export interface PatientIdentityStore {
  findByEmail(email: string): Promise<{
    id: string;
    email: string;
    passwordHash: string;
  } | null>;
  createWithProfile(input: {
    email: string;
    passwordHash: string;
    fullNameAr: string;
    phone: string;
    gender: 'MALE' | 'FEMALE';
    cityAr: string;
  }): Promise<{ id: string; email: string }>;
}

export interface PatientSessionStore {
  create(accountId: string, tokenHash: string, expiresAt: Date): Promise<void>;
  findValidAccount(
    tokenHash: string,
    now: Date,
  ): Promise<
    | { sessionId: string; accountId: string; email: string; expiresAt: Date }
    | null
  >;
  deleteByTokenHash(tokenHash: string): Promise<void>;
}

export interface StaffIdentityStore {
  findByEmail(email: string): Promise<
    | {
        id: string;
        email: string;
        passwordHash: string | null;
        role: 'STAFF' | 'ADMIN';
      }
    | null
  >;
}

export interface StaffSessionStore {
  create(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;
  findValidUser(
    tokenHash: string,
    now: Date,
  ): Promise<
    | {
        sessionId: string;
        userId: string;
        email: string;
        role: 'STAFF' | 'ADMIN';
        expiresAt: Date;
      }
    | null
  >;
  deleteByTokenHash(tokenHash: string): Promise<void>;
}
