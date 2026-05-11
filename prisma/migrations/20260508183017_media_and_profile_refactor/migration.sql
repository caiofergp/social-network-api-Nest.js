/*
  Warnings:

  - You are about to drop the `post_media` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[follower_id]` on the table `follows` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[avatar_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cover_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `chat_members` DROP FOREIGN KEY `chat_members_chat_id_fkey`;

-- DropForeignKey
ALTER TABLE `chat_members` DROP FOREIGN KEY `chat_members_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_parent_id_fkey`;

-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_post_id_fkey`;

-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `follows` DROP FOREIGN KEY `follows_follower_id_fkey`;

-- DropForeignKey
ALTER TABLE `follows` DROP FOREIGN KEY `follows_following_id_fkey`;

-- DropForeignKey
ALTER TABLE `likes` DROP FOREIGN KEY `likes_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `messages` DROP FOREIGN KEY `messages_chat_id_fkey`;

-- DropForeignKey
ALTER TABLE `messages` DROP FOREIGN KEY `messages_sender_id_fkey`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_actor_id_fkey`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_recipient_id_fkey`;

-- DropForeignKey
ALTER TABLE `password_reset_tokens` DROP FOREIGN KEY `password_reset_tokens_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `post_media` DROP FOREIGN KEY `post_media_post_id_fkey`;

-- DropForeignKey
ALTER TABLE `posts` DROP FOREIGN KEY `posts_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `shared_posts` DROP FOREIGN KEY `shared_posts_post_id_fkey`;

-- DropForeignKey
ALTER TABLE `shared_posts` DROP FOREIGN KEY `shared_posts_user_id_fkey`;

-- DropIndex
DROP INDEX `follower_id_following_id_key` ON `follows`;

-- AlterTable
ALTER TABLE `chats` MODIFY `name` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `messages` ALTER COLUMN `updated_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `avatar_id` VARCHAR(191) NULL,
    ADD COLUMN `bio` TEXT NULL,
    ADD COLUMN `birth_date` DATETIME(3) NULL,
    ADD COLUMN `cover_id` VARCHAR(191) NULL,
    ADD COLUMN `gender` VARCHAR(191) NULL,
    ADD COLUMN `location` VARCHAR(191) NULL,
    ADD COLUMN `website` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `post_media`;

-- CreateTable
CREATE TABLE `medias` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `entity_type` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NULL,
    `mime_type` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,
    `path` VARCHAR(191) NOT NULL,
    `size` INTEGER NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `medias_entity_id_entity_type_idx`(`entity_id`, `entity_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `chat_members_user_id_idx` ON `chat_members`(`user_id`);

-- CreateIndex
CREATE UNIQUE INDEX `follows_follower_id_key` ON `follows`(`follower_id`);

-- CreateIndex
CREATE UNIQUE INDEX `users_avatar_id_key` ON `users`(`avatar_id`);

-- CreateIndex
CREATE UNIQUE INDEX `users_cover_id_key` ON `users`(`cover_id`);

-- RenameIndex
ALTER TABLE `chat_members` RENAME INDEX `chat_members_chat_id_fkey` TO `chat_members_chat_id_idx`;

-- RenameIndex
ALTER TABLE `comments` RENAME INDEX `comments_parent_id_fkey` TO `comments_parent_id_idx`;

-- RenameIndex
ALTER TABLE `comments` RENAME INDEX `comments_post_id_fkey` TO `comments_post_id_idx`;

-- RenameIndex
ALTER TABLE `comments` RENAME INDEX `comments_user_id_fkey` TO `comments_user_id_idx`;

-- RenameIndex
ALTER TABLE `follows` RENAME INDEX `follows_following_id_fkey` TO `follows_following_id_idx`;

-- RenameIndex
ALTER TABLE `likes` RENAME INDEX `likes_user_id_fkey` TO `likes_user_id_idx`;

-- RenameIndex
ALTER TABLE `likes` RENAME INDEX `reference_id_user_id_key` TO `likes_reference_id_user_id_key`;

-- RenameIndex
ALTER TABLE `messages` RENAME INDEX `messages_chat_id_fkey` TO `messages_chat_id_idx`;

-- RenameIndex
ALTER TABLE `messages` RENAME INDEX `messages_sender_id_fkey` TO `messages_sender_id_idx`;

-- RenameIndex
ALTER TABLE `notifications` RENAME INDEX `notifications_actor_id_fkey` TO `notifications_actor_id_idx`;

-- RenameIndex
ALTER TABLE `notifications` RENAME INDEX `notifications_recipient_id_fkey` TO `notifications_recipient_id_idx`;

-- RenameIndex
ALTER TABLE `password_reset_tokens` RENAME INDEX `password_reset_tokens_user_id_fkey` TO `password_reset_tokens_user_id_idx`;

-- RenameIndex
ALTER TABLE `posts` RENAME INDEX `posts_user_id_fkey` TO `posts_user_id_idx`;

-- RenameIndex
ALTER TABLE `shared_posts` RENAME INDEX `shared_posts_post_id_fkey` TO `shared_posts_post_id_idx`;

-- RenameIndex
ALTER TABLE `shared_posts` RENAME INDEX `shared_posts_user_id_fkey` TO `shared_posts_user_id_idx`;
