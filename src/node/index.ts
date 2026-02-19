import Program  from './Program';
import ExportAllDeclaration from './ExportAllDeclaration';
import ExportDefaultDeclaration from './ExportDefaultDeclaration';
import ExportNamedDeclaration from './ExportNamedDeclaration';
import ExportSpecifier from './ExportSpecifier';
import ImportDeclaration from './ImportDeclaration';
import ImportDefaultSpecifier from './ImportDefaultSpecifier';
import ImportNamespaceSpecifier from './ImportNamespaceSpecifier';
import ImportSpecifier from './ImportSpecifier';
import Identifier from './Identifier';
import Literal from './Literal';
import FunctionDeclaration from './FunctionDeclaration';
import VariableDeclaration from './VariableDeclaration';
import VariableDeclarator from './VariableDeclarator';
import { NodeBase } from './shared';


export const nodeConstructors :{
    [key: string]: typeof NodeBase
}= {
    Program,
    ExportAllDeclaration,
    ExportDefaultDeclaration,
    ExportNamedDeclaration,
    ExportSpecifier,
    FunctionDeclaration,
    ImportDeclaration,
    ImportDefaultSpecifier,
    ImportNamespaceSpecifier,
    ImportSpecifier,
    Identifier,
    Literal,
    VariableDeclaration,
    VariableDeclarator
}
