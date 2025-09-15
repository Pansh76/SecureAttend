# SecureAttend - Liveness Enabled Face Recognition System

A comprehensive attendance management system using real-time facial recognition with liveness detection, mask handling, and anomaly alerting.

## Features

### Core Features
- **Face Recognition**: Real-time identification using webcam
- **Liveness Detection**: Prevents spoofing with photo/video attacks
- **Mask Handling**: Works with face coverings and obstructions
- **Admin Dashboard**: Complete management interface
- **Attendance Database**: Secure storage and reporting

### Advanced Features
- **Anomaly Alerts**: Real-time suspicious activity detection
- **API Integration**: RESTful APIs for third-party integration
- **Role-based Access Control**: Admin and user permissions
- **Data Security**: GDPR compliant with encryption

## Technology Stack

### Frontend
- Next.js 14 with TypeScript
- Tailwind CSS for styling
- WebRTC for camera access
- Real-time updates with WebSocket

### Backend
- Python FastAPI
- PostgreSQL database
- JWT authentication
- OpenCV for computer vision
- TensorFlow/PyTorch for ML models

### Machine Learning Models
- **Face Detection**: MTCNN/YOLO
- **Face Recognition**: FaceNet/ArcFace
- **Liveness Detection**: CNN + RNN hybrid
- **Mask Detection**: Custom trained model

## Project Structure

```
SecureAttend/
├── frontend/                 # Next.js frontend
│   ├── components/          # React components
│   ├── pages/              # Next.js pages
│   ├── hooks/              # Custom React hooks
│   └── utils/              # Utility functions
├── backend/                 # Python FastAPI backend
│   ├── app/                # Main application
│   ├── models/             # Database models
│   ├── ml_models/          # ML model implementations
│   ├── routers/            # API routes
│   └── utils/              # Utility functions
├── database/               # Database migrations and seeds
├── docs/                   # Documentation
└── deployment/             # Docker and deployment configs
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL 13+
- Webcam access

### Installation

1. Clone the repository
2. Install frontend dependencies: `cd frontend && npm install`
3. Install backend dependencies: `cd backend && pip install -r requirements.txt`
4. Set up database and environment variables
5. Run migrations and seed data
6. Start development servers

## API Documentation

- Authentication endpoints
- Face recognition APIs
- Attendance management
- Admin dashboard APIs
- Real-time WebSocket connections

## Security Features

- JWT token authentication
- HTTPS encryption
- Biometric data encryption
- GDPR compliance
- Role-based access control
- Anomaly detection and alerting

## License

MIT License - see LICENSE file for details
