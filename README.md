# Prompt Builder

A web-based application for creating, organizing, and managing prompts with rich text editing capabilities and image attachments.

## Features

- **Project Management**: Organize prompts into projects
- **Rich Text Editor**: Format your prompts with bold, italic, underline, lists, and headings
- **Image Attachments**: Add images to your prompts with base64 encoding
- **Export to Clipboard**: Copy formatted prompts as markdown-style plain text
- **Persistent Storage**: All data saved to a local SQLite database

## What It Does

Prompt Builder helps you create and organize reusable prompts for AI assistants or other purposes. You can:

1. Create multiple projects to categorize your prompts
2. Write prompts with rich text formatting
3. Attach images to provide visual context
4. Export prompts to clipboard in a clean text format
5. Edit and delete projects and prompts as needed

All your data is stored locally in a SQLite database, ensuring privacy and persistence between sessions.

## Dependencies

### Backend
- **Node.js** (v14 or higher recommended)
- **express** (^4.18.2) - Web server framework
- **better-sqlite3** (^9.2.2) - SQLite database driver
- **cors** (^2.8.5) - Cross-origin resource sharing middleware

### Frontend
- Vanilla JavaScript (no frameworks)
- HTML5 with contenteditable for rich text editing
- CSS3 for styling

### Dev Dependencies
- **nodemon** (^3.0.2) - Auto-restart server during development

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the server:
   ```bash
   npm start
   ```

   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

3. Create a new project and start building prompts!

## Database

The application uses SQLite for data storage. The database file (`promptbuilder.db`) is automatically created on first run and stores:

- Projects
- Prompts (with rich text content)
- Images (base64 encoded)

The database file is excluded from version control via `.gitignore`.

## Project Structure

```
.
├── index.html          # Main HTML file
├── app.js             # Frontend JavaScript
├── styles.css         # CSS styles
├── server.js          # Backend API server
├── package.json       # Node.js dependencies
└── promptbuilder.db   # SQLite database (created on first run)
```

## API Endpoints

- `GET /api/state` - Retrieve all projects, prompts, and images
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update project name
- `DELETE /api/projects/:id` - Delete a project
- `POST /api/prompts` - Create a new prompt
- `PUT /api/prompts/:id` - Update a prompt
- `DELETE /api/prompts/:id` - Delete a prompt
- `POST /api/images` - Add an image to a prompt
- `DELETE /api/images/:id` - Delete an image

## License

ISC
