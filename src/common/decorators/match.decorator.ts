import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: 'Match' })
export class MatchConstraint implements ValidatorConstraintInterface {
  validate(value: any, validationArguments?: ValidationArguments): Promise<boolean> | boolean {
    if (!validationArguments) {
      return false;
    }

    const [relatedPropertyName] = validationArguments.constraints;
    const relatedValue = (validationArguments.object as any)[relatedPropertyName];
    return value === relatedValue;
  }

  defaultMessage?(validationArguments?: ValidationArguments): string {
    if (!validationArguments) {
      return 'arguments are missing';
    }

    return `${validationArguments.property} must match ${validationArguments.constraints[0]}`;
  }
}

export function Match(property: string, validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchConstraint,
    });
  };
}