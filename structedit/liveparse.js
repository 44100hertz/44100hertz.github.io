addEventListener("load", load);

function load() {
  const e_expression = document.getElementById("expression-pane");
  const e_tree = document.getElementById("tree-pane");
  const genTree = () => {
    const tree = generateTree(e_expression.value);
    e_tree.innerHTML = '';
    e_tree.appendChild(treeHTML(tree));
  };
  e_expression.addEventListener("keyup", genTree)
  genTree();
}

function generateTree(text) {
  const lexed = lexString(text);
  const parsed = parseTokens(lexed);
  const tree = trimTree(parsed);
  console.log(JSON.stringify(tree));
  return tree;
}

const matchAll = (cond) => (str) =>
      (str !== '') && str.split('').every((c) => cond(c));

const parens = {
  "(": true,
  ")": true,
}

const operators = {
  "+": {
    precedence: 0,
    semantics: 'infix',
  },
  "*": {
    predecence: 1,
    semantics: 'infix',
  }
}

const tokenKinds = {
  white: (s) => s.trim() === '',
  integer: matchAll((c) => c >= '0' && c <= '9'),
  operator: (s) => s in operators,
  paren: (s) => s in parens,
}

function lexString(text, position = 0) {
  let matchKind = "UNKNOWN";
  if (position === text.length) {
    return [];
  }
  for (let end = position+1;; ++end) {
    let token = text.slice(position, end);
    const candidate = Object.entries(tokenKinds)
                            .find(([, match]) => match(token))
    if (candidate) {
      matchKind = candidate[0];
    }
    if (!candidate || end > text.length) {
      if (end <= text.length) token = token.slice(0, -1);
      if (matchKind !== 'white') {
        const parsedToken = {
          kind: matchKind,
          value: token,
          start: position,
          end: end-1,
        };
        return [parsedToken, ...lexString(text, end-1)];
      } else {
        return lexString(text, end-1);
      }
    }
  }
}

function parseTokens(tokens, index = {ref: 0}, tree = []) {
  if (index.ref === tokens.length) {
    return tree;
  }

  const token = tokens[index.ref];
  console.log(token.value, JSON.stringify(tree));
  ++index.ref;
  switch (token.kind) {
    case 'integer':
      return parseTokens(tokens, index, [...tree, Number(token.value)]);
    case 'operator':
      const { precedence, semantics } = operators[token.value];
      switch (semantics) {
        case 'infix':
          return parseTokens(tokens, index, [token.value, tree])
      }
      return ['UNKNOWN'];
    case 'paren':
      if (token.value == '(') {
        const inner = parseTokens(tokens, index, []);
        return parseTokens(tokens, index, [...tree, ['()', inner]]);
      } else if ( token.value == ')' ) {
        return tree;
      }
    default:
      throw new Error(`Unknown token: "${token}"`)
  }
}

function trimTree(tree) {
  while(Array.isArray(tree) && tree.length == 1) {
    tree = tree[0];
  }
  if (Array.isArray(tree)) {
    return tree.map(trimTree);
  } else {
    return tree;
  }
}


function treeHTML(tree, depth = 0, index = 0) {
  const node = document.createElement('div');
  node.style.width = "fit-content";
  node.style.height = "fit-content";
  node.style.minWidth = "1em";
  node.style.textAlign = "center";
  node.style.border = "1px solid black";
  node.style.padding = "0 0.2em";
  node.style.margin = "0 0.2em";
  node.style.background = `hsl(${depth * 40}, 75%, 75%)`
  if (Array.isArray(tree)) {
    console.log(tree);
    const [root, ...children] = tree;
    node.textContent = root;
    const e_children = document.createElement('p');
    e_children.style.display = "flex";
    e_children.style.flexDirection = "row";
    children.forEach((subtree, index) => {
        e_children.appendChild(treeHTML(subtree, depth + 1, index));
    })
    node.appendChild(e_children);
  } else {
    node.textContent = tree;
  }
  return node;
}
