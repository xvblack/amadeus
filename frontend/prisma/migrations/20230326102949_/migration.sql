-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "time_added" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "tags" TEXT[],
    "attrs" JSONB NOT NULL,
    "links" JSONB NOT NULL,
    "title" TEXT,
    "abstract" TEXT,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_source_url_key" ON "Post"("source", "url");
