export type TimeSlot = {
  _id: string;
  time: string;
  available?: boolean;
  maxReservations: number;
};

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export type SpecialOccasion = 'Birthday' | 'Anniversary' | 'Business' | 'Other' | '';

export type PreOrderItem = {
  item: string;
  quantity: number;
  specialInstructions?: string;
};

export type Feedback = {
  rating: number;
  comment?: string;
  submittedAt: string; // ISO date string
};

export type Reservation = {
  _id: string;
  date: string; // ISO date string
  timeSlot: string;
  partySize: number;
  name: string;
  email: string;
  phone: string;
  specialRequests?: string;
  specialOccasion?: SpecialOccasion;
  occasionDetails?: string;
  status: ReservationStatus;
  user?: string; // User ID
  table?: string; // Table ID
  preOrders?: PreOrderItem[];
  feedback?: Feedback;
  loyaltyPoints?: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

export type ReservationFormData = Omit<Reservation, '_id' | 'status' | 'createdAt' | 'updatedAt' | 'user' | 'table' | 'feedback' | 'loyaltyPoints'>;

export type User = {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  loyaltyPoints?: number;
  visitCount?: number;
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
};

export type Table = {
  _id: string;
  tableNumber: number;
  capacity: number;
  location: 'Window' | 'Bar' | 'Main' | 'Outdoor' | 'Private';
  isActive: boolean;
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
};

export type MenuItem = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'Appetizer' | 'Main Course' | 'Dessert' | 'Beverage';
  imageUrl?: string;
  isAvailable: boolean;
  isPopular?: boolean;
  allergens?: string[];
  dietaryInfo?: string[];
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
};

export type WaitlistStatus = 'waiting' | 'seated' | 'left' | 'cancelled';

export type Waitlist = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  partySize: number;
  estimatedWaitTime?: number; // in minutes
  status: WaitlistStatus;
  notified: boolean;
  user?: string; // User ID
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};
