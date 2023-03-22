# trie-js

Trie data structure implementation in javascript

# Example

```javascript
const Trie = require('@navpreetdevpuri/trie-js');

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
    key: `${firstName}${lastName}`.replace(/\s/g, ''), // remove spaces
    value: {
      firstName,
      lastName,
    },
  };
  nodes.push(node);
});

const trie = new Trie(nodes, true); // caseInsensitive = true

console.log(
  trie.search({
    skip: 1,
    limit: 2,
    prefix: 'Eas',
    contains: 'son',
    reverse: false,
  })
);
/* 
[
  { currPrefix: 'easfonbarreson', values: [ [Object] ] },
  { currPrefix: 'eassonbanson', values: [ [Object] ] }
]
*/

console.log(trie.getPreorderPredecessorAndSuccessorForNewkey('eastonbassy'));
/*
{
  predecessorValues: [ { firstName: 'Easton', lastName: 'Bass' } ],
  successorValues: [ { firstName: 'Heidi', lastName: 'Murphy' } ]
}
*/

console.log(
  trie.getPreorderPredecessorAndSuccessorForExistingKey('eastonbass')
);
/*
{
  predecessorValues: [ { firstName: 'Easson', lastName: 'banson' } ],
  successorValues: [ { firstName: 'Heidi', lastName: 'Murphy' } ]
}
*/
```
