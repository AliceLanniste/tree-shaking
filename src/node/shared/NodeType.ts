export const enum NODETYPE {
    PROGRAM  = 'Program',
    EXPORT_DEFAULT_DECLARATION = 'ExportDefaultDeclaration',
    EXPORT_NAMED_DECLARATION = 'ExportNamedDeclaration',
    EXPORT_ALL_DECLARATION = 'ExportAllDeclaration',
    IMPORT_DECLARATION = 'ImportDeclaration',
    IMPORT_SPECIFIER = 'ImportSpecifier',
    IMPORT_DEFAULT_SPECIFIER = 'ImportDefaultSpecifier',
    IMPORT_NAMESPACE_SPECIFIER = 'ImportNamespaceSpecifier',
    IDENTIFIER = 'Identifier',
    Literal = 'Literal',
}