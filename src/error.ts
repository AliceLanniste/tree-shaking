export interface ErrorType{
    code: string,
    message: string
}

export function error( errObj: ErrorType):never {
    let errMsg = `${errObj.code}: ${errObj.message}`

    throw Error(errMsg)
}

export enum ErrCode {
    LODE_MODULE="LODE MODULE",
    PARSE_ERROR ="PARSE ERROR",
    DUPLCATE_ERROR ="DUPLICATE ERROR",
    BAD_LOADER = "BAD LOADER",
    ILLEGEAL_REASSIGN ="ILLEGAEAL_REASSIGN"
}