export interface ErrorType{
    code: string,
    message: string
}

export function error( errObj: ErrorType):never {
    let errMsg = `${errObj.code}: ${errObj.message}`

    throw Error(errMsg)
}

export enum ERR_CODE {
    ILLEGAL_EXTERANL_MODULE ="ILLEGAL_EXTERANL_MODULE",
    NOT_OPTION = "NOT_OPTION",
    LODE_MODULE="LODE MODULE",
    PARSE_ERROR ="PARSE ERROR",
    DUPLCATE_ERROR ="DUPLICATE ERROR",
    BAD_LOADER = "BAD LOADER",
    ILLEGEAL_REASSIGN = "ILLEGAEAL_REASSIGN",
    UNRESOLVE_MODULE = 'UNRESOLVE_MODULE'
}