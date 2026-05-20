import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdatePostCommentDto } from './update-post-comment.dto';

describe('UpdatePostCommentDto', () => {
  it('should pass validation with valid content', async () => {
    const dtoObject = {
      content: 'Updated comment text',
    };

    const instance = plainToInstance(UpdatePostCommentDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBe(0);
  });

  it('should fail validation if content is empty', async () => {
    const dtoObject = {
      content: '',
    };

    const instance = plainToInstance(UpdatePostCommentDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBeGreaterThan(0);
    const contentError = errors.find((e) => e.property === 'content');
    expect(contentError).toBeDefined();
  });
});
