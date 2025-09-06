export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'employee';
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface Gate {
  id: string;
  name: string;
  zoneIds: string[];
  location: string;
}

export interface Zone {
  id: string;
  name: string;
  categoryId: string;
  gateIds: string[];
  totalSlots: number;
  occupied: number;
  free: number;
  reserved: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  rateNormal: number;
  rateSpecial: number;
  open: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  rateNormal: number;
  rateSpecial: number;
}

export interface Car {
  plate: string;
  brand: string;
  model: string;
  color: string;
}

export interface Subscription {
  id: string;
  userName: string;
  active: boolean;
  category: string;
  cars: Car[];
  startsAt: string;
  expiresAt: string;
  currentCheckins: Array<{
    ticketId: string;
    zoneId: string;
    checkinAt: string;
  }>;
}

export interface Ticket {
  id: string;
  type: 'visitor' | 'subscriber';
  zoneId: string;
  gateId: string;
  checkinAt: string;
  checkoutAt: string | null;
}

export interface CheckoutBreakdown {
  from: string;
  to: string;
  hours: number;
  rateMode: 'normal' | 'special';
  rate: number;
  amount: number;
}

export interface CheckoutResponse {
  ticketId: string;
  checkinAt: string;
  checkoutAt: string;
  durationHours: number;
  breakdown: CheckoutBreakdown[];
  amount: number;
  zoneState: Zone;
}

export interface ParkingStateReport {
  zoneId: string;
  name: string;
  totalSlots: number;
  occupied: number;
  free: number;
  reserved: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  subscriberCount: number;
  open: boolean;
}

export interface RushHour {
  id: string;
  weekDay: number;
  from: string;
  to: string;
}

export interface Vacation {
  id: string;
  name: string;
  from: string;
  to: string;
}

export interface WebSocketMessage {
  type: 'zone-update' | 'admin-update';
  payload: any;
}

export interface AdminUpdate {
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: any;
  timestamp: string;
}