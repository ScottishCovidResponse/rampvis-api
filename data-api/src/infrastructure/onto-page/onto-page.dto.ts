
export class BindDataDto {
    public dataId: string = '';
    public queryParam:  Array<Map<string, string>> = [];
}

export class BindVisDto {
    public visId: string = '';
    public bindData: BindDataDto[] = [];
}

export class OntoPageDto {
    public id: string = '';
    public title: string = '';
    public bindVis: BindVisDto[] = [];
    public nrow: number = 0;
}
