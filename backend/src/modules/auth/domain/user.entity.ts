export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  name: string;
}
