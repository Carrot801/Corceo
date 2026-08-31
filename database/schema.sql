-- =========================================
-- CORCEO DATABASE SCHEMA
-- PostgreSQL
-- =========================================


-- =========================================
-- USERS
-- =========================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    email VARCHAR(255) NOT NULL,

    password_hash TEXT NOT NULL,

    full_name VARCHAR(255),

    username VARCHAR(50),

    created_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
);


-- Case-insensitive uniqueness

CREATE UNIQUE INDEX users_email_unique
ON users (LOWER(email));

CREATE UNIQUE INDEX users_username_unique
ON users (LOWER(username))
WHERE username IS NOT NULL;


-- =========================================
-- FOLDERS
-- =========================================

CREATE TABLE folders (
    id SERIAL PRIMARY KEY,

    name TEXT NOT NULL,

    parent_id INTEGER,

    user_id INTEGER NOT NULL,

    CONSTRAINT folders_parent_id_fkey
        FOREIGN KEY (parent_id)
        REFERENCES folders(id)
        ON DELETE CASCADE,

    CONSTRAINT folders_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


CREATE INDEX idx_folders_name
ON folders(name);

CREATE INDEX idx_folders_user_id
ON folders(user_id);

CREATE INDEX idx_folders_parent_id
ON folders(parent_id);


-- =========================================
-- PROJECTS
-- =========================================

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,

    name TEXT NOT NULL,

    folder_id INTEGER,

    image_url TEXT,

    is_favorite BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    user_id INTEGER NOT NULL,

    CONSTRAINT projects_folder_id_fkey
        FOREIGN KEY (folder_id)
        REFERENCES folders(id)
        ON DELETE SET NULL,

    CONSTRAINT projects_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


CREATE INDEX idx_projects_name
ON projects(name);


CREATE INDEX idx_projects_user_id
ON projects(user_id);

CREATE INDEX idx_projects_folder_id
ON projects(folder_id);


-- =========================================
-- DATASETS
-- =========================================

CREATE TABLE datasets (
    id SERIAL PRIMARY KEY,

    project_id INTEGER NOT NULL,

    name TEXT,

    created_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    user_id INTEGER NOT NULL,

    CONSTRAINT datasets_project_id_fkey
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE,

    CONSTRAINT datasets_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    -- Corceo currently uses one dataset per project
    CONSTRAINT datasets_project_id_unique
        UNIQUE (project_id)
);


-- No separate project_id index is required.
-- UNIQUE(project_id) already creates one.

CREATE INDEX idx_datasets_user_id
ON datasets(user_id);


-- =========================================
-- DATA ROWS
-- =========================================

CREATE TABLE rows (
    id SERIAL PRIMARY KEY,

    dataset_id INTEGER NOT NULL,

    data JSONB NOT NULL,

    created_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    user_id INTEGER NOT NULL,

    CONSTRAINT rows_dataset_id_fkey
        FOREIGN KEY (dataset_id)
        REFERENCES datasets(id)
        ON DELETE CASCADE,

    CONSTRAINT rows_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


CREATE INDEX idx_rows_dataset_id
ON rows(dataset_id);

CREATE INDEX idx_rows_user_id
ON rows(user_id);

CREATE INDEX idx_rows_data
ON rows
USING GIN(data);


-- =========================================
-- CHARTS
-- =========================================

CREATE TABLE charts (
    id SERIAL PRIMARY KEY,

    project_id INTEGER NOT NULL,

    dataset_id INTEGER NOT NULL,

    chart_type TEXT NOT NULL,

    x_axis TEXT,

    y_axis TEXT,

    created_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    settings JSONB
        NOT NULL
        DEFAULT '{}'::jsonb,

    chart_config JSONB
        NOT NULL
        DEFAULT '{}'::jsonb,

    user_id INTEGER NOT NULL,

    image_data TEXT,

    is_published BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    CONSTRAINT charts_project_id_fkey
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE,

    CONSTRAINT charts_dataset_id_fkey
        FOREIGN KEY (dataset_id)
        REFERENCES datasets(id)
        ON DELETE CASCADE,

    CONSTRAINT charts_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    -- One saved chart configuration per project
    CONSTRAINT unique_project_id
        UNIQUE (project_id)
);


CREATE INDEX idx_charts_dataset_id
ON charts(dataset_id);

CREATE INDEX idx_charts_user_id
ON charts(user_id);


-- =========================================
-- STORIES
-- =========================================

CREATE TABLE stories (
    id SERIAL PRIMARY KEY,

    name VARCHAR(255) NOT NULL,

    created_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    user_id INTEGER NOT NULL,

    folder_id INTEGER,

    is_published BOOLEAN
        NOT NULL
        DEFAULT FALSE,
    
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,

    image_url TEXT,

    CONSTRAINT stories_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT stories_folder_id_fkey
        FOREIGN KEY (folder_id)
        REFERENCES folders(id)
        ON DELETE SET NULL
);


CREATE INDEX idx_stories_user_id
ON stories(user_id);

CREATE INDEX idx_stories_folder_id
ON stories(folder_id);

CREATE INDEX idx_stories_is_published
ON stories(is_published);


-- =========================================
-- SLIDES
-- =========================================

CREATE TABLE slides (
    id SERIAL PRIMARY KEY,

    story_id INTEGER NOT NULL,

    position INTEGER NOT NULL,

    description TEXT,

    user_id INTEGER NOT NULL,

    CONSTRAINT slides_story_id_fkey
        FOREIGN KEY (story_id)
        REFERENCES stories(id)
        ON DELETE CASCADE,

    CONSTRAINT slides_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    -- A story cannot contain two slides
    -- at the same position.
    CONSTRAINT slides_story_position_unique
        UNIQUE (story_id, position)
);


CREATE INDEX idx_slides_user_id
ON slides(user_id);

-- No separate story_id or (story_id, position)
-- index is needed.
-- UNIQUE(story_id, position) already creates
-- a B-tree index that supports both:
--
-- WHERE story_id = ?
--
-- and:
--
-- WHERE story_id = ?
-- ORDER BY position


-- =========================================
-- SLIDE CONTENT
-- =========================================

CREATE TABLE slide_content (
    id SERIAL PRIMARY KEY,

    slide_id INTEGER NOT NULL,

    -- Nullable because deleting a chart preserves
    -- the story item and sets chart_id to NULL.
    chart_id INTEGER,

    position INTEGER,


    user_id INTEGER NOT NULL,

    layout JSONB
        NOT NULL
        DEFAULT
        '{
            "x": 0,
            "y": 0,
            "width": 100,
            "height": 100,
            "zIndex": 1
        }'::jsonb,

    CONSTRAINT slide_content_slide_id_fkey
        FOREIGN KEY (slide_id)
        REFERENCES slides(id)
        ON DELETE CASCADE,

    CONSTRAINT slide_content_chart_id_fkey
        FOREIGN KEY (chart_id)
        REFERENCES charts(id)
        ON DELETE SET NULL,

    CONSTRAINT slide_content_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


CREATE INDEX idx_slide_content_slide_id
ON slide_content(slide_id);

CREATE INDEX idx_slide_content_chart_id
ON slide_content(chart_id);

CREATE INDEX idx_slide_content_user_id
ON slide_content(user_id);


-- Position only needs to be unique when
-- a position value actually exists.

CREATE UNIQUE INDEX idx_slide_content_unique_position
ON slide_content(slide_id, position)
WHERE position IS NOT NULL;


-- =========================================
-- SLIDE ANNOTATIONS
-- =========================================

CREATE TABLE slide_annotations (
    id SERIAL PRIMARY KEY,

    slide_id INTEGER NOT NULL,

    annotation JSONB NOT NULL,

    user_id INTEGER NOT NULL,

    CONSTRAINT slide_annotations_slide_id_fkey
        FOREIGN KEY (slide_id)
        REFERENCES slides(id)
        ON DELETE CASCADE,

    CONSTRAINT slide_annotations_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


CREATE INDEX idx_slide_annotations_slide_id
ON slide_annotations(slide_id);

CREATE INDEX idx_slide_annotations_user_id
ON slide_annotations(user_id);
