import test from 'ava';
import {
  Sevent,
  Aggregate
} from '.';

test('simple aggregate', async t => {
  const userDescription = {
    id: 'number',
    name: 'string',
    age: 'number'
  };
  const aggregate = new Aggregate('users', userDescription);
  t.is(aggregate.name, 'users');
  const foo = {
    id: 0,
    name: 'Foo',
    age: 42
  };
  const addUser1 = new Sevent({type: 'insert'}, foo);
  await addUser1.commit(aggregate);
  t.is(aggregate.latestSevent().hash, addUser1.hash);
});
