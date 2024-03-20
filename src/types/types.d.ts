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
  createdAt: Date;
  updatedAt: Date;
};

type Message = {
  id: number;
  userId: number;
  user: User;
  text: string;
  ai?: boolean;
  audioSource?: string;
  createdAt: string;
  updatedAt: string;
};

type LocationData = {
  city: string;
  region: string;
  country: string;
  timezone: string;
};

type Views = {
  id: number;
  count: number;
  lastViewAt: string;
};

type EmailOtp = {
  id: number;
  email: string;
  otp: string;
  expires: number;
  isVerified: boolean;
  createdAt: string;
};

type Chat = {
  id: number;
  userId: number;
  title: string;
  conversations: Conversation[];
  user: User;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ConversationRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

type Conversation = {
  id: number;
  userId: number;
  chatId: number;
  role: ConversationRole;
  content: string;
  user: User;
  chat: Chat;
  createdAt: string;
};
