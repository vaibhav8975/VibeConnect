# VibeConnect - Next-Gen Dating & Friendship App

## Overview

VibeConnect is a modern full-stack web application that combines dating and friendship matching through music, personality, and genuine connections. The platform goes beyond traditional appearance-based matching by incorporating personality quizzes, music preferences, and real-time interactions. Users can discover potential matches, engage in conversations, share musical vibes on a social board, and connect through video/audio calls.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **Real-time Communication**: WebSocket support for live messaging
- **API Design**: RESTful endpoints with JSON responses

### Database Design
- **Schema**: Comprehensive user profiles with photos, music clips, personality traits
- **Core Tables**: Users, matches, messages, photos, music clips, vibeboard posts
- **Relationships**: Many-to-many matching system, one-to-many message threads
- **Data Types**: JSONB for personality traits, arrays for interests and music genres

### Key Features Architecture
- **Matching System**: Algorithm-based profile discovery with like/pass functionality
- **Real-time Messaging**: WebSocket implementation for instant chat with message limits
- **Premium Model**: Freemium approach with 30 free messages before paywall
- **Media Integration**: Photo upload system and music clip attachment
- **Social Features**: VibeBoard for public posts with music sharing

### Development Environment
- **Build System**: Vite with hot module replacement and TypeScript support
- **Code Organization**: Monorepo structure with shared schemas between client/server
- **Path Aliases**: Clean import paths using TypeScript path mapping
- **Development Tools**: Replit integration with banner and cartographer plugins

## External Dependencies

### Database & Hosting
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Replit Platform**: Development and hosting environment

### Authentication & Security
- **Replit Auth**: OAuth 2.0 / OpenID Connect authentication system
- **Session Storage**: PostgreSQL-backed session management with connect-pg-simple

### UI & Styling
- **Shadcn/ui**: Pre-built component library with Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide Icons**: Icon library for UI elements
- **Google Fonts**: Inter font family for typography

### Development Tools
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

### Audio/Video Features
- **WebRTC**: Planned integration for video/audio calling functionality
- **HTML5 Audio**: Native audio playback for music clips

### Form & Data Validation
- **Zod**: Schema validation library used with Drizzle for type-safe database operations
- **React Hook Form**: Form state management with validation integration