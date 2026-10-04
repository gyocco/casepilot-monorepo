import { Project, Node, SyntaxKind } from 'ts-morph';
import { parseTemplate, TmplAstRecursiveVisitor, tmplAstVisitAll, RecursiveAstVisitor, BindingType } from '@angular/compiler';
import postcss from 'postcss';
import scss from 'postcss-scss';
import valueParser from 'postcss-value-parser';
import colorNames from 'color-name';
import { WEB_SOURCE, KIT_SOURCE } from './dependency-rules.mjs';

const paletteFile = `${KIT_SOURCE}/theme/default-colors.ts`;
const tokenFile = `${KIT_SOURCE}/theme/color-tokens.ts`;
const assetRenderer = `${KIT_SOURCE}/components/asset/pilot-asset.component.ts`;
const colorFunctions = new Set(['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch', 'color']);
const assetPath = /(?:^|\/)[^\s]+\.(?:svg|png|jpe?g|webp|avif|gif|mp4|webm|lottie)(?:[?#].*)?$/i;
const normalize = value => value.replaceAll('\\', '/');

/** Analyzes actual TS/Angular/PostCSS ASTs. Files use repository-relative paths. */
export function checkSources(files) {
  const errors = [];
  const report = (file, id, message) => errors.push(`${file}: ${id}: ${message}`);
  const project = new Project({ useInMemoryFileSystem: true, skipAddingFilesFromTsConfig: true });
  const sources = Object.entries(files).filter(([file]) => file.endsWith('.ts'))
    .map(([file, text]) => project.createSourceFile(normalize(file), text));
  const tokens = new Set();
  const tokenSource = sources.find(source => source.getFilePath().endsWith(`/${tokenFile}`));
  tokenSource?.getDescendantsOfKind(SyntaxKind.StringLiteral).forEach(node => {
    if (node.getLiteralValue().startsWith('--pilot-color-')) tokens.add(node.getLiteralValue());
  });
  if (!tokens.size) report(tokenFile, 'FRT-010', 'Color token definitions were not analyzed.');
  for (const root of [WEB_SOURCE, KIT_SOURCE]) {
    if (!sources.some(source => source.getFilePath().includes(`/${root}/`))) report(root, 'FRT-010', 'Source scope must not be empty.');
  }

  function checkValue(file, value, allowColor = false) {
    const parsed = valueParser(value);
    parsed.walk(node => {
      if (!allowColor && ((node.type === 'function' && colorFunctions.has(node.value.toLowerCase())) ||
        (node.type === 'word' && (/^#[\da-f]{3,8}$/i.test(node.value) || Object.hasOwn(colorNames, node.value.toLowerCase()))))) {
        report(file, 'FRT-004', `Use semantic color tokens instead of ${node.value}.`);
      }
      if (node.type === 'word' && node.value.startsWith('--pilot-color-') && !tokens.has(node.value)) {
        report(file, 'FRT-004', `Unknown color token ${node.value}.`);
      }
      if (node.type === 'function' && node.value === 'url' && file !== `${KIT_SOURCE}/styles/theme.scss`) {
        report(file, 'FRT-005', 'Resolve visual resources through the named asset renderer.');
      }
    });
  }

  function checkStyle(file, text) {
    try {
      const ast = file.endsWith('.scss') ? scss.parse(text, { from: file }) : postcss.parse(text, { from: file });
      ast.walkDecls(declaration => {
        if (declaration.prop.startsWith('--pilot-color-')) report(file, 'FRT-004', 'Only the theme host assigns global color roles.');
        checkValue(file, declaration.value);
      });
      ast.walkAtRules(at => {
        if (at.name === 'include') checkValue(file, at.params);
      });
    } catch (error) { report(file, 'FRT-010', `Style parse failed: ${error.message}`); }
  }

  function checkClasses(file, value) {
    for (const token of value.split(/\s+/)) {
      if (/(?:^|:)(?:bg|text|border|outline|ring|divide|decoration|fill|stroke|shadow|from|via|to)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})(?:\/[^\s]+)?$/.test(token) || /(?:^|:)\[?(?:color|background|border-color)?[-:]?[^\s]*(?:#[\da-f]{3,8}|(?:rgb|hsl|oklch)\()/i.test(token)) {
        report(file, 'FRT-004', `Use a semantic utility instead of ${token}.`);
      }
      if (/(?:^|:)(?:bg|text|border|outline|ring|divide|decoration|fill|stroke|shadow|from|via|to)-\[/.test(token) || /\[(?:color|background|border-color):/.test(token)) {
        const arbitrary = token.match(/\[([^\]]+)\]/)?.[1];
        if (arbitrary) checkValue(file, arbitrary.replaceAll('_', ' '));
      }
    }
  }

  function checkTemplate(file, text) {
    const parsed = parseTemplate(text, file, { preserveWhitespaces: true });
    if (parsed.errors?.length) { report(file, 'FRT-010', `Template parse failed: ${parsed.errors[0].msg}`); return; }
    class Strings extends RecursiveAstVisitor {
      constructor(check) { super(); this.check = check; }
      visitLiteralPrimitive(ast) { if (typeof ast.value === 'string') this.check(ast.value); }
      visitLiteralMap(ast, context) { ast.keys.forEach(key => this.check(key.key)); super.visitLiteralMap(ast, context); }
    }
    class TemplateVisitor extends TmplAstRecursiveVisitor {
      visitElement(element) {
        const name = element.name.replace(/^:svg:/, '');
        if (file.startsWith(WEB_SOURCE) && ['img', 'svg', 'video', 'source', 'picture', 'mat-icon'].includes(name)) {
          report(file, 'FRT-005', 'Use pilot-asset for named visual resources.');
        }
        for (const attr of element.attributes) {
          if (attr.name === 'class') checkClasses(file, attr.value);
          if (attr.name === 'style') checkStyle(file, `x { ${attr.value} }`);
          if (['fill', 'stroke', 'color', 'bgcolor'].includes(attr.name)) checkValue(file, attr.value);
          if (['src', 'poster', 'href', 'xlink:href'].includes(attr.name) && assetPath.test(attr.value) && file !== assetRenderer) {
            report(file, 'FRT-005', 'Resource paths belong only in theme manifests.');
          }
        }
        for (const input of element.inputs) {
          const check = value => {
            if (['class', 'ngClass'].includes(input.name)) checkClasses(file, value);
            if (input.type === BindingType.Style || input.name === 'style') checkValue(file, value);
            if (['src', 'poster', 'href'].includes(input.name) && assetPath.test(value) && file !== assetRenderer) {
              report(file, 'FRT-005', 'Do not bind literal resource paths.');
            }
          };
          input.value.visit(new Strings(check));
        }
        super.visitElement(element);
      }
    }
    tmplAstVisitAll(new TemplateVisitor(), parsed.nodes);
  }

  for (const source of sources) {
    const file = source.getFilePath().slice(1);
    const themeManifest = new RegExp(`^${WEB_SOURCE}/theme/[^/]+\\.theme\\.ts$`).test(file);
    const allowColors = file === paletteFile || themeManifest;
    const local = file.startsWith(`${WEB_SOURCE}/`) ? file.slice(WEB_SOURCE.length + 1) : undefined;
    if (local && !/^(?:app|features|core|shared|shell|theme)\//.test(local) && !/^(?:main\.ts|index\.html|styles\.css|material\.scss)$/.test(local)) {
      report(file, 'FRT-001', 'Place application sources under their feature or a defined shared/composition responsibility.');
    }
    if (themeManifest && (source.getClasses().length || source.getFunctions().length)) report(file, 'FRT-004', 'Theme manifests contain data, not component or service implementations.');
    const imports = source.getImportDeclarations();
    const angularNames = new Map();
    const angularNamespaces = new Set();
    for (const declaration of imports.filter(item => item.getModuleSpecifierValue() === '@angular/core')) {
      declaration.getNamedImports().forEach(item => angularNames.set(item.getAliasNode()?.getText() ?? item.getName(), item.getName()));
      const namespace = declaration.getNamespaceImport();
      if (namespace) angularNamespaces.add(namespace.getText());
    }
    const isAngularSymbol = (expression, name) => expression && (
      (Node.isIdentifier(expression) && angularNames.get(expression.getText()) === name) ||
      (Node.isPropertyAccessExpression(expression) && angularNamespaces.has(expression.getExpression().getText()) && expression.getName() === name)
    );
    const handled = new Set();
    for (const component of source.getClasses()) {
      const decorator = component.getDecorators().find(item => {
        const expression = item.getExpression();
        return isAngularSymbol(Node.isCallExpression(expression) ? expression.getExpression() : expression, 'Component');
      });
      if (!decorator) continue;
      const config = decorator.getArguments()[0];
      if (!config || !Node.isObjectLiteralExpression(config)) { report(file, 'FRT-003', 'Use inspectable component metadata.'); continue; }
      const property = name => {
        const entry = config.getProperty(name);
        return entry && Node.isPropertyAssignment(entry) ? entry.getInitializer() : undefined;
      };
      if (property('standalone')?.getText() !== 'true') report(file, 'FRT-003', 'Components must explicitly be standalone.');
      const change = property('changeDetection');
      if (!change || !Node.isPropertyAccessExpression(change) || change.getName() !== 'OnPush' || !isAngularSymbol(change.getExpression(), 'ChangeDetectionStrategy')) {
        report(file, 'FRT-003', 'Components must use Angular ChangeDetectionStrategy.OnPush.');
      }
      for (const name of ['template', 'styles']) {
        const node = property(name);
        if (!node) continue;
        const literals = Node.isArrayLiteralExpression(node) ? node.getElements() : [node];
        for (const literal of literals) {
          if (!Node.isStringLiteral(literal) && !Node.isNoSubstitutionTemplateLiteral(literal)) { report(file, 'FRT-010', 'Templates/styles must be statically analyzable literals.'); continue; }
          handled.add(literal);
          (name === 'template' ? checkTemplate : checkStyle)(file, literal.getLiteralValue());
        }
      }
    }
    for (const literal of source.getDescendants().filter(node => Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node))) {
      if (handled.has(literal) || literal.getParentIfKind(SyntaxKind.ImportDeclaration) || literal.getParentIfKind(SyntaxKind.ExportDeclaration)) continue;
      const value = literal.getLiteralValue();
      if (!allowColors && (/^#[\da-f]{3,8}$/i.test(value) || /^(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i.test(value))) report(file, 'FRT-004', 'Color values belong only in palette/theme data.');
      const parent = literal.getParent();
      if (!allowColors && (Node.isPropertyAssignment(parent) || Node.isPropertyDeclaration(parent)) && /(?:color|background|fill|stroke)/i.test(parent.getName())) checkValue(file, value);
      if (file !== tokenFile && (value.startsWith('--pilot-color-') || value.startsWith('var(--pilot-color-'))) report(file, 'FRT-004', 'Use PILOT_COLOR_VARIABLE or PILOT_COLOR constants in TypeScript.');
      if (assetPath.test(value) && !themeManifest) report(file, 'FRT-005', 'Visual resource paths belong only in theme manifests.');
    }
    for (const declaration of imports) {
      const target = declaration.getModuleSpecifierValue();
      if (file.startsWith(`${WEB_SOURCE}/app/`) && target.includes('features/')) report(file, 'FRT-009', 'Load feature route entries with dynamic import.');
      if (file.endsWith('.routes.ts') && /\/(?:pages|components)\//.test(target)) report(file, 'FRT-009', 'Feature pages must use loadComponent dynamic imports.');
    }
  }
  for (const [file, text] of Object.entries(files)) {
    if (/\.(?:css|scss)$/.test(file)) checkStyle(file, text);
    if (/\.(?:html|svg)$/.test(file)) checkTemplate(file, text);
  }
  return [...new Set(errors)];
}
