export interface ErrorType{
    code: string,
    message: string
}



export function error( errObj: ErrorType):never {
    let errMsg = `${errObj.code}: ${errObj.message}`

    throw Error(errMsg)
}