import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreatePostCommentDto } from './create-post-comment.dto';

describe('CreatePostCommentDto', () => {
  it('should pass validation with valid content and no parent_id', async () => {
    const dtoObject = {
      content: 'This is a comment',
    };

    const instance = plainToInstance(CreatePostCommentDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBe(0);
  });

  it('should pass validation with valid content and valid UUID parent_id', async () => {
    const dtoObject = {
      content: 'This is a reply comment',
      parent_id: 'a718d7f7-5264-4a41-9488-82878d655f46',
    };

    const instance = plainToInstance(CreatePostCommentDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBe(0);
  });

  it('should fail validation if content is empty', async () => {
    const dtoObject = {
      content: '',
    };

    const instance = plainToInstance(CreatePostCommentDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBeGreaterThan(0);
    const contentError = errors.find((e) => e.property === 'content');
    expect(contentError).toBeDefined();
  });

  it('should fail validation if parent_id is not a valid UUID', async () => {
    const dtoObject = {
      content: 'Hello',
      parent_id: 'invalid-uuid',
    };

    const instance = plainToInstance(CreatePostCommentDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBeGreaterThan(0);
    const parentIdError = errors.find((e) => e.property === 'parent_id');
    expect(parentIdError).toBeDefined();
  });
});
