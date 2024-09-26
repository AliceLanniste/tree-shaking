export interface ErrorType{
    code: string,
    message: string
}



export function error( errObj: ErrorType):never {
    let errMsg = `${errObj.code}: ${errObj.message}`

    throw Error(errMsg)
}


/**TODO: 1. resolveId(importee,importer)
 * @param：importee:import的库
 * @param: importer:import库引入到的模块
 * @return:id： 通过importer,importee找到目标模块文件位置
 * 
 * TODO:2.将得到的id传入到	fetchModule ( id:string, importer:string|undefined )
 * fetchModule的逻辑是
 * load(id): 将文件加载读取为source
 * transform(source)，转成transformResult{code,ast}
 * 将transformResult转成Module，然后读取dependencies
 */

export enum ErrCode {
    LODE_MODULE="LODE MODULE",
    PARSE_ERROR ="PARSE ERROR"
}