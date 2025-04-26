# StreamCloud: Full System Architecture & Implementation Document

## Overview

StreamCloud is a cost-efficient, private media streaming platform inspired by Plex. It enables media acquisition via torrents and direct links, cloud-based storage, and playback through mobile apps. The platform supports video, audio, and future personal content uploads. It has two roles: admin and user, each with distinct capabilities.

---

## 1. Technology Stack

### Backend

- **Language:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (via Sequelize ORM)
- **Torrent Client:** Aria2 (JSON-RPC)
- **RSS Parsing:** `rss-parser`
- **Authentication:** JWT (role-based)
- **Storage:** Local filesystem or mountable Oracle block volume
- **Security:** Bcrypt for password hashing

### Frontend (Admin & User Mobile App)

- **Framework:** React Native (Android & iOS)
- **Navigation:** React Navigation
- **Storage:** AsyncStorage for session & local config
- **Media Playback:** AndroidX Media + ExoPlayer + FFmpeg
- **Base Player Fork:** Just Player (custom fork)
- **State Management:** Redux Toolkit
- **Notifications:** In-app alerts, optional FCM

### Web App (Future PWA)

- **Framework:** React.js with PWA support
- **Deployment:** Optional phase after mobile apps

---

## 2. Backend Folder Structure

```
streamcloud-backend/
├── app.js
├── server.js
├── .env
├── config/
│   └── db.js
├── controllers/
│   └── authController.js
├── models/
│   └── index.js
├── routes/
│   └── authRoutes.js
├── middlewares/
│   └── authMiddleware.js
├── services/
├── utils/
│   └── token.js
├── migrations/
├── seeders/
```

---

## 3. Coding Standards

- **Code Style:** Airbnb with ESLint
- **Formatting:** Prettier
- **Commits:** Conventional commits
- **Versioning:** Git with changelogs

---

## 4. Database Schema

### Users

| Field    | Type   | Notes       |
| -------- | ------ | ----------- |
| id       | UUID   | Primary Key |
| username | STRING | Unique      |
| password | STRING | Hashed      |
| role     | ENUM   | admin, user |

### Media

| Field     | Type     | Notes                          |
| --------- | -------- | ------------------------------ |
| id        | UUID     | Primary Key                    |
| title     | STRING   | Media title                    |
| category  | ENUM     | movie, series, animation, etc. |
| genre     | STRING[] | Array of genres                |
| type      | ENUM     | video, audio                   |
| format    | STRING   | e.g., hevc, flac               |
| filePath  | STRING   | Path to media                  |
| thumbnail | STRING   | Preview image                  |
| createdBy | UUID     | Admin user ID                  |

### RSSFeeds

\| id | UUID | Primary Key | | url | STRING | Feed URL | | label | STRING | Description |

### Downloads

\| id | UUID | Primary Key | | mediaId | UUID | FK to Media | | status | ENUM | pending, done | | sourceType | ENUM | rss, magnet, direct, file |

### Requests

\| id | UUID | Primary Key | | userId | UUID | FK to Users | | request | TEXT | User-requested content | | status | ENUM | open, fulfilled, closed |

### Notifications

\| id | UUID | Primary Key | | userId | UUID | FK to Users | | message | TEXT | Notification body | | isRead | BOOLEAN | |

### PersonalVault (Future)

\| id | UUID | Primary Key | | ownerId | UUID | FK to Admin Users | | mediaPath | STRING | Path to personal files | | type | ENUM | photo, video |

---

## 5. Backend API Endpoints

### Auth

- `POST /auth/login`
- `POST /auth/users` – Admin only

### Media

- `GET /media`
- `GET /media/:id`
- `POST /media` – Admin
- `DELETE /media/:id` – Admin

### Streaming

- `GET /stream/:id` – Temporary signed URL
- `GET /download/:id` – Direct download

### Uploads

- `POST /upload/direct`
- `POST /upload/magnet`
- `POST /upload/file`
- `POST /rss/download` – Admin only

### RSS Feeds

- `GET /rss`
- `POST /rss`

### Notifications

- `GET /notifications`
- `POST /notifications/read/:id`

### Requests

- `POST /requests`
- `GET /requests` – Admin only

### Backup

- `GET /backup`
- `POST /restore`

---

## 6. Mobile App Structure (React Native)

### User Pages

- **Login/Register** – Auth and role-based redirect
- **Media Library**
  - Video tabs: Movies, Series, Animation, Others
  - Audio tab: Music with High-Res support
  - Filters: Category, Genre, Type
- **Media Player**
  - Powered by AndroidX Media, ExoPlayer, and FFmpeg
  - Supports all formats
  - Features: Brightness, volume, seek, EQ, subtitle handling
- **Search** – Title & genre based
- **Downloads** – Offline playback
- **Notifications** – Alerts and updates
- **Settings** – Theme, preferences, cache

### Admin Only

- **RSS Feed Monitor** – View & download items
- **Upload Media** – Magnet, torrent file, direct link
- **User Requests** – Fulfill or close
- **MyVault** – Private admin-only library

---

## 7. Web App (Future PWA)

- React with Tailwind
- Offline mode via service workers
- Full parity with mobile app features

---

## 8. Streaming Strategy

- **Player Tech:** AndroidX Media + ExoPlayer + FFmpeg
- **Signed URLs:** Short-lived secure links
- **Fallback:** Option to stream in external app (if enabled by admin)

---

## 9. Notifications

- In-app modals and banners
- Push support via FCM (optional)

---

## 10. Backup & Restore

- PostgreSQL via `pg_dump`
- Media zipped for easy migration
- API endpoints to trigger backup and restore

---

## 11. Deployment Plan

- **Server:** Oracle Cloud Free Tier (Ubuntu)
- **Proxy:** NGINX
- **SSL:** Let’s Encrypt
- **Process Manager:** PM2
- **Future:** Docker support

---

## 12. Future Enhancements

- Personal media uploads with encryption
- Metadata scraper & AI tagging
- Multi-language subtitles
- Audio visualizer and enhanced EQ
- Redis caching for high-speed search
- Federated user support (invite-only network)
- Web-based uploader (drag & drop)
- P2P streaming option (WebRTC-based)
- AI recommendation system
- Role-based access for groups/family

