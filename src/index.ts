type TrieNode = {
  parent: TrieNode;
  upperEdge: string;
  _isEnd?: boolean;
  values?: any[];
  [key: string]: any;
};

class Trie {
  root: TrieNode;
  count: number;
  charset: Set<string>;
  charsetAscending: string[];
  charsetDescending: string[];
  caseInsensitive: boolean;

  constructor(
    nodes: { key: string; value: any }[] = [],
    caseInsensitive = true
  ) {
    this.root = { parent: null, upperEdge: null };
    this.count = 0;
    this.charset = new Set();
    this.charsetAscending = [];
    this.charsetDescending = [];
    this.caseInsensitive = caseInsensitive;
    this.createTrie(nodes);
  }

  private _pushAllNextSubStrings(
    currentNode: TrieNode,
    prefix: string,
    queue: [TrieNode, string][],
    reverse = false
  ) {
    for (const ch of reverse ? this.charsetAscending : this.charsetDescending) {
      if (currentNode[ch]) queue.push([currentNode[ch], prefix + ch]);
    }
  }

  private _pushAllNextNodes(
    currentNode: TrieNode,
    queue: TrieNode[],
    reverse = false
  ) {
    for (const ch of reverse ? this.charsetAscending : this.charsetDescending) {
      if (currentNode[ch]) queue.push(currentNode[ch]);
    }
  }

  private _round(node: TrieNode, ceil = true): TrieNode {
    const currentNode = node;
    const queue: TrieNode[] = [currentNode];

    while (queue.length > 0) {
      const currentNode = queue.pop()!;
      this._pushAllNextNodes(currentNode, queue, ceil);

      if (currentNode._isEnd) {
        return currentNode;
      }
    }
  }

  private _getMax(node: TrieNode): TrieNode {
    return this._round(node);
  }

  private _getMin(node: TrieNode): TrieNode {
    return this._round(node, false);
  }

  private _getPrefix(node: TrieNode): string {
    let currentNode = node;
    let prefix = '';
    while (currentNode.parent) {
      prefix = currentNode.upperEdge + prefix;
      currentNode = currentNode.parent;
    }
    return prefix;
  }

  private _pushAllPossibleNodesForPrefix(
    prefix: string,
    queue: [TrieNode, string][]
  ) {
    if (this.caseInsensitive) {
      prefix = prefix.toLowerCase();
    }
    let currentNode = this.root;
    for (let i = 0; i < prefix.length; i++) {
      const ch = prefix[i];
      if (!currentNode[ch]) {
        queue.push([currentNode, ch]);
        break;
      }
      queue.push([currentNode, ch]);
      currentNode = currentNode[ch];
    }
  }

  _moveToRoundSubtree(queue: [TrieNode, string][], ceil = false): TrieNode {
    let resultNode = null;
    while (resultNode == null && queue.length > 0) {
      const [currentNode, nextCh] = queue.pop();
      const searchingCharset = ceil
        ? this.charsetAscending.slice(this.charsetAscending.indexOf(nextCh) + 1)
        : this.charsetDescending.slice(
            this.charsetDescending.indexOf(nextCh) + 1
          );
      for (const ch of searchingCharset) {
        if (currentNode[ch]) {
          return currentNode;
        }
      }
    }

    return null;
  }

  _findNode(key: string): TrieNode {
    let currentNode = this.root;
    for (const ch of key) {
      if (!currentNode[ch]) return null;
      currentNode = currentNode[ch];
    }

    if (!currentNode || !currentNode._isEnd) return null;
    return currentNode;
  }

  getPreorderPredecessorAndSuccessor(key: string): {
    predecessor: TrieNode;
    successor: TrieNode;
  } {
    const queue: [TrieNode, string][] = [];
    this._pushAllPossibleNodesForPrefix(key, queue);

    let predecessor = this._moveToRoundSubtree([...queue], false);
    let successor = this._moveToRoundSubtree([...queue], true);

    predecessor = predecessor ? this._getMax(predecessor) : null;
    successor = successor ? this._getMin(successor) : null;

    return { predecessor, successor };
  }

  createTrie(nodes: { key: string; value: any }[]) {
    nodes.forEach((node) => {
      this.insert(node.key, node.value);
    });
  }

  insert(key: string, value: any) {
    let isAddedNewChar = false;

    let currentNode = this.root;

    for (const ch of this.caseInsensitive ? key.toLowerCase() : key) {
      if (!this.charset.has(ch)) {
        isAddedNewChar = true;
        this.charset.add(ch);
        this.charsetAscending.push(ch);
      }

      if (!currentNode[ch])
        currentNode[ch] = { parent: currentNode, upperEdge: ch };
      currentNode = currentNode[ch];
    }

    currentNode._isEnd = true;

    if (!currentNode.values) currentNode.values = [];
    currentNode.values.push(value);

    if (isAddedNewChar) {
      this.charsetAscending.sort();
      this.charsetDescending = this.charsetAscending.slice().reverse();
    }

    this.count++;
  }

  find(key): any[] {
    let currentNode = this._findNode(key);
    if (!currentNode) return null;
    return currentNode.values;
  }

  remove(key: string, valueChecker: Function): boolean {
    const node = this._findNode(key);
    if (!node) return false;
    node.values.forEach((value, index) => {
      if (valueChecker(value)) {
        node.values.splice(index, 1);
      }
    });
    if (node.values.length == 0) {
      node._isEnd = false;
    }
    this.count--;
    return true;
  }

  search(options: {
    skip?: number;
    limit?: number;
    prefix?: string;
    contains?: string;
    reverse?: boolean;
  }) {
    let {
      skip = 0,
      limit = this.count,
      prefix = null,
      contains = null,
      reverse = false,
    } = options;
    const result: { currPrefix: string; values: any }[] = [];
    const queue: [TrieNode, string][] = [[this.root, '']];
    let count = 0;

    if (prefix) {
      if (this.caseInsensitive) {
        prefix = prefix.toLowerCase();
      }

      let [currentNode] = queue.pop();
      for (const ch of prefix) {
        currentNode = currentNode[ch];
        if (!currentNode) return [];
      }

      this._pushAllNextSubStrings(currentNode, prefix, queue, reverse);
      if (currentNode._isEnd) {
        queue.push([currentNode, prefix]);
      }
    }

    while (queue.length > 0) {
      const [currentNode, currPrefix] = queue.pop();
      this._pushAllNextSubStrings(currentNode, currPrefix, queue, reverse);

      if (currentNode._isEnd) {
        // TODO:
        // one optimation is to store if a prefix already contains
        // so all of the names formed from it can be inserted without includes()
        if (contains && !currPrefix.includes(contains)) continue;
        if (count++ < skip) continue;

        result.push({ currPrefix, values: currentNode.values });
        if (result.length == limit) return result;
      }
    }
    return result;
  }
}

module.exports = Trie;
