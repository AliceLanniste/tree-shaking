export interface UnresolvedModule {
	fileName: string | null;
	id: string;
	importer: string | undefined;
	name: string | null;
}