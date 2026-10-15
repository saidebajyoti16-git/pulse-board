# Pulse Board 4.0 Functional Guide

## Content and video uploads

In local mode, the API validates file MIME type and extension and stores uploaded files under `uploads/`. In the Vercel build, images and videos are uploaded directly from the browser to a connected Vercel Blob store using a time-limited upload token. Upload permissions are checked against the signed-in user; only Administrator, Warden, and Content Editor roles can upload.

Supported formats include JPG, PNG, WEBP, GIF, BMP, MP4, WebM, MOV, M4V and OGG/OGV. The UI rejects unsupported formats and requires the chosen content type to match the actual file type. The hosted database stores the Blob URL, not the media bytes.

## Public media captions

A public board is split into a media stage (image/video only), a small caption bar below the media, optional ticker and optional institute/hostel footer. Title and description are never burned into the media file or placed over the image/video.

## Live score publishing

A score has `published`, `live`, `boardIds`, and `updatedAt` fields. A board playlist includes the score only when global live scores are enabled, the match is published/live, and the current board appears in `boardIds`. The display polls every few seconds.

## Board commands

Supported commands: `play`, `pause`, `refresh`, `next`, `previous`, `restart`, `blackout`, and `resume`. Commands are stored with timestamps and consumed by each display on its next playlist poll.

## Roles

| Capability | Admin | Warden | Editor | Score Updater | Viewer |
|---|---:|---:|---:|---:|---:|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Content | ✓ | ✓ | ✓ | — | View |
| Schedule | ✓ | ✓ | ✓ | — | View |
| Scores | ✓ | ✓ | — | ✓ | View |
| News | ✓ | ✓ | ✓ | — | View |
| Boards | ✓ | ✓ | View | View | View |
| Users | ✓ | ✓ | — | — | — |
| System | ✓ | ✓ | — | — | — |
| Audit | ✓ | ✓ | — | — | — |

Only an Administrator can create another Administrator. Cloud-created user passwords are scrypt-hashed and must be at least 12 characters.

## News note

News items can be created, edited, published, hidden, or deleted. The current refresh control refreshes the included digest placeholders; fetching real current headlines requires configuring a licensed external news provider/API key.

## Error handling

The main admin pages include loading, error and empty states. A top-level React error boundary prevents an unhandled rendering exception from becoming a blank page.
