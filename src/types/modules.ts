export interface UnresolvedModule {
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
	isExternal: boolean
}


export interface moduleExport{

}