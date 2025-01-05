import ExternalModule from "../ExternalModule";
import { Module } from "../Module";
import ImportDefaultSpecifier from "../node/ImportDefaultSpecifier";
import ImportNamespaceSpecifier from "../node/ImportNamespaceSpecifier";
import ImportSpecifier from "../node/ImportSpecifier";
import { Statement } from "../node/Statement";

export interface unresolveId {
	fileName?:string;
	id: string;
	importer?: string ;
	name: string ;
}

export interface moduleImport {
	source: string;
	specifier: ImportSpecifier | ImportNamespaceSpecifier | ImportDefaultSpecifier;
	name: string;
	module: Module | ExternalModule | null;
	[name: string]: any;
}

export interface moduleExport {
 statement: Statement,
 localName: string,
 isDeclaration: boolean,
 identifier: string,
 isLiteral: boolean,
 isExternal: boolean,
 exportMode: string,
 isModified: boolean
}


export interface moduleExport{

}