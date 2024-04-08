type UserRole = 'USER' | 'ADMIN';

type User = {
  id: number;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  username: string;
  photo?: string;
  password: string;
  resetPasswordToken?: string;
  verificationToken?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;

  metaData: UserMetaData[];
};

type LocationData = {
  city: string;
  region: string;
  timezone: string;
  country: string;
  countryFlag: CountryFlag;
};

type CountryFlag = {
  emoji: string;
  unicode: string;
};

type UserMetaData = {
  userId: number;
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  timezone?: string;
  lastVisit: string;
};

type EmailOtp = {
  id: number;
  email: string;
  otp: string;
  expiresAt: string;
  createdAt: string;
}