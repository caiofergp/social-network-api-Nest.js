import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SignUpDto } from './sign-up.dto';

describe('SignUpDto', () => {
  it('should pass validation with all fields valid and passwords matching', async () => {
    const dtoObject = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    const instance = plainToInstance(SignUpDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid email format', async () => {
    const dtoObject = {
      name: 'John Doe',
      email: 'invalid-email',
      password: 'password123',
      confirmPassword: 'password123',
    };

    const instance = plainToInstance(SignUpDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBeGreaterThan(0);
    const emailError = errors.find((e) => e.property === 'email');
    expect(emailError).toBeDefined();
    expect(emailError?.constraints).toHaveProperty('isEmail');
  });

  it('should fail validation if password and confirmPassword do not match', async () => {
    const dtoObject = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'differentPassword',
    };

    const instance = plainToInstance(SignUpDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBeGreaterThan(0);
    const confirmPasswordError = errors.find(
      (e) => e.property === 'confirmPassword',
    );
    expect(confirmPasswordError).toBeDefined();
    expect(confirmPasswordError?.constraints).toHaveProperty('Match');
  });

  it('should fail validation if name is not a string or missing', async () => {
    const dtoObject = {
      name: 12345,
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    const instance = plainToInstance(SignUpDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBeGreaterThan(0);

    const nameError = errors.find((e) => e.property === 'name');

    expect(nameError).toBeDefined();
    expect(nameError?.constraints).toHaveProperty('isString');
  });
});
