import { PUBLISH_TYPE } from './onto-page.interface';

export class BindingDto {
    public visId!: string;
    public dataIds!: string[];
}

export class OntoPageDto {
    public id!: string;
    public title!: string;
    public nrows!: number;
    public publishType!: PUBLISH_TYPE;
    public date!: Date;

    public bindings!: BindingDto[];
}
