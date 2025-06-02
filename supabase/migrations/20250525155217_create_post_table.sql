CREATE SEQUENCE "Post_id_seq";

CREATE TABLE "Post" (
    id INTEGER NOT NULL DEFAULT nextval('"Post_id_seq"'),
    url TEXT NOT NULL,
    time_added INTEGER NOT NULL,
    source TEXT NOT NULL,
    tags TEXT[] NOT NULL,
    attrs JSONB NOT NULL,
    links JSONB NOT NULL,
    title TEXT,
    abstract TEXT,
    content TEXT,
    html TEXT,
    index_status TEXT DEFAULT 'pending',
    UNIQUE(source, url)
);

ALTER SEQUENCE "Post_id_seq" OWNED BY "Post"."id";
