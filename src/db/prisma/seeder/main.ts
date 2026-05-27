import { faker } from '@faker-js/faker';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { Comment } from 'src/posts/entities/comment.entity';
import { Like } from 'src/posts/entities/like.entity';
import { Follow } from 'src/follows/entities/follow.entity';
import { SharedPost } from 'src/posts/entities/shared-post.entity';
import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaMariaDb } from 'node_modules/@prisma/adapter-mariadb/dist/index.mjs';

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb('mariadb://root:@localhost:3306/social-network'),
});

const seed = async () => {
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.sharedPost.deleteMany();
  await prisma.post.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.user.deleteMany();

  const users = Array.from({ length: 10 }).map(() => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    bio: faker.lorem.sentence(),
    birth_date: faker.date.birthdate(),
    email_verified_at: faker.date.recent(),
    gender: faker.helpers.arrayElement(['male', 'female', 'other']),
    location: faker.location.city(),
    token: null,
  })) as User[];

  const createdUsers = await prisma.user
    .createMany({
      data: users,
    })
    .then(() => prisma.user.findMany());

  const userIds = createdUsers.map((u) => u.id);

  const posts = Array.from({ length: 20 }).map(() => ({
    user_id: faker.helpers.arrayElement(createdUsers.map((u) => u.id)),
    content: faker.lorem.paragraph({ min: 1, max: 1 }),
  })) as Post[];

  const createdPosts = await prisma.post
    .createMany({
      data: posts,
    })
    .then(() => prisma.post.findMany());

  const comments = Array.from({ length: 50 }).map(() => ({
    user_id: faker.helpers.arrayElement(createdUsers.map((u) => u.id)),
    post_id: faker.helpers.arrayElement(createdPosts.map((p) => p.id)),
    content: faker.lorem.sentence(),
  })) as Comment[];

  const createdComments = await prisma.comment
    .createMany({
      data: comments,
    })
    .then(() => prisma.comment.findMany());

  const references = {
    post: createdPosts.map((p) => p.id),
    comment: createdComments.map((c) => c.id),
  };

  const liked: { userId: string; referenceId: string }[] = [];

  const likes = Array.from({ length: 100 }).map(() => {
    const type = faker.helpers.arrayElement(['post', 'comment']);
    let referenceId = faker.helpers.arrayElement(references[type]);
    let userId = faker.helpers.arrayElement(createdUsers.map((u) => u.id));

    const isDuplicate = liked.some(
      (l) => l.userId === userId && l.referenceId === referenceId,
    );

    while (isDuplicate) {
      const newUserId = faker.helpers.arrayElement(
        createdUsers.map((u) => u.id),
      );

      const newReferenceId = faker.helpers.arrayElement(references[type]);
      const isNotDuplicate = !liked.some(
        (l) => l.userId === newUserId && l.referenceId === newReferenceId,
      );

      if (isNotDuplicate) {
        userId = newUserId;
        referenceId = newReferenceId;
        break;
      }
    }

    liked.push({ userId, referenceId });

    return {
      type,
      user_id: userId,
      reference_id: referenceId,
    } as Like;
  });

  await prisma.like.createMany({
    data: likes,
  });

  const allPossibleFollows: { follower_id: string; following_id: string }[] =
    [];

  for (const followerId of userIds) {
    for (const followingId of userIds) {
      if (followerId !== followingId) {
        allPossibleFollows.push({
          follower_id: followerId,
          following_id: followingId,
        });
      }
    }
  }

  const shuffledFollows = faker.helpers.shuffle(allPossibleFollows);
  const followsData = shuffledFollows.slice(0, 30);

  await prisma.follow.createMany({
    data: followsData,
  });
};

seed()
  .then(() => {
    console.log('Seeding completed successfully.');
    prisma.$disconnect();
  })
  .catch((error) => {
    console.error('Error during seeding:', error);
    prisma.$disconnect();
  });
