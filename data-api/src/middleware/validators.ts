import { plainToClass } from 'class-transformer';
import { registerDecorator, validate, ValidationError, ValidationOptions } from 'class-validator';
import { RequestHandler } from 'express';

import { InvalidQueryParametersException } from '../exceptions/exception';

export function vmValidate<T>(type: any, skipMissingProperties = false): RequestHandler {
    return (req, res, next) => {
        validate(plainToClass(type, req.body), { skipMissingProperties }).then((errors: ValidationError[]) => {
            if (errors.length > 0) {
                const message = errors
                    .map((error: ValidationError) => {
                        const constraints: any[] = getNestedProperties(error);
                        return constraints.map((constraint: any) => Object.values(constraint));
                    })
                    .join(', ');
                next(new InvalidQueryParametersException(message));
            } else {
                next();
            }
        });
    };
}

// TODO - remove duplicate code
export function queryParamValidate<T>(type: any, skipMissingProperties = false): RequestHandler {
    return (req, res, next) => {
        validate(plainToClass(type, req.query), { skipMissingProperties }).then((errors: ValidationError[]) => {
            if (errors.length > 0) {
                const message = errors
                    .map((error: ValidationError) => {
                        const constraints: any[] = getNestedProperties(error);
                        return constraints.map((constraint: any) => Object.values(constraint));
                    })
                    .join(', ');
                next(new InvalidQueryParametersException(message));
            } else {
                next();
            }
        });
    };
}

export function getNestedProperties(data: ValidationError): any[] {
    const arr: any[] = [];

    function find(obj: ValidationError) {
        if (obj.constraints) {
            arr.push(obj.constraints);
        }
        if (!obj.children) {
            return;
        }
        obj.children.forEach((child: ValidationError) => find(child));
    }

    find(data);
    return arr;
}

export function IsNotBlank(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isNotBlank',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions,
            validator: {
                validate(value: any) {
                    return typeof value === 'string' && value.trim().length > 0;
                },
            },
        });
    };
}
