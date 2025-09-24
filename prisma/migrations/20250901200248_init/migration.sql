-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMPTZ,
    "image" TEXT,
    "username" TEXT,
    "password" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMPTZ,
    "dateJoined" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phoneNumber" TEXT,
    "address" TEXT,
    "dateOfBirth" TIMESTAMPTZ,
    "avatar" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."permissions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "codename" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_groups" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."group_permissions" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."processes" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "title_ur" TEXT,
    "description" TEXT NOT NULL,
    "description_ur" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "category" VARCHAR(20) NOT NULL,
    "process_type" VARCHAR(20) NOT NULL DEFAULT 'consultation',
    "scope" VARCHAR(20) NOT NULL DEFAULT 'city',
    "start_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organization" TEXT DEFAULT 'Government Initiative',
    "participation_count" INTEGER NOT NULL DEFAULT 0,
    "signature_threshold" INTEGER NOT NULL DEFAULT 0,
    "current_signatures" INTEGER NOT NULL DEFAULT 0,
    "signature_deadline" TIMESTAMPTZ,
    "response_required" BOOLEAN NOT NULL DEFAULT false,
    "response_deadline" TIMESTAMPTZ,
    "government_response" TEXT,
    "government_response_ur" TEXT,
    "response_date" TIMESTAMPTZ,
    "visibility" VARCHAR(20) NOT NULL DEFAULT 'public',
    "participation_method" VARCHAR(20) NOT NULL DEFAULT 'open',
    "min_participants" INTEGER NOT NULL DEFAULT 0,
    "max_participants" INTEGER,
    "verification_required" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,

    CONSTRAINT "processes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."proposals" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "title_ur" TEXT,
    "description" TEXT NOT NULL,
    "description_ur" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'under_review',
    "vote_count" INTEGER NOT NULL DEFAULT 0,
    "support_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "process_id" UUID NOT NULL,
    "author_id" INTEGER NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."votes" (
    "id" UUID NOT NULL,
    "vote_type" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "proposal_id" UUID NOT NULL,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."discussions" (
    "id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "content_ur" TEXT,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "process_id" UUID,
    "proposal_id" UUID,
    "parent_id" UUID,
    "author_id" INTEGER NOT NULL,

    CONSTRAINT "discussions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."participations" (
    "id" UUID NOT NULL,
    "participation_type" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "process_id" UUID NOT NULL,

    CONSTRAINT "participations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" UUID NOT NULL,
    "type" VARCHAR(30) NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "related_process_id" UUID,
    "related_proposal_id" UUID,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "public"."profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "groups_name_key" ON "public"."groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_codename_key" ON "public"."permissions"("codename");

-- CreateIndex
CREATE UNIQUE INDEX "user_groups_userId_groupId_key" ON "public"."user_groups"("userId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "group_permissions_groupId_permissionId_key" ON "public"."group_permissions"("groupId", "permissionId");

-- CreateIndex
CREATE INDEX "processes_status_idx" ON "public"."processes"("status");

-- CreateIndex
CREATE INDEX "processes_category_idx" ON "public"."processes"("category");

-- CreateIndex
CREATE INDEX "processes_process_type_idx" ON "public"."processes"("process_type");

-- CreateIndex
CREATE INDEX "processes_scope_idx" ON "public"."processes"("scope");

-- CreateIndex
CREATE INDEX "proposals_process_id_idx" ON "public"."proposals"("process_id");

-- CreateIndex
CREATE INDEX "proposals_author_id_idx" ON "public"."proposals"("author_id");

-- CreateIndex
CREATE INDEX "proposals_status_idx" ON "public"."proposals"("status");

-- CreateIndex
CREATE INDEX "votes_user_id_idx" ON "public"."votes"("user_id");

-- CreateIndex
CREATE INDEX "votes_proposal_id_idx" ON "public"."votes"("proposal_id");

-- CreateIndex
CREATE INDEX "votes_vote_type_idx" ON "public"."votes"("vote_type");

-- CreateIndex
CREATE UNIQUE INDEX "votes_user_id_proposal_id_key" ON "public"."votes"("user_id", "proposal_id");

-- CreateIndex
CREATE INDEX "discussions_process_id_idx" ON "public"."discussions"("process_id");

-- CreateIndex
CREATE INDEX "discussions_proposal_id_idx" ON "public"."discussions"("proposal_id");

-- CreateIndex
CREATE INDEX "discussions_author_id_idx" ON "public"."discussions"("author_id");

-- CreateIndex
CREATE INDEX "discussions_parent_id_idx" ON "public"."discussions"("parent_id");

-- CreateIndex
CREATE INDEX "discussions_is_pinned_idx" ON "public"."discussions"("is_pinned");

-- CreateIndex
CREATE INDEX "participations_user_id_idx" ON "public"."participations"("user_id");

-- CreateIndex
CREATE INDEX "participations_process_id_idx" ON "public"."participations"("process_id");

-- CreateIndex
CREATE INDEX "participations_participation_type_idx" ON "public"."participations"("participation_type");

-- CreateIndex
CREATE UNIQUE INDEX "participations_user_id_process_id_participation_type_key" ON "public"."participations"("user_id", "process_id", "participation_type");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "public"."notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "public"."notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "public"."notifications"("is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "public"."notifications"("created_at");

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_groups" ADD CONSTRAINT "user_groups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_groups" ADD CONSTRAINT "user_groups_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_permissions" ADD CONSTRAINT "group_permissions_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_permissions" ADD CONSTRAINT "group_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "public"."permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."processes" ADD CONSTRAINT "processes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proposals" ADD CONSTRAINT "proposals_process_id_fkey" FOREIGN KEY ("process_id") REFERENCES "public"."processes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proposals" ADD CONSTRAINT "proposals_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."votes" ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."votes" ADD CONSTRAINT "votes_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."discussions" ADD CONSTRAINT "discussions_process_id_fkey" FOREIGN KEY ("process_id") REFERENCES "public"."processes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."discussions" ADD CONSTRAINT "discussions_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."discussions" ADD CONSTRAINT "discussions_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."discussions" ADD CONSTRAINT "discussions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."participations" ADD CONSTRAINT "participations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."participations" ADD CONSTRAINT "participations_process_id_fkey" FOREIGN KEY ("process_id") REFERENCES "public"."processes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_related_process_id_fkey" FOREIGN KEY ("related_process_id") REFERENCES "public"."processes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_related_proposal_id_fkey" FOREIGN KEY ("related_proposal_id") REFERENCES "public"."proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
