-- CreateTable
CREATE TABLE `post_media` (
    `id` VARCHAR(191) NOT NULL,
    `post_id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,
    `path` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,

    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `post_media` ADD CONSTRAINT `post_media_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
