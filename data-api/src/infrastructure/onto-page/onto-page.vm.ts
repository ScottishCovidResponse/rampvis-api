import {
    IsArray,
    IsNumber,
    IsOptional,
    IsString,
    Validate,
    ValidateNested,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Type } from 'class-transformer';

@ValidatorConstraint()
export class CustomQueryParamValidate implements ValidatorConstraintInterface {
    validate(input: Array<Map<string, string>>, validationArguments: ValidationArguments) {
        // debug - 
        // console.log('CustomQueryParamsValidate: input = ', input, 'validationArguments = ', validationArguments)

        for (let queryParam of input) {
            // check each object has there is only one key value pair, i.e., one query and its parameter
            if (Object.keys(queryParam).length != 1) return false;

            const param = Object.values(queryParam)[0];
            // check parameters a valid string
            if (!param || (typeof param !== 'string') || param === '') return false;
        }

        return Array.isArray(input) && input.length > 0;
    }
}

export class BindDataVm {
    @IsString()
    dataId!: string;

    @IsOptional()
    @Validate(CustomQueryParamValidate, [], {
        message: 'Wrong queryparam vm',
    })
    public queryParam!: Array<Map<string, string>>;

}

export class BindVisVm {
    @IsString()
    visId!: string;

    @IsArray()
    @Type(() => BindDataVm)
    @ValidateNested({ each: true })
    bindData!: BindDataVm[];
}

export class OntoPageVm {
    @IsOptional()
    @IsString()
    public id!: string;

    @IsOptional()
    @IsString()
    public title!: string;

    @IsNumber()
    public nrow!: number;

    @IsArray()
    @Type(() => BindVisVm)
    @ValidateNested({ each: true })
    bindVis!: BindVisVm[];

    // @IsArray()
    // @IsOptional()
    // links
}
