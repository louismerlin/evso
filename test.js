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
  let aggregate = new Aggregate('users', userDescription);
  t.is(aggregate.name, 'users');
  const addUser = new Ev({type: 'insert', prevHash: ''}, users[0], '0x00');
  aggregate = await aggregate.add(addUser);
  t.is(aggregate.latestEv().hash, addUser.hash);
});

test('multiple add events', async t => {
  let aggregate = new Aggregate('users', userDescription);
  const addUser0 = new Ev({type: 'insert', prevHash: ''}, users[0], '0x00');
  aggregate = await aggregate.add(addUser0);
  const addUser1 = new Ev({type: 'insert', prevHash: '0x00'}, users[1], '0x01');
  aggregate = await aggregate.add(addUser1);
  const addUser2 = new Ev({type: 'insert', prevHash: '0x01'}, users[2], '0x02');
  aggregate = await aggregate.add(addUser2);
  t.deepEqual(aggregate.table, users);
});

test('unordered add events', async t => {
  let aggregate = new Aggregate('users', userDescription);
  const addUser2 = new Ev({type: 'insert', prevHash: '0x01'}, users[2], '0x02');
  aggregate = await aggregate.add(addUser2);
  const addUser1 = new Ev({type: 'insert', prevHash: '0x00'}, users[1], '0x01');
  aggregate = await aggregate.add(addUser1);
  const addUser0 = new Ev({type: 'insert', prevHash: ''}, users[0], '0x00');
  aggregate = await aggregate.add(addUser0);
  t.deepEqual(aggregate.table, users);
});

test('catching up', async t => {
  let aggregate = new Aggregate('users', userDescription);
  const addUser2 = new Ev({type: 'insert', prevHash: '0x01', catchUp: '0x10'}, users[2], '0x02');
  aggregate = await aggregate.add(addUser2);
  t.deepEqual(aggregate.table, []);
  t.deepEqual(aggregate.branches, [addUser2]);
  const catchUp = new Ev({type: 'catchUp', prevHash: ''}, users.slice(0, 2), '0x10');
  aggregate = await aggregate.add(catchUp);
  t.deepEqual(aggregate.table, users);
});

test('simple modify', async t => {
  let aggregate = new Aggregate('users', userDescription);
  const addUser0 = new Ev({type: 'insert', prevHash: ''}, users[0], '0x00');
  aggregate = await aggregate.add(addUser0);
  const addUser1 = new Ev({type: 'insert', prevHash: '0x00'}, users[1], '0x01');
  aggregate = await aggregate.add(addUser1);
  const modifyUser0 = new Ev({type: 'modify', prevHash: '0x01'}, {id: 0, name: 'Boo'}, '0x02');
  aggregate = await aggregate.add(modifyUser0);
  t.is(aggregate.table.find(x => x.id === 0).name, 'Boo');
  t.is(aggregate.table.find(x => x.id === 0).age, 42);
});

test('simple delete', async t => {
  let aggregate = new Aggregate('users', userDescription);
  const addUser0 = new Ev({type: 'insert', prevHash: ''}, users[0], '0x00');
  aggregate = await aggregate.add(addUser0);
  const addUser1 = new Ev({type: 'insert', prevHash: '0x00'}, users[1], '0x01');
  aggregate = await aggregate.add(addUser1);
  const deleteUser0 = new Ev({type: 'delete', prevHash: '0x01'}, 0, '0x02');
  aggregate = await aggregate.add(deleteUser0);
  t.is(aggregate.table.find(x => x.id === 0), undefined);
  t.is(aggregate.table.length, 1);
  const deleteUser1 = new Ev({type: 'delete', prevHash: '0x02'}, 1, '0x03');
  aggregate = await aggregate.add(deleteUser1);
  t.is(aggregate.table.find(x => x.id === 1), undefined);
  t.is(aggregate.table.length, 0);
});
