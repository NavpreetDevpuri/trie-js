# trie-js
Trie data structure implementation in javascript 


# Example 

```
const Trie = require('@navpreetdevpuri/trie');

const names = [
  'Easton Bass',
  'Easdon Wilkinson',
  'Easfon Barreson',
  'Easgon Barrtera',
  'Easson banson',
  'Clarence Barrera',
  'Heidi Murphy',
];

const nodes = [];
names.forEach((name) => {
  const [firstName, lastName] = name.split(' ');
  const node = {
    key: `${firstName} ${lastName}`,
    value: {
      firstName,
      lastName
    },
  };
  nodes.push(node);
});

const trie = new Trie(nodes);

console.log(
  trie.search({
    skip: 1,
    limit: 2,
    prefix: "Eas", 
    contains: "son",
    reverse: false,
  })
);
```