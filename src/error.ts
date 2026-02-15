export interface ErrorType {
    code: string;
    message: string;
}

export enum ERR_CODE {
    PARSE_ERROR ='PARSE_ERROR'
}

export function error(errObj: ErrorType): never {
    let errMsg = `${errObj.code}: ${errObj.message}`
    throw Error(errMsg)
}