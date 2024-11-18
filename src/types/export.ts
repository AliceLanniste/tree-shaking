import { Statement, Identifier } from 'acorn';

export interface ExportTy {
    statement?: Statement,
    localName?: string,
    identifier?: string,
    exportName?: string,
    expression?: unknown
}