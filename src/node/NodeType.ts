export const enum NODETYPE {
   EXPORT_ALL ="exportAllDeclaration",
   ExPORT_DEFAULT = "exportDefaultDeclaration",
   EXPORT_NAME = "exportNamedDeclaration",
   EXPORT_SPECIFIER = "exportSpecifier",
   FUNCTION_DECLARATION ="functionDeclaration",
   LITERAL="literal",
   IDENTIFIER = 'identifier',
   IMPORT_DECLARATION = 'importDeclaration',
   IMPORT_DEFAULT_SPECIFIER = 'importDefaultSpecifier',
   IMPORT_NAMESPACE_SPECIFIER = 'importNamespaceSpecifier',
   IMPORT_SPECIFIER = 'importSpecifier',
   MEMBER_EXPRESSION="memberExpression",
   PROGRAM = 'program',
   VARIABLE_DECLARATION = "variableDeClaration",
   VARIABLE_DECLARATOR = "variableDeclarator",
   UNKNOWN_NODE="unknownNode"
}