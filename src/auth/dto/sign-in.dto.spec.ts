import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SignInDto } from './sign-in.dto';

describe('SignInDto', () => {
  it('should pass validation with valid email and password', async () => {
    const dtoObject = {
      email: 'john@example.com',
      password: 'password123',
    };

    const instance = plainToInstance(SignInDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid email format', async () => {
    const dtoObject = {
      email: 'invalid-email',
      password: 'password123',
    };

    const instance = plainToInstance(SignInDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBeGreaterThan(0);

    const emailError = errors.find((e) => e.property === 'email');

    expect(emailError).toBeDefined();
    expect(emailError?.constraints).toHaveProperty('isEmail');
  });

  it('should fail validation with short password (less than 8 characters)', async () => {
    const dtoObject = {
      email: 'john@example.com',
      password: 'short',
    };

    const instance = plainToInstance(SignInDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBeGreaterThan(0);

    const passwordError = errors.find((e) => e.property === 'password');

    expect(passwordError).toBeDefined();
    expect(passwordError?.constraints).toHaveProperty('minLength');
  });
});
