type UserRole = 'USER' | 'ADMIN';

type User = {
  id: number;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  photo?: string;
  password: string;
  resetPasswordToken?: string;
  verificationToken?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
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
