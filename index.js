export default class Trie {
  constructor(nodes = []) {
    this.root = { parent: null, upperEdge: null };
    this.count = 0;
    this.charset = new Set();
    this.charsetAscending = [];
    this.charsetDescending = [];
    this.createTrie(nodes);
  }

  _pushAllNextSubStrings(currentNode, prefix, queue, reverse = false) {
    for (const ch of reverse ? this.charsetAscending : this.charsetDescending)
      if (currentNode[ch]) queue.push([currentNode[ch], prefix + ch]);
  }

  _pushAllNextNodes(currentNode, queue, reverse = false) {
    for (const ch of reverse ? this.charsetAscending : this.charsetDescending)
      if (currentNode[ch]) queue.push(currentNode[ch]);
  }

  _round(node, ceil = true) {
    const currentNode = node;
    const queue = [currentNode];

    while (queue.length > 0) {
      const currentNode = queue.pop();
      this._pushAllNextNodes(currentNode, queue, ceil);

      if (currentNode._isEnd) {
        return currentNode;
      }
    }
  }

  _getMax(node) {
    return this._round(node);
  }

  _getMin(node) {
    return this._round(node, false);
  }

  _getPrefix(node) {
    let currentNode = node;
    let prefix = '';
    while (currentNode.parent) {
      prefix = currentNode.upperEdge + prefix;
      currentNode = currentNode.parent;
    }
    return prefix;
  }

  _pushAllPossibleNodesForPrefix(prefix, queue) {
    prefix = prefix.toLowerCase();
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

  _moveToRoundSubtree(queue, ceil = false) {
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

  getPreorderPredecessorAndSuccessor(string) {
    const queue = [];
    this._pushAllPossibleNodesForPrefix(string, queue);

    let predecessor = this._moveToRoundSubtree([...queue], false);
    let successor = this._moveToRoundSubtree([...queue], true);

    predecessor = predecessor ? this._getMax(predecessor) : null;
    successor = successor ? this._getMin(successor) : null;

    return { predecessor, successor };
  }

  createTrie(nodes) {
    nodes.forEach((node) => {
      this.insert(node);
    });
  }

  insert({ string, value }) {
    let isAddedNewChar = false;

    let currentNode = this.root;

    for (const ch of string.toLowerCase()) {
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

  find(string) {
    let currentNode = this.root;
    for (const ch of string) {
      if (!currentNode[ch]) return [];
      currentNode = currentNode[ch];
    }

    if (!currentNode || !currentNode._isEnd) return [];
    return currentNode;
  }

  remove(string, valueChecker) {
    const node = this.find(string);
    if (!node) return false;
    nodes.values.forEach((value, index) => {
      if (valueChecker(value)) {
        nodes.values.splice(index, 1);
      }
    });
    if (node.values.length == 0) {
      node._isEnd = false;
    }
    this.count--;
    return true;
  }

  preorderTraversalSearch({
    skip = 0,
    limit = this.count,
    prefix = null,
    contains = null,
    reverse = false,
  }) {
    const result = [];
    const queue = [[this.root, '']];
    let count = 0;

    if (prefix) {
      prefix = prefix.toLowerCase();

      let [currentNode] = queue.pop();
      for (const ch of prefix) {
        currentNode = currentNode[ch];
        if (!currentNode) return [];
      }

      this._pushAllNextSubStrings(currentNode, prefix, queue, reverse);
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

        result.push(currPrefix);
        // result.push(currentNode);
        if (result.length == limit) return result;
      }
    }
    return result;
  }
}
