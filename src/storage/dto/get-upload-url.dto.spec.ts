import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  GetUploadUrlParamsDto,
  GetUploadUrlQueryDto,
  StorageModel,
} from './get-upload-url.dto';

describe('GetUploadUrlDto', () => {
  it('should pass validation with valid modelType and file', async () => {
    const dtoObject = { modelType: StorageModel.PROFILE };

    const instance = plainToInstance(GetUploadUrlParamsDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBe(0);
  });

  it('should fail validation if modelType is invalid', async () => {
    const dtoObject = { modelType: 'INVALID_TYPE' };

    const instance = plainToInstance(GetUploadUrlParamsDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBeGreaterThan(0);
    const modelTypeError = errors.find((e) => e.property === 'modelType');
    expect(modelTypeError).toBeDefined();
  });

  it('should fail validation if file is empty', async () => {
    const dtoObject = { file: '' };

    const instance = plainToInstance(GetUploadUrlQueryDto, dtoObject);
    const errors = await validate(instance);

    expect(errors.length).toBeGreaterThan(0);
    const fileError = errors.find((e) => e.property === 'file');
    expect(fileError).toBeDefined();
  });
});
