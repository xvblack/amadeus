create sequence "public"."LensClassification_id_seq";

create sequence "public"."Lens_id_seq";

create sequence "public"."RssFeeds_id_seq";

create table "public"."Lens" (
    "id" integer not null default nextval('"Lens_id_seq"'::regclass),
    "title" text not null,
    "config" jsonb not null default '{}'::jsonb
);


create table "public"."LensClassification" (
    "id" integer not null default nextval('"LensClassification_id_seq"'::regclass),
    "lens_id" integer not null,
    "post_id" integer not null,
    "classification" jsonb not null
);


create table "public"."RssFeeds" (
    "id" integer not null default nextval('"RssFeeds_id_seq"'::regclass),
    "title" text not null,
    "url" text not null,
    "category" text not null,
    "frequency" integer not null,
    "time_last_crawled" integer not null default 0
);


alter sequence "public"."LensClassification_id_seq" owned by "public"."LensClassification"."id";

alter sequence "public"."Lens_id_seq" owned by "public"."Lens"."id";

alter sequence "public"."RssFeeds_id_seq" owned by "public"."RssFeeds"."id";

CREATE UNIQUE INDEX "LensClassification_lens_id_post_id_key" ON public."LensClassification" USING btree (lens_id, post_id);

CREATE UNIQUE INDEX "LensClassification_pkey" ON public."LensClassification" USING btree (id);

CREATE UNIQUE INDEX "Lens_pkey" ON public."Lens" USING btree (id);

CREATE UNIQUE INDEX "Post_pkey" ON public."Post" USING btree (id);

CREATE UNIQUE INDEX "RssFeeds_pkey" ON public."RssFeeds" USING btree (id);

CREATE UNIQUE INDEX "RssFeeds_url_key" ON public."RssFeeds" USING btree (url);

alter table "public"."Lens" add constraint "Lens_pkey" PRIMARY KEY using index "Lens_pkey";

alter table "public"."LensClassification" add constraint "LensClassification_pkey" PRIMARY KEY using index "LensClassification_pkey";

alter table "public"."Post" add constraint "Post_pkey" PRIMARY KEY using index "Post_pkey";

alter table "public"."RssFeeds" add constraint "RssFeeds_pkey" PRIMARY KEY using index "RssFeeds_pkey";

alter table "public"."LensClassification" add constraint "LensClassification_lens_id_fkey" FOREIGN KEY (lens_id) REFERENCES "Lens"(id) not valid;

alter table "public"."LensClassification" validate constraint "LensClassification_lens_id_fkey";

alter table "public"."LensClassification" add constraint "LensClassification_lens_id_post_id_key" UNIQUE using index "LensClassification_lens_id_post_id_key";

alter table "public"."LensClassification" add constraint "LensClassification_post_id_fkey" FOREIGN KEY (post_id) REFERENCES "Post"(id) not valid;

alter table "public"."LensClassification" validate constraint "LensClassification_post_id_fkey";

alter table "public"."RssFeeds" add constraint "RssFeeds_url_key" UNIQUE using index "RssFeeds_url_key";

grant delete on table "public"."Lens" to "anon";

grant insert on table "public"."Lens" to "anon";

grant references on table "public"."Lens" to "anon";

grant select on table "public"."Lens" to "anon";

grant trigger on table "public"."Lens" to "anon";

grant truncate on table "public"."Lens" to "anon";

grant update on table "public"."Lens" to "anon";

grant delete on table "public"."Lens" to "authenticated";

grant insert on table "public"."Lens" to "authenticated";

grant references on table "public"."Lens" to "authenticated";

grant select on table "public"."Lens" to "authenticated";

grant trigger on table "public"."Lens" to "authenticated";

grant truncate on table "public"."Lens" to "authenticated";

grant update on table "public"."Lens" to "authenticated";

grant delete on table "public"."Lens" to "service_role";

grant insert on table "public"."Lens" to "service_role";

grant references on table "public"."Lens" to "service_role";

grant select on table "public"."Lens" to "service_role";

grant trigger on table "public"."Lens" to "service_role";

grant truncate on table "public"."Lens" to "service_role";

grant update on table "public"."Lens" to "service_role";

grant delete on table "public"."LensClassification" to "anon";

grant insert on table "public"."LensClassification" to "anon";

grant references on table "public"."LensClassification" to "anon";

grant select on table "public"."LensClassification" to "anon";

grant trigger on table "public"."LensClassification" to "anon";

grant truncate on table "public"."LensClassification" to "anon";

grant update on table "public"."LensClassification" to "anon";

grant delete on table "public"."LensClassification" to "authenticated";

grant insert on table "public"."LensClassification" to "authenticated";

grant references on table "public"."LensClassification" to "authenticated";

grant select on table "public"."LensClassification" to "authenticated";

grant trigger on table "public"."LensClassification" to "authenticated";

grant truncate on table "public"."LensClassification" to "authenticated";

grant update on table "public"."LensClassification" to "authenticated";

grant delete on table "public"."LensClassification" to "service_role";

grant insert on table "public"."LensClassification" to "service_role";

grant references on table "public"."LensClassification" to "service_role";

grant select on table "public"."LensClassification" to "service_role";

grant trigger on table "public"."LensClassification" to "service_role";

grant truncate on table "public"."LensClassification" to "service_role";

grant update on table "public"."LensClassification" to "service_role";

grant delete on table "public"."RssFeeds" to "anon";

grant insert on table "public"."RssFeeds" to "anon";

grant references on table "public"."RssFeeds" to "anon";

grant select on table "public"."RssFeeds" to "anon";

grant trigger on table "public"."RssFeeds" to "anon";

grant truncate on table "public"."RssFeeds" to "anon";

grant update on table "public"."RssFeeds" to "anon";

grant delete on table "public"."RssFeeds" to "authenticated";

grant insert on table "public"."RssFeeds" to "authenticated";

grant references on table "public"."RssFeeds" to "authenticated";

grant select on table "public"."RssFeeds" to "authenticated";

grant trigger on table "public"."RssFeeds" to "authenticated";

grant truncate on table "public"."RssFeeds" to "authenticated";

grant update on table "public"."RssFeeds" to "authenticated";

grant delete on table "public"."RssFeeds" to "service_role";

grant insert on table "public"."RssFeeds" to "service_role";

grant references on table "public"."RssFeeds" to "service_role";

grant select on table "public"."RssFeeds" to "service_role";

grant trigger on table "public"."RssFeeds" to "service_role";

grant truncate on table "public"."RssFeeds" to "service_role";

grant update on table "public"."RssFeeds" to "service_role";


