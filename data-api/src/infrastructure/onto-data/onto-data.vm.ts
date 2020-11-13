import {
    IsEnum,
    IsOptional,
    IsString,
    Validate,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { ANALYTICS, MODEL, SOURCE } from './onto-data-types';

@ValidatorConstraint()
export class CustomQueryParamsValidate implements ValidatorConstraintInterface {
    validate(input: Array<Map<string, string[]>>, validationArguments: ValidationArguments) {
        // debug - console.log('CustomQueryParamsValidate: input = ', input, 'validationArguments = ', validationArguments)

        for (let queryParams of input) {
            // check each object has only one key value pair, i.e., one query and its parameters
            if (Object.keys(queryParams).length != 1) return false;
            if (Object.values(queryParams).length != 1) return false;

            const param = Object.values(queryParams)[0];
            // debug - console.log('query = ', Object.keys(queryParam)[0], param);
            // check parameters is an array
            if (!param || !Array.isArray(param) || param.length === 0) return false;
        }

        return Array.isArray(input) && input.length > 0;
    }
}

export class OntoDataVm {
    @IsOptional()
    @IsString()
    public id!: string;
    @IsString()
    public url!: string;
    @IsString()
    public endpoint!: string;
    @IsString()
    public description!: string;

    @IsOptional()
    @Validate(CustomQueryParamsValidate, [], {
        message: 'Wrong queryparams vm',
    })
    public queryParams!: Array<Map<string, string[]>>;

    @IsOptional()
    @IsEnum(SOURCE)
    public source!: SOURCE;

    @IsOptional()
    @IsEnum(MODEL)
    public model!: MODEL;

    @IsOptional()
    @IsEnum(ANALYTICS)
    public analytics!: ANALYTICS;
}
