import { Statement } from "../node/Statement";

export interface unresolveId {
	fileName?:string;
	id: string;
	importer?: string ;
	name: string ;
}

export interface moduleImport {
	importee: string,
	name: string,
	localName: string,
	source?: string,
	isNamespace:boolean,
	isExternal: boolean
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