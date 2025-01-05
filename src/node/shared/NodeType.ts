export const enum NODETYPE {
    ARRAY_EXPR = 'ArrayExpression',
    ASSIGNMENT_EXPR='AssignmentExpression',
   BLOCK_STATEMENT = "BlockStatement",
   CALLEXPRESSION = "CallExpression",
   EXPORT_ALL ="ExportAllDeclaration",
   ExPORT_DEFAULT = "ExportDefaultDeclaration",
   EXPORT_NAME = "ExportNamedDeclaration",
   EXPORT_SPECIFIER = "ExportSpecifier",
   FUNCTION_DECLARATION ="FunctionDeclaration",
   LITERAL="Literal",
   IDENTIFIER = 'Identifier',
   IMPORT_DECLARATION = 'ImportDeclaration',
   IMPORT_DEFAULT_SPECIFIER = 'ImportDefaultSpecifier',
   IMPORT_NAMESPACE_SPECIFIER = 'ImportNamespaceSpecifier',
   IMPORT_SPECIFIER = 'ImportSpecifier',
   RETURN_STATEMENT= 'ReturnStatement',
   MEMBER_EXPRESSION="MemberExpression",
   PROGRAM = 'Program',
   
   VARIABLE_DECLARATION = "VariableDeclaration",
   VARIABLE_DECLARATOR = "VariableDeclarator",
   UNKNOWN_NODE="UnknownNode"
}