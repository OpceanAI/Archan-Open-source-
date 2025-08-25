# Overview

Archan-chan is a kawaii-themed Discord bot written in JavaScript/TypeScript with a programmer persona. The bot features a comprehensive leveling system, moderation tools, bad word filtering, role rewards, and utility commands. It uses anime-style expressions ("nya~", "uwu") and programming terminology throughout its interactions. The project includes both a JavaScript implementation (main directory) and a TypeScript implementation (archan/bot directory), with the main focus on the JavaScript version.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Core Bot Structure
- **Discord.js v14**: Primary framework for Discord API interactions
- **Slash Commands**: Modern Discord command system with 33+ commands organized by category including AI integration
- **Event-Driven Architecture**: Modular event handling for message processing, interactions, and guild events
- **In-Memory Database**: JavaScript Map-based data storage replacing Redis for guild settings and user data
- **Kawaii Personality System**: Dynamic response generation with anime-style expressions and programming terminology
- **AI Integration**: Google Gemini-powered kawaii programmer assistant with 3-tier fallback system

## Data Management
- **Guild Configuration**: Per-server settings for leveling, moderation, and customization
- **User Leveling**: XP tracking, level calculations with configurable base XP and difficulty multipliers
- **Statistics Tracking**: Command usage, message processing, and bot performance metrics
- **Persistent Storage**: In-memory Maps for guild data, user levels, and global statistics

## Leveling System
- **XP Calculation**: Configurable base XP (default 100) with exponential difficulty scaling
- **Anti-Spam Protection**: 60-second cooldown system to prevent XP farming
- **Role Rewards**: Automatic role assignment based on level achievements
- **Leaderboards**: Ranking system with user position tracking
- **Canvas Integration**: Visual rank cards using node-canvas for user statistics

## Moderation Features
- **Bad Word Filtering**: Configurable word blacklist with role-based whitelist system
- **Kick/Ban Commands**: Standard moderation tools with kawaii-themed responses
- **Message Management**: Bulk message deletion and content filtering
- **Permission Validation**: Hierarchical role checking and bot permission verification

## Command Categories
- **Basic Commands**: Ping, info, help, AI chat with latency monitoring
- **Level Commands**: Rank display, leaderboard, XP calculation, configuration
- **Moderation Commands**: User management, message cleanup, role assignment
- **Filter Commands**: Bad word management, whitelist configuration
- **Reward Commands**: Role reward setup and management
- **Utility Commands**: Embed creation, server information
- **AI Commands**: Gemini-powered programming assistance with kawaii personality

## Canvas Rendering
- **Rank Cards**: Custom visual cards showing user level, XP progress, and statistics
- **Image Processing**: Avatar loading, background customization, progress bars
- **Font Management**: Custom font registration and text rendering
- **Dynamic Content**: Real-time generation of user-specific graphics

## AI System (Google Gemini Integration)
- **3-Tier Fallback System**: Primary (Gemini 2.5 Flash) → Secondary (Gemini 2.5 Pro) → Final (Gemini 1.5 Pro)
- **Kawaii Programmer Personality**: AI responses with anime expressions and programming expertise
- **Code Formatting**: Automatic markdown code block formatting for all code responses
- **Message Splitting**: Intelligent message division respecting Discord's 2000-character limit
- **Mention Triggers**: Responds to "Archan" or "archan" mentions for conversational assistance
- **Programming Focus**: Specialized in software development, algorithms, and technical explanations
- **Context Preservation**: Maintains conversation flow across split messages

# External Dependencies

## Core Dependencies
- **discord.js**: Discord API wrapper and bot framework
- **canvas**: HTML5 Canvas API for server-side image generation and rank cards
- **chalk**: Terminal output colorization for enhanced logging
- **dotenv**: Environment variable management for bot configuration
- **@google/genai**: Google Gemini AI integration for programming assistance

## Development Tools
- **TypeScript**: Optional type-safe implementation in archan/bot directory
- **Node.js**: Runtime environment with ES6+ features

## Optional Services
- **Redis**: Alternative data persistence option (TypeScript implementation)
- **CDN Services**: Discord attachment URLs for storing user avatar and custom images

## Asset Dependencies
- **Font Files**: Custom fonts for canvas rendering (HurmitNerdFont)
- **Background Images**: Welcome cards and rank card backgrounds
- **JSON Data**: Pre-configured anime GIF collections for interactive commands (hugs, pats, cookies)

## Environment Variables
- **ARCHAN_BOT_TOKEN**: Discord bot authentication token
- **ARCHAN_CLIENT_ID**: Discord application client ID for command registration
- **ARCHAN_OWNER_ID**: Bot owner user ID for administrative privileges
- **GEMINI_API_KEY**: Google Gemini API key for AI functionality
- **LOG_LEVEL**: Logging verbosity configuration