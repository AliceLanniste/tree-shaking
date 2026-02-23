import ExternalModule from "../ExternalModule";
import Module from "../Module";
import { randomUnit8Array, Unit8ArrayXor } from "./entryHashing";

export function assignChunkColouringHashes(entryModules: Module[]) { 

    let currentEntry: Module, currentEntryHash: Uint8Array;
    let modulesVisitedForCurrentEntry: {[id: string]: boolean};
    const handledEntryPoints: {[id: string]: boolean } = {};

    const addCurrentEntryColorForModule = (module: Module) => {
        Unit8ArrayXor(module.entryPointHash, currentEntryHash);

        for (const dependency of module.dependencies) {
            if (dependency instanceof  ExternalModule || dependency.id in modulesVisitedForCurrentEntry) {
                continue;
            }
            modulesVisitedForCurrentEntry[dependency.id] = true;
            if (!handledEntryPoints[dependency.id]) 
                addCurrentEntryColorForModule(dependency);
            
        }
    }

    for( currentEntry of entryModules) {
        handledEntryPoints[currentEntry.id] = true;
        currentEntryHash = randomUnit8Array(10);
        modulesVisitedForCurrentEntry = {[currentEntry.id]: false }
        addCurrentEntryColorForModule(currentEntry);
    }
}