-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT '$2a$10$xW7/X7v.p0yqQ/hJq.1/6.z7y.y7y.y7y.y7y.y7y.y7y.y7y',
    "phone" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "school" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "description" TEXT,
    "images" TEXT,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "category" TEXT NOT NULL,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "intro" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "technologies" TEXT NOT NULL,
    "responsibilities" TEXT,
    "challenges_problem" TEXT,
    "challenges_solution" TEXT,
    "image_url" TEXT,
    "images" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "github_url" TEXT,
    "demo_url" TEXT,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_media" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo_category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photo_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "category_id" INTEGER,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "taken_at" TIMESTAMP(3),
    "location" TEXT,
    "camera_model" TEXT,
    "lens" TEXT,
    "focal_length" TEXT,
    "aperture" TEXT,
    "shutter_speed" TEXT,
    "iso" TEXT,
    "exif_data" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "size" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "music" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT,
    "cover_url" TEXT,
    "platform" TEXT NOT NULL DEFAULT 'netease',
    "url" TEXT,
    "lyrics" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "playlist_id" TEXT,
    "playlist_type" TEXT,

    CONSTRAINT "music_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movie" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "director" TEXT,
    "year" INTEGER,
    "poster_url" TEXT,
    "poster" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION,
    "review" TEXT,
    "watched_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_city" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "province" TEXT,
    "country" TEXT NOT NULL DEFAULT '中国',
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "visited_at" TIMESTAMP(3),
    "description" TEXT,
    "image_url" TEXT,
    "highlights" TEXT,
    "tips" TEXT,
    "rating" DOUBLE PRECISION,
    "photos" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "want_count" INTEGER NOT NULL DEFAULT 0,
    "been_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_city_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_footprint" (
    "id" SERIAL NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "visited_at" TIMESTAMP(3),
    "description" TEXT,
    "photos" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_footprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_config" (
    "id" SERIAL NOT NULL,
    "site_title" TEXT NOT NULL DEFAULT 'My Portfolio',
    "seo_keywords" TEXT,
    "seo_description" TEXT,
    "icp_code" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitor_stat" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitor_stat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "danmaku" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'blue',
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "danmaku_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "images" TEXT,
    "location" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PhotoTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_created_at_idx" ON "user"("created_at");

-- CreateIndex
CREATE INDEX "user_updated_at_idx" ON "user"("updated_at");

-- CreateIndex
CREATE INDEX "education_user_id_idx" ON "education"("user_id");

-- CreateIndex
CREATE INDEX "education_start_date_idx" ON "education"("start_date");

-- CreateIndex
CREATE INDEX "education_created_at_idx" ON "education"("created_at");

-- CreateIndex
CREATE INDEX "experience_user_id_idx" ON "experience"("user_id");

-- CreateIndex
CREATE INDEX "experience_is_visible_idx" ON "experience"("is_visible");

-- CreateIndex
CREATE INDEX "experience_order_index_idx" ON "experience"("order_index");

-- CreateIndex
CREATE INDEX "experience_start_date_idx" ON "experience"("start_date");

-- CreateIndex
CREATE INDEX "experience_created_at_idx" ON "experience"("created_at");

-- CreateIndex
CREATE INDEX "skill_user_id_idx" ON "skill"("user_id");

-- CreateIndex
CREATE INDEX "skill_is_visible_idx" ON "skill"("is_visible");

-- CreateIndex
CREATE INDEX "skill_order_index_idx" ON "skill"("order_index");

-- CreateIndex
CREATE INDEX "skill_category_idx" ON "skill"("category");

-- CreateIndex
CREATE INDEX "skill_created_at_idx" ON "skill"("created_at");

-- CreateIndex
CREATE INDEX "project_user_id_idx" ON "project"("user_id");

-- CreateIndex
CREATE INDEX "project_is_visible_idx" ON "project"("is_visible");

-- CreateIndex
CREATE INDEX "project_order_index_idx" ON "project"("order_index");

-- CreateIndex
CREATE INDEX "project_start_date_idx" ON "project"("start_date");

-- CreateIndex
CREATE INDEX "project_created_at_idx" ON "project"("created_at");

-- CreateIndex
CREATE INDEX "contact_user_id_idx" ON "contact"("user_id");

-- CreateIndex
CREATE INDEX "contact_type_idx" ON "contact"("type");

-- CreateIndex
CREATE INDEX "contact_created_at_idx" ON "contact"("created_at");

-- CreateIndex
CREATE INDEX "social_media_user_id_idx" ON "social_media"("user_id");

-- CreateIndex
CREATE INDEX "social_media_platform_idx" ON "social_media"("platform");

-- CreateIndex
CREATE INDEX "social_media_created_at_idx" ON "social_media"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "photo_category_name_key" ON "photo_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "photo_category_slug_key" ON "photo_category"("slug");

-- CreateIndex
CREATE INDEX "photo_category_slug_idx" ON "photo_category"("slug");

-- CreateIndex
CREATE INDEX "photo_category_created_at_idx" ON "photo_category"("created_at");

-- CreateIndex
CREATE INDEX "photo_category_id_idx" ON "photo"("category_id");

-- CreateIndex
CREATE INDEX "photo_is_visible_idx" ON "photo"("is_visible");

-- CreateIndex
CREATE INDEX "photo_is_featured_idx" ON "photo"("is_featured");

-- CreateIndex
CREATE INDEX "photo_order_index_idx" ON "photo"("order_index");

-- CreateIndex
CREATE INDEX "photo_taken_at_idx" ON "photo"("taken_at");

-- CreateIndex
CREATE INDEX "photo_created_at_idx" ON "photo"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tag_name_key" ON "tag"("name");

-- CreateIndex
CREATE INDEX "tag_name_idx" ON "tag"("name");

-- CreateIndex
CREATE INDEX "tag_created_at_idx" ON "tag"("created_at");

-- CreateIndex
CREATE INDEX "message_is_read_idx" ON "message"("is_read");

-- CreateIndex
CREATE INDEX "message_created_at_idx" ON "message"("created_at");

-- CreateIndex
CREATE INDEX "message_email_idx" ON "message"("email");

-- CreateIndex
CREATE INDEX "music_is_visible_idx" ON "music"("is_visible");

-- CreateIndex
CREATE INDEX "music_order_index_idx" ON "music"("order_index");

-- CreateIndex
CREATE INDEX "music_platform_idx" ON "music"("platform");

-- CreateIndex
CREATE INDEX "music_created_at_idx" ON "music"("created_at");

-- CreateIndex
CREATE INDEX "movie_isVisible_idx" ON "movie"("isVisible");

-- CreateIndex
CREATE INDEX "movie_orderIndex_idx" ON "movie"("orderIndex");

-- CreateIndex
CREATE INDEX "movie_year_idx" ON "movie"("year");

-- CreateIndex
CREATE INDEX "movie_rating_idx" ON "movie"("rating");

-- CreateIndex
CREATE INDEX "movie_created_at_idx" ON "movie"("created_at");

-- CreateIndex
CREATE INDEX "travel_city_is_visible_idx" ON "travel_city"("is_visible");

-- CreateIndex
CREATE INDEX "travel_city_order_index_idx" ON "travel_city"("order_index");

-- CreateIndex
CREATE INDEX "travel_city_country_idx" ON "travel_city"("country");

-- CreateIndex
CREATE INDEX "travel_city_rating_idx" ON "travel_city"("rating");

-- CreateIndex
CREATE INDEX "travel_city_created_at_idx" ON "travel_city"("created_at");

-- CreateIndex
CREATE INDEX "travel_footprint_location_idx" ON "travel_footprint"("location");

-- CreateIndex
CREATE INDEX "travel_footprint_visited_at_idx" ON "travel_footprint"("visited_at");

-- CreateIndex
CREATE INDEX "travel_footprint_created_at_idx" ON "travel_footprint"("created_at");

-- CreateIndex
CREATE INDEX "site_config_created_at_idx" ON "site_config"("created_at");

-- CreateIndex
CREATE INDEX "site_config_updated_at_idx" ON "site_config"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "visitor_stat_date_key" ON "visitor_stat"("date");

-- CreateIndex
CREATE INDEX "visitor_stat_date_idx" ON "visitor_stat"("date");

-- CreateIndex
CREATE INDEX "visitor_stat_created_at_idx" ON "visitor_stat"("created_at");

-- CreateIndex
CREATE INDEX "danmaku_is_visible_idx" ON "danmaku"("is_visible");

-- CreateIndex
CREATE INDEX "danmaku_order_index_idx" ON "danmaku"("order_index");

-- CreateIndex
CREATE INDEX "danmaku_created_at_idx" ON "danmaku"("created_at");

-- CreateIndex
CREATE INDEX "moment_is_visible_idx" ON "moment"("is_visible");

-- CreateIndex
CREATE INDEX "moment_likes_idx" ON "moment"("likes");

-- CreateIndex
CREATE INDEX "moment_created_at_idx" ON "moment"("created_at");

-- CreateIndex
CREATE INDEX "moment_location_idx" ON "moment"("location");

-- CreateIndex
CREATE UNIQUE INDEX "_PhotoTags_AB_unique" ON "_PhotoTags"("A", "B");

-- CreateIndex
CREATE INDEX "_PhotoTags_B_index" ON "_PhotoTags"("B");

-- AddForeignKey
ALTER TABLE "education" ADD CONSTRAINT "education_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience" ADD CONSTRAINT "experience_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill" ADD CONSTRAINT "skill_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact" ADD CONSTRAINT "contact_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_media" ADD CONSTRAINT "social_media_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "photo_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PhotoTags" ADD CONSTRAINT "_PhotoTags_A_fkey" FOREIGN KEY ("A") REFERENCES "photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PhotoTags" ADD CONSTRAINT "_PhotoTags_B_fkey" FOREIGN KEY ("B") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
