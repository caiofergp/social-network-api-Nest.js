import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UnitOfWork } from 'src/db/unit-of-work';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';
import { MediaRepository } from 'src/medias/repositories/media.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly storageAdapter: StorageAdapter,
    private readonly mediaRepository: MediaRepository,
  ) {}

  async getUserProfile(id: string) {
    const user = await this.userRepository.getUserById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user?.avatar) {
      user.avatar.url = await this.storageAdapter.getDownloadUrl(
        user.avatar.path,
      );
    }

    if (user?.cover) {
      user.cover.url = await this.storageAdapter.getDownloadUrl(
        user.cover.path,
      );
    }

    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    const user = await this.getUserProfile(userId);

    const { avatar, cover, ...profileData } = data;

    return await this.unitOfWork.runInTransaction(async () => {
      let avatarId = user.avatar_id;
      let coverId = user.cover_id;

      if (avatar) {
        if (!avatar.path.startsWith(`tmp/users/${userId}`)) {
          throw new BadRequestException('Invalid avatar path');
        }

        const newPath = avatar.path.replace(
          `tmp/users/${userId}`,
          `public/users/${userId}`,
        );

        const newAvatar = await this.mediaRepository.create({
          user_id: userId,
          entity_type: 'USER',
          entity_id: userId,
          type: 'AVATAR',
          path: newPath,
          mime_type: avatar.mime_type || avatar.type,
          size: avatar.size,
        });

        await this.storageAdapter.moveObject(avatar.path, newPath);

        if (user.avatar_id) {
          const oldAvatar = await this.mediaRepository
            .findByIdNotIn([], userId)
            .then((medias) => medias.find((m) => m.id === user.avatar_id));
          if (oldAvatar) {
            await this.storageAdapter.deleteObject(oldAvatar.path);
            await this.mediaRepository.deleteMany([oldAvatar.id]);
          }
        }

        avatarId = newAvatar.id;
      }

      if (cover) {
        if (!cover.path.startsWith(`tmp/users/${userId}`)) {
          throw new BadRequestException('Invalid cover path');
        }

        const newPath = cover.path.replace(
          `tmp/users/${userId}`,
          `public/users/${userId}`,
        );

        const newCover = await this.mediaRepository.create({
          user_id: userId,
          entity_type: 'USER',
          entity_id: userId,
          type: 'COVER',
          path: newPath,
          mime_type: cover.mime_type || cover.type,
          size: cover.size,
        });

        await this.storageAdapter.moveObject(cover.path, newPath);

        if (user.cover_id) {
          const oldCover = await this.mediaRepository
            .findByIdNotIn([], userId)
            .then((medias) => medias.find((m) => m.id === user.cover_id));
          if (oldCover) {
            await this.storageAdapter.deleteObject(oldCover.path);
            await this.mediaRepository.deleteMany([oldCover.id]);
          }
        }

        coverId = newCover.id;
      }

      const updatedUser = await this.userRepository.update(userId, {
        ...profileData,
        birth_date: profileData.birth_date
          ? new Date(profileData.birth_date)
          : undefined,
        avatar_id: avatarId,
        cover_id: coverId,
      });

      return updatedUser;
    });
  }
}
