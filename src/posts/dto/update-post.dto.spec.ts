import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdatePostDto } from './update-post.dto';

describe('UpdatePostDto', () => {
  it('should pass validation with empty object (since all properties are optional)', async () => {
    const dtoObject = {};

    const instance = plainToInstance(UpdatePostDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBe(0);
  });

  it('should pass validation with valid post object only', async () => {
    const dtoObject = {
      post: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        content: 'Updated post content',
      },
    };

    const instance = plainToInstance(UpdatePostDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBe(0);
  });

  it('should pass validation with valid post and medias', async () => {
    const dtoObject = {
      post: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        content: 'Updated post content',
      },
      medias: [
        {
          id: 'media-uuid',
          path: 'public/users/1/photo.jpg',
          type: 'image',
        },
        {
          path: 'tmp/users/1/new-photo.jpg',
          type: 'image',
        },
      ],
    };

    const instance = plainToInstance(UpdatePostDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBe(0);
  });

  it('should fail validation if post.id or post.content is empty', async () => {
    const dtoObject = {
      post: {
        id: '',
        content: 'Updated post content',
      },
    };

    const instance = plainToInstance(UpdatePostDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBeGreaterThan(0);
    const postError = errors.find((e) => e.property === 'post');
    expect(postError).toBeDefined();
  });

  it('should fail validation if media path is empty', async () => {
    const dtoObject = {
      medias: [
        {
          path: '',
          type: 'image',
        },
      ],
    };

    const instance = plainToInstance(UpdatePostDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBeGreaterThan(0);
    const mediasError = errors.find((e) => e.property === 'medias');
    expect(mediasError).toBeDefined();
  });
});
