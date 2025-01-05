import Program from './Program';
import UnknownNode from './UnknownNode';
import { ExportAllDeclaration } from './ExportAllDeclaration';
import { ExportDefaultDeclaration } from './ExportDefaultDeclaration';
import {ExportNamedDeclaration } from './ExportNamedDeclaration';
import ExportSpecifier from './ExportSpecifier';
import ImportDeclaration from './ImportDeclaration';
import ImportDefaultSpecifier from './ImportDefaultSpecifier';
import ImportNamespaceSpecifier from './ImportNamespaceSpecifier';
import ImportSpecifier from './ImportSpecifier';
import FunctionDeclaration from './FunctionDeclaration';
import Identifier from './Identifier';
import Literal from './Literal';
import VariableDeclaration from './VariableDeclaration';
import VariableDeclarator from './VariableDeclarator';
import MemberExpression from './MemberExpression';
import ExpressionStatement from './ExpressionStatement';
import  AssignmentExpression  from './AssignmentExpression';
import BinaryExpression from './BinaryExpression';
import BlockStatement from './BlockStatements';
import CallExpression from './CallExpression';
import ReturnStatement from './ReturnStatement';
import ArrayExpression from './ArrayExpression';

export const nodeConstructor = {
    ArrayExpression,
    AssignmentExpression,
    BlockStatement,
    BinaryExpression,
    CallExpression,
    ExportAllDeclaration,
    ExportDefaultDeclaration,
    ExportNamedDeclaration,
    ExportSpecifier,
    ExpressionStatement,
    FunctionDeclaration,
    Identifier,
    ImportDeclaration,
    ImportDefaultSpecifier,
    ImportNamespaceSpecifier,
    ImportSpecifier,
    ReturnStatement,
    Literal,
    MemberExpression,
    Program,
    UnknownNode,
    VariableDeclaration,
    VariableDeclarator,

}

export {
    ImportDeclaration,
    ExportAllDeclaration,
    ExportNamedDeclaration,
    ExportDefaultDeclaration
}