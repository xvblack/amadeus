-- model Post {
--   id         Int      @id @default(autoincrement())
--   url        String
--   time_added Int
--   source     String
--   tags       String[]
--   attrs      Json
--   links      Json
--   title      String?
--   abstract   String?
--   content    String?
--   html       String?
--   index_status String? @default("pending")

--   @@unique([source, url])
-- }

CREATE SEQUENCE "Post_id_seq";

CREATE TABLE "Post" (
    id INTEGER NOT NULL PRIMARY KEY DEFAULT nextval('"Post_id_seq"'),
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

CREATE TABLE "RssFeeds" (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL,
    frequency int NOT NULL,
    time_last_crawled INTEGER NOT NULL DEFAULT 0,
    UNIQUE(url)
);

CREATE TABLE "Lens" (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE "LensClassification" (
    id SERIAL PRIMARY KEY,
    lens_id INTEGER NOT NULL REFERENCES "Lens" (id),
    post_id INTEGER NOT NULL REFERENCES "Post" (id),
    classification JSONB NOT NULL,
    UNIQUE(lens_id, post_id)
);