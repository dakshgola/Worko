import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://placeholder-url';

async function sync() {
  console.log("Starting database table programmatics sync...");
  const sql = neon(databaseUrl);

  try {
    // 1. users
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        clerk_id TEXT UNIQUE,
        name TEXT,
        email TEXT NOT NULL UNIQUE,
        profile_image TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log("- Created/verified 'users' table");

    // 2. notes
    await sql`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL DEFAULT 'Untitled',
        content TEXT,
        plain_text TEXT,
        word_count INTEGER NOT NULL DEFAULT 0,
        color TEXT NOT NULL DEFAULT '#6c5ce7',
        is_pinned BOOLEAN NOT NULL DEFAULT false,
        is_favorite BOOLEAN NOT NULL DEFAULT false,
        is_trashed BOOLEAN NOT NULL DEFAULT false,
        trashed_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log("- Created/verified 'notes' table");

    // 3. whiteboards
    await sql`
      CREATE TABLE IF NOT EXISTS whiteboards (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL DEFAULT 'Untitled Whiteboard',
        color TEXT NOT NULL DEFAULT '#6c5ce7',
        is_favorite BOOLEAN NOT NULL DEFAULT false,
        is_trashed BOOLEAN NOT NULL DEFAULT false,
        elements TEXT,
        trashed_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log("- Created/verified 'whiteboards' table");

    // 4. spaces
    await sql`
      CREATE TABLE IF NOT EXISTS spaces (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT NOT NULL DEFAULT 'Purple',
        owner_id TEXT NOT NULL,
        is_favorite BOOLEAN NOT NULL DEFAULT false,
        is_archived BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log("- Created/verified 'spaces' table");

    // 5. pages
    await sql`
      CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY,
        space_id TEXT NOT NULL,
        title TEXT NOT NULL DEFAULT 'Untitled Page',
        content TEXT,
        template TEXT NOT NULL DEFAULT 'Blank Page',
        is_favorite BOOLEAN NOT NULL DEFAULT false,
        is_archived BOOLEAN NOT NULL DEFAULT false,
        created_by TEXT NOT NULL,
        updated_by TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        linked_tasks TEXT,
        linked_notes TEXT,
        linked_whiteboards TEXT,
        linked_events TEXT
      );
    `;
    console.log("- Created/verified 'pages' table");

    // 6. generated_apps
    await sql`
      CREATE TABLE IF NOT EXISTS generated_apps (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        app_name TEXT NOT NULL,
        description TEXT,
        icon TEXT NOT NULL DEFAULT 'Flame',
        color TEXT NOT NULL DEFAULT '#F97316',
        json_config TEXT NOT NULL,
        is_pinned BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log("- Created/verified 'generated_apps' table");

    // 7. user_preferences
    await sql`
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id TEXT PRIMARY KEY,
        theme TEXT NOT NULL DEFAULT 'system',
        language TEXT NOT NULL DEFAULT 'en',
        timezone TEXT NOT NULL DEFAULT 'UTC',
        ai_model TEXT NOT NULL DEFAULT 'Gemini',
        ai_tone TEXT NOT NULL DEFAULT 'Professional',
        ai_refine BOOLEAN NOT NULL DEFAULT true,
        ai_summaries BOOLEAN NOT NULL DEFAULT true,
        ai_task_gen BOOLEAN NOT NULL DEFAULT true,
        ai_meeting_notes BOOLEAN NOT NULL DEFAULT true,
        ai_whiteboard_assistant BOOLEAN NOT NULL DEFAULT true,
        ai_page_gen BOOLEAN NOT NULL DEFAULT true,
        email_notifications BOOLEAN NOT NULL DEFAULT true,
        push_notifications BOOLEAN NOT NULL DEFAULT true,
        reminders BOOLEAN NOT NULL DEFAULT true,
        task_due_alerts BOOLEAN NOT NULL DEFAULT true,
        calendar_event_alerts BOOLEAN NOT NULL DEFAULT true,
        mentions BOOLEAN NOT NULL DEFAULT true,
        comments BOOLEAN NOT NULL DEFAULT true,
        collaborator_activity BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log("- Created/verified 'user_preferences' table");

    // 8. categories
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL DEFAULT '#6c5ce7',
        icon TEXT NOT NULL DEFAULT 'Folder',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log("- Created/verified 'categories' table");

    // 9. chats
    await sql`
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        model TEXT NOT NULL DEFAULT 'Gemini',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log("- Created/verified 'chats' table");

    // 10. messages
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log("- Created/verified 'messages' table");

    // 11. calendar_events
    await sql`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT,
        time TEXT,
        category TEXT NOT NULL DEFAULT 'Meeting',
        priority TEXT NOT NULL DEFAULT 'Medium',
        notes TEXT,
        recurring BOOLEAN NOT NULL DEFAULT false,
        completed BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log("- Created/verified 'calendar_events' table");

    console.log("Database tables sync completed successfully!");
  } catch (err) {
    console.error("Failed to sync database tables:", err);
  }
}

sync();
