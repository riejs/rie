import { parse } from '@babel/parser';
import * as babelTypes from '@babel/types';
import generate from '@babel/generator';

const clientFetchDecorator = 'clientFetch';

const isContainDecorator = (str: string, decorator = clientFetchDecorator) => str.search(new RegExp(`.*?\\b${decorator}\\b`)) >= 0;

/**
 * 判断类方法是否包含了 @clientFetch 装饰器
 *
 * @param {Array<BabelTypes.ClassMethod>} classMethod - 类方法列表
 * @returns {Boolean} true 包含，false 不包含
 */
const hasClientFetchDecorator = function hasClientFetchDecorator({ decorators = [] }: babelTypes.ClassMethod) {
  return decorators.some(({ expression }) => {
    if (babelTypes.isIdentifier(expression)) {
      return isContainDecorator(expression.name);
    }
    if (babelTypes.isCallExpression(expression)) {
      const { callee } = expression;
      return babelTypes.isIdentifier(callee) ? isContainDecorator(callee.name) : false;
    }
    return false;
  });
};

/**
 * 在 Class 中，找到带 clientFetch 装饰器的类方法，并清空其内部逻辑
 *
 * e.g.
 * 源码:
 * class Example {
 *   @clientFetch
 *   method1() { console.log }
 * }
 *
 * 转化后:
 * class Example {
 *   @clientFetch
 *   method1() {}
 * }
 *
 * @param {NodePath<BabelTypes.ClassDeclaration>} path - Babel 类声明节点路径
 */
export const clientFetchLoader = function clientFetchLoader(src: string) {
  if (src.indexOf(`@${clientFetchDecorator}`) >= 0) {
    const result = parse(src, {
      sourceType: 'module',
      plugins: ['decorators-legacy', 'typescript'],
    });
    result.program.body.forEach((node) => {
      if (!babelTypes.isClassDeclaration(node)) {
        return;
      }
      const methods = node.body.body.filter(hasClientFetchDecorator);
      methods.forEach((method: babelTypes.ClassMethod) => {
        // eslint-disable-next-line no-param-reassign
        method.body.body = [];
      });
    });
    const converted = generate(result);
    return converted.code;
  }
  return src;
};

module.exports = clientFetchLoader;
