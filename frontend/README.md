# MeetSense

A modern Google Meet-like video conferencing platform with AI-powered face expression tracking and post-meeting analytics.

## Features

- **HD Video Conferencing**: Crystal clear video and audio quality
- **AI Expression Tracking**: Real-time facial expression analysis during meetings
- **Post-Meeting Analytics**: Detailed engagement metrics and participant insights
- **Unlimited Participants**: Host meetings with as many people as you need
- **Meeting History**: Access past meeting recordings and analytics
- **Real-time Chat**: In-meeting messaging system
- **Screen Sharing**: Share your screen with participants
- **Responsive Design**: Works seamlessly on desktop and tablet devices

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons
- **Context API** - State management

## Project Structure

```
src/
├── assets/              # Static images and icons
├── components/          # Reusable UI components
│   ├── Button.jsx
│   ├── InputField.jsx
│   ├── Loader.jsx
│   ├── Modal.jsx
│   ├── Navbar.jsx
│   ├── MeetingTile.jsx
│   ├── ParticipantCard.jsx
│   ├── ChatBox.jsx
│   ├── ControlBar.jsx
│   ├── AnalyticsCard.jsx
│   ├── ExpressionOverlay.jsx
│   └── NotificationToast.jsx
├── layouts/             # Page layouts
│   ├── AuthLayout.jsx
│   ├── DashboardLayout.jsx
│   └── MeetingLayout.jsx
├── pages/               # Main application pages
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Dashboard.jsx
│   ├── CreateMeeting.jsx
│   ├── JoinMeeting.jsx
│   ├── MeetingRoom.jsx
│   ├── Analytics.jsx
│   ├── Settings.jsx
│   └── NotFound.jsx
├── context/             # React Context providers
│   ├── AuthContext.jsx
│   ├── MeetingContext.jsx
│   └── UIContext.jsx
├── hooks/               # Custom React hooks
│   ├── useAuth.js
│   ├── useMeeting.js
│   ├── useAnalytics.js
│   └── useNotifications.js
├── services/            # API service layer (placeholders)
│   ├── api.js
│   ├── authService.js
│   ├── meetingService.js
│   └── analyticsService.js
├── utils/               # Helper functions
│   ├── constants.js
│   ├── formatDate.js
│   ├── calculateActiveTime.js
│   └── validateInput.js
├── App.jsx
├── main.jsx
└── router.jsx
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` to view the application.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Backend Integration

The frontend is ready for backend integration. All API calls are abstracted in the `services/` directory with placeholder implementations.

### Integration Points

1. **Authentication** - `src/services/authService.js`
   - Login: `POST /api/auth/login`
   - Signup: `POST /api/auth/signup`
   - Logout: `POST /api/auth/logout`

2. **Meetings** - `src/services/meetingService.js`
   - Create: `POST /api/meetings`
   - Join: `POST /api/meetings/:id/join`
   - Leave: `POST /api/meetings/:id/leave`
   - Messages: `POST /api/meetings/:id/messages`
   - Expressions: `POST /api/meetings/:id/expressions`

3. **Analytics** - `src/services/analyticsService.js`
   - Meeting Analytics: `GET /api/analytics/meetings/:id`
   - Overall Analytics: `GET /api/analytics/overview`

### WebRTC Integration

For video conferencing functionality, integrate a WebRTC solution:
- WebRTC native API
- SimpleWebRTC
- PeerJS
- Agora SDK
- Daily.co

### AI Expression Tracking

Integrate face detection and emotion recognition:
- TensorFlow.js with Face-API
- AWS Rekognition
- Azure Face API
- Custom ML model

## Design System

### Color Palette

- **Primary**: Blue gradient (`#3b82f6` to `#2563eb`)
- **Secondary**: Violet gradient (`#8b5cf6` to `#7e22ce`)
- **Success**: Green (`#10b981`)
- **Warning**: Yellow (`#f59e0b`)
- **Danger**: Red (`#ef4444`)

### Key Components

- **Gradient Buttons**: `btn-gradient` class
- **Text Gradients**: `text-gradient` class
- **Card Design**: Rounded corners (`rounded-2xl`), soft shadows (`shadow-xl`)
- **Animations**: Framer Motion for smooth transitions

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Key Features to Implement (Backend)

1. **WebRTC Integration**: Real-time video/audio streaming
2. **WebSocket Server**: Real-time chat and expression updates
3. **Database Schema**: Users, meetings, participants, messages, analytics
4. **AI Model Integration**: Face expression recognition
5. **Cloud Storage**: Meeting recordings and media files
6. **Authentication**: JWT tokens with Supabase Auth

## Contributing

This is a frontend-only implementation. To contribute:

1. Follow the existing component structure
2. Maintain consistent styling with Tailwind CSS
3. Use Framer Motion for animations
4. Keep components modular and reusable
5. Add proper TypeScript types when converting to TypeScript

## License

MIT
