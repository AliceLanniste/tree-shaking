import ExternalModule from '../ExternalModule';
import Module from '../Module';
import {relativeId }  from './relativeId'

interface OrderedExecutionUnit{
    execIndex: number;
}

const compareExecIndex = <T extends OrderedExecutionUnit>(a: T, b: T) => a.execIndex > b.execIndex ? 1 : -1;

export function sortByExecutionOrder<T extends OrderedExecutionUnit>(units: T[]) {
  return units.sort(compareExecIndex);
}

/**
 * 模块执行顺序分析
 * @param entryModules 入口模块
 * 从入口模块开始，对模块进行深度优先搜索，并记录每个模块的索引，索引越小，模块越早被执行。
 * 将模块和依赖模块关系存入到parents，检测完成的模块放入到orderedModules中。在将每个模块进行检测后，
 * 会检测有没有循环依赖，如果有则循环依赖路径放入cyclePaths中。
 */

export function analyseModuleExecutionOrder(entryModules: Module[]) { 
   let nextIndex = 0;
   const cyclePaths : string[][] = [];
   const analysedModules : { [id:string]: boolean } = {};
   const parents :{[id:string]: string | null} = {};
   const orderedModules: Module[] = [];

   const analyseModule = (module: Module | ExternalModule) => { 
        if (analysedModules[module.id]) return;

        if(module instanceof ExternalModule) {
            module.execIndex = nextIndex++;
            analysedModules[module.id] = true;
            return;
        }

        for (let dependency of module.dependencies){
            if ( dependency.id in parents) {
                if(!analysedModules[dependency.id]) {
                    cyclePaths.push(getCyclePath(dependency.id, module.id, parents));
                }
                continue;
            }

            parents[dependency.id] = module.id;
            analyseModule(dependency);
        }
        module.execIndex = nextIndex++;
        analysedModules[module.id] = true;
        orderedModules.push(module);
  };

    for (const entryModule of entryModules) {
        entryModule.isEntryPoint = true;
        if (!parents[entryModule.id]) {
            parents[entryModule.id] = null;
            analyseModule(entryModule);
        }
    }

    return { orderedModules, cyclePaths }
}
/**
 * 这个函数要根据  analyseModuleExecutionOrder函数结合起来
 * @param id  循环模块id（已经存在parents中）
 * @param parentId 造成循环的模块id
 * @param parents 根据dfs查询方法，包含当前依赖路径上所有模块及其父模块的映射
 */
function getCyclePath(id: string, parentId: string, parents: {[id: string] : string | null}) {
    let path = [relativeId(id)];
    let curId = parentId;

    while (curId !== id) {
        path.push(relativeId(curId))
        curId = parents[curId];
        if (!curId) break;
    }

    path.push(path[0]);
    path.reverse();
    return path;
}