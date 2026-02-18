export interface ErrorType {
    code: string;
    message: string;
}

export enum ERR_CODE {
    PARSE_ERROR ='PARSE_ERROR',
    DUPLICATE_IMPORT= 'DDUPLICATE_IMPORT',
    DUPLICATE_EXPORT= 'DUPLICATE_EXPORT',
    DUPLICATE_EXPORT_DEFAULT= 'DUPLICATE_EXPORT_DEFAULT',
}

export function error(errObj: ErrorType): never {
    let errMsg = `${errObj.code}: ${errObj.message}`
    throw Error(errMsg)
}