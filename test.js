import test from 'ava';
import {
  Ev,
  Aggregate
} from '.';

const userDescription = {
  id: 'number',
  name: 'string',
  age: 'number'
};

const users = [
  {
    id: 0,
    name: 'Foo',
    age: 42
  },
  {
    id: 1,
    name: 'Bar',
    age: 24
  },
  {
    id: 2,
    name: 'Helter',
    age: 20
  }
];

test('simple aggregate', async t => {
  const aggregate = new Aggregate('users', userDescription);
  t.is(aggregate.name, 'users');
  const addUser = new Ev({type: 'insert', prevHash: ''}, users[0], '0x00');
  await addUser.commit(aggregate);
  t.is(aggregate.latestEv().hash, addUser.hash);
});

test('multiple add events', async t => {
  const aggregate = new Aggregate('users', userDescription);
  const addUser0 = new Ev({type: 'insert', prevHash: ''}, users[0], '0x00');
  await addUser0.commit(aggregate);
  const addUser1 = new Ev({type: 'insert', prevHash: '0x00'}, users[1], '0x01');
  await addUser1.commit(aggregate);
  const addUser2 = new Ev({type: 'insert', prevHash: '0x01'}, users[2], '0x02');
  await addUser2.commit(aggregate);
  t.deepEqual(aggregate.table, users);
});
