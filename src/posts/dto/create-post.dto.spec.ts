import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreatePostDto } from './create-post.dto';

describe('CreatePostDto', () => {
  it('should pass validation with valid post content only', async () => {
    const dtoObject = {
      post: {
        content: 'This is a valid post content',
      },
    };

    const instance = plainToInstance(CreatePostDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBe(0);
  });

  it('should pass validation with valid post content and medias', async () => {
    const dtoObject = {
      post: {
        content: 'This is a valid post content',
      },
      medias: [
        {
          path: 'tmp/users/1/photo.jpg',
          type: 'image',
        },
      ],
    };

    const instance = plainToInstance(CreatePostDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBe(0);
  });

  it('should pass validation with valid medias only (post content is optional)', async () => {
    const dtoObject = {
      medias: [
        {
          path: 'tmp/users/1/photo.jpg',
          type: 'image',
        },
      ],
    };

    const instance = plainToInstance(CreatePostDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBe(0);
  });

  it('should fail validation if both post and medias are missing', async () => {
    const dtoObject = {};

    const instance = plainToInstance(CreatePostDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail validation if post.content is empty and medias is missing', async () => {
    const dtoObject = {
      post: {
        content: '',
      },
    };

    const instance = plainToInstance(CreatePostDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail validation if media path or type is empty', async () => {
    const dtoObject = {
      medias: [
        {
          path: '',
          type: 'image',
        },
      ],
    };

    const instance = plainToInstance(CreatePostDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBeGreaterThan(0);
    const mediasError = errors.find((e) => e.property === 'medias');
    expect(mediasError).toBeDefined();
  });
});
