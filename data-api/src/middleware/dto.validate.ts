import { RequestHandler } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

import { InvalidQueryParametersException } from '../exceptions/exception';

export function dtoValidate<T>(type: any, skipMissingProperties = false): RequestHandler {
  return (req, res, next) => {
    validate(plainToClass(type, req.body), { skipMissingProperties })
      .then((errors: ValidationError[]) => {
        if (errors.length > 0) {
          const message = errors.map((error: ValidationError) => { 
            const constraints: Array<any> = getNestedProperties(error);
            return constraints.map(constraint => Object.values(constraint));
          }).join(', ');
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
      validate(plainToClass(type, req.query), {skipMissingProperties})
          .then((errors: ValidationError[]) => {
              if (errors.length > 0) {
                  const message = errors.map((error: ValidationError) => {
                      const constraints: any[] = getNestedProperties(error);
                      return constraints.map((constraint: any) => Object.values(constraint));
                  }).join(', ');
                  next(new InvalidQueryParametersException(message));
              } else {
                  next();
              }
          });
  };
}

export function getNestedProperties(data: ValidationError): Array<any> {
  let arr: Array<any> = [];
  function find(obj: ValidationError) {
    if (obj.constraints) {
      arr.push(obj.constraints);
    }
    if (!obj.children) {
      return;
    }
    obj.children.forEach(child => find(child))
  }
  find(data);
  return arr;
}
