# Parking Reservation System Frontend

A comprehensive React/Next.js frontend for the WeLink Cargo Parking Reservation System.

## Features

### 🚪 Gate Screen (`/gate/[gateId]`)
- **Visitor Flow**: Select zone and check-in as visitor
- **Subscriber Flow**: Verify subscription and check-in with category validation
- **Real-time Updates**: WebSocket integration for live zone availability
- **Printable Tickets**: Generate printable check-in tickets
- **Zone Cards**: Visual display of occupancy, rates, and availability

### 🏁 Checkpoint Screen (`/checkpoint`)
- **Employee Authentication**: Secure access for checkout operations
- **Ticket Lookup**: Scan or enter ticket IDs for processing
- **Subscription Verification**: Display car details for plate matching
- **Checkout Processing**: Calculate fees with detailed breakdown
- **Force Conversion**: Convert subscriber to visitor for plate mismatches

### 👨‍💼 Admin Dashboard (`/admin`)
- **Parking State Reports**: Real-time system overview
- **Zone Management**: Open/close zones remotely
- **Rate Management**: Update category pricing
- **Schedule Management**: Configure rush hours and vacations
- **Subscription Management**: View all active subscriptions
- **Audit Log**: Live activity monitoring with WebSocket updates

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **State Management**: Redux Toolkit
- **Data Fetching**: React Query
- **Styling**: Tailwind CSS
- **WebSocket**: Native WebSocket API
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Running backend server (see backend README)

### Installation

1. **Clone and install dependencies**:
```bash
cd parking-frontend
npm install
```

2. **Configure environment variables**:
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3000/api/v1/ws
```

3. **Start development server**:
```bash
npm run dev
```

4. **Open browser**:
Navigate to `http://localhost:3001`

## Usage Guide

### Login Credentials
Use these test accounts from the backend seed data:

**Admin Access**:
- Username: `admin` / Password: `adminpass`
- Username: `superadmin` / Password: `superpass`

**Employee Access**:
- Username: `emp1` / Password: `pass1`
- Username: `checkpoint1` / Password: `checkpoint1`

### Testing Flows

#### 1. Gate Check-in Flow
1. Login as any user
2. Go to "البوابات" → Select a gate (e.g., "Main Entrance")
3. **Visitor**: Select zone → Click "دخول"
4. **Subscriber**: Enter subscription ID (e.g., `sub_001`) → Verify → Select matching category zone → Check-in

#### 2. Checkpoint Flow
1. Login as employee
2. Go to "نقطة التفتيش"
3. Enter ticket ID from previous check-in
4. Review details and perform checkout
5. For subscribers: verify car plates or force convert to visitor

#### 3. Admin Flow
1. Login as admin
2. Go to "لوحة الإدارة"
3. **Overview**: View system statistics
4. **Zone Management**: Open/close zones
5. **Rate Management**: Update category prices
6. **Schedule**: Add rush hours and vacations

### WebSocket Features
- **Real-time zone updates**: Occupancy changes reflect immediately
- **Admin notifications**: Live audit log of admin actions
- **Connection status**: Visual indicator in header
- **Auto-reconnection**: Handles connection drops gracefully

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── gate/[gateId]/     # Gate screen with dynamic routing
│   ├── checkpoint/        # Checkout processing
│   ├── admin/            # Admin dashboard
│   ├── login/            # Authentication
│   └── layout.tsx        # Root layout with providers
├── components/
│   ├── ui/               # Reusable UI components
│   ├── gate/             # Gate-specific components
│   └── layout/           # Layout components
├── store/
│   └── slices/           # Redux slices for state management
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and API client
└── types/                # TypeScript type definitions
```

## Key Features Implementation

### State Management
- **Redux Toolkit**: Global state for auth, gate data, admin data
- **React Query**: Server state caching and synchronization
- **Local Storage**: Persistent authentication

### Real-time Updates
- **WebSocket Manager**: Singleton connection handler
- **Auto-reconnection**: Exponential backoff strategy
- **Event Handling**: Type-safe message processing

### Responsive Design
- **Mobile-first**: Optimized for tablets and mobile devices
- **Print Support**: Printable ticket layouts
- **RTL Support**: Arabic language layout support

### Error Handling
- **API Errors**: User-friendly error messages
- **Network Issues**: Offline state handling
- **Validation**: Form validation with error display

## API Integration

The frontend strictly follows the backend API contract:
- **No business logic**: All calculations done server-side
- **Server-authoritative**: Displays only server-provided data
- **WebSocket subscriptions**: Real-time updates per gate
- **Authentication**: JWT token-based security

## Testing

### Manual Testing Scenarios

1. **Gate Operations**:
   - Test visitor check-in to available/unavailable zones
   - Test subscriber verification and category validation
   - Verify WebSocket updates when zones change

2. **Checkpoint Operations**:
   - Test ticket lookup and checkout processing
   - Test force conversion for plate mismatches
   - Verify fee calculations match server breakdown

3. **Admin Operations**:
   - Test zone open/close functionality
   - Test rate updates and schedule management
   - Verify audit log receives WebSocket updates

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
NEXT_PUBLIC_WS_URL=wss://your-api-domain.com/api/v1/ws
```

## Implementation Notes

### Business Logic Compliance
- **Server-side calculations**: Frontend never computes reserved slots, fees, or availability
- **Display-only**: Shows server-provided fields without modification
- **Real-time sync**: WebSocket ensures data consistency

### Performance Optimizations
- **Code splitting**: Automatic route-based splitting
- **Image optimization**: Next.js built-in optimization
- **Bundle analysis**: Optimized dependencies

### Accessibility
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Keyboard navigation**: Full keyboard accessibility
- **Screen readers**: ARIA labels and descriptions
- **Color contrast**: WCAG AA compliant colors

## Known Limitations

1. **Offline Support**: Limited offline functionality
2. **Print Styling**: Basic print layouts (can be enhanced)
3. **Mobile Optimization**: Optimized for tablets, mobile can be improved
4. **Language**: Currently Arabic-focused (can be internationalized)

## Future Enhancements

- [ ] Progressive Web App (PWA) support
- [ ] Advanced offline caching
- [ ] Multi-language support
- [ ] Enhanced mobile UI
- [ ] Advanced reporting charts
- [ ] Notification system
- [ ] Bulk operations for admin

---

**WeLink Cargo Parking System** - Built for hiring and training evaluation purposes.