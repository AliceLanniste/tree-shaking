export interface ErrorType {
    code: string;
    message: string;
}

export enum ERR_CODE {
    UNRESOLVE_MODULE = 'UNRESOLVE_MODULE',
    PARSE_ERROR ='PARSE_ERROR',
    DUPLICATE_IMPORT= 'DDUPLICATE_IMPORT',
    DUPLICATE_EXPORT= 'DUPLICATE_EXPORT',
    DUPLICATE_EXPORT_DEFAULT= 'DUPLICATE_EXPORT_DEFAULT',
    NO_INPUT_OPTIONS= 'NO_INPUT_OPTIONS',
}

export function error(errObj: ErrorType): never {
    let errMsg = `${errObj.code}: ${errObj.message}`
    throw Error(errMsg)
}