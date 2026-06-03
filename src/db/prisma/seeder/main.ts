import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

export const mockUser = {
  id: 'user-post-e2e',
  name: 'Post E2E User',
  email: 'e2e@social-network.test',
  password: 'Password123!',
};

function createPrismaClient(databaseUrl?: string): PrismaClient {
  const url = databaseUrl || process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      'DATABASE_URL is not defined. Provide it via parameter or environment variable.',
    );
  }

  console.log(`[Prisma] Connecting to: ${url.replace(/:.*@/, ':****@')}`);

  return new PrismaClient({
    adapter: new PrismaMariaDb(url),
    transactionOptions: {
      timeout: 60000,
      maxWait: 20000,
    },
  });
}

export async function clearDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany({ where: { parent_id: { not: null } } });
  await prisma.comment.deleteMany({ where: { parent_id: null } });
  await prisma.sharedPost.deleteMany();
  await prisma.post.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chatMember.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.media.deleteMany();
  await prisma.user.deleteMany();
}

export default async function seed(databaseUrl?: string): Promise<void> {
  const prisma = createPrismaClient(databaseUrl);

  try {
    await clearDatabase(prisma);

    const users = [
      mockUser,
      ...Array.from({ length: 10 }).map(() => ({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        bio: faker.lorem.sentence(),
        birth_date: faker.date.birthdate(),
        email_verified_at: faker.date.recent(),
        gender: faker.helpers.arrayElement(['male', 'female', 'other']),
        location: faker.location.city(),
        token: null,
      })),
    ];

    const createdUsers = await prisma.user
      .createMany({ data: users })
      .then(() => prisma.user.findMany());

    const posts = Array.from({ length: 20 }).map(() => ({
      user_id: faker.helpers.arrayElement(createdUsers.map((u) => u.id)),
      content: faker.lorem.paragraph({ min: 1, max: 1 }),
    }));

    const createdPosts = await prisma.post
      .createMany({ data: posts })
      .then(() => prisma.post.findMany());

    const comments = Array.from({ length: 50 }).map(() => ({
      user_id: faker.helpers.arrayElement(createdUsers.map((u) => u.id)),
      post_id: faker.helpers.arrayElement(createdPosts.map((p) => p.id)),
      content: faker.lorem.sentence(),
    }));

    await prisma.comment.createMany({ data: comments });

    const references = {
      post: createdPosts.map((p) => p.id),
      comment: (await prisma.comment.findMany()).map((c) => c.id),
    };

    const likedKeys = new Set<string>();
    const likes: { type: string; user_id: string; reference_id: string }[] = [];

    for (let i = 0; i < 100; i++) {
      const type = faker.helpers.arrayElement(['post', 'comment'] as const);
      const userId = faker.helpers.arrayElement(createdUsers.map((u) => u.id));
      const referenceId = faker.helpers.arrayElement(references[type]);
      const key = `${userId}:${type}:${referenceId}`;

      if (likedKeys.has(key)) {
        continue;
      }

      likedKeys.add(key);
      likes.push({ type, user_id: userId, reference_id: referenceId });
    }

    await prisma.like.createMany({ data: likes });

    const allPossibleFollows: { follower_id: string; following_id: string }[] =
      [];

    for (const follower of createdUsers) {
      for (const following of createdUsers) {
        if (follower.id !== following.id) {
          allPossibleFollows.push({
            follower_id: follower.id,
            following_id: following.id,
          });
        }
      }
    }

    const followsData = faker.helpers.shuffle(allPossibleFollows).slice(0, 30);

    await prisma.follow.createMany({ data: followsData });
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seed()
    .then(() => {
      console.log('Seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}
