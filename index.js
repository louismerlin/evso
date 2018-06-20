// A Sevent is created when something happens
// id, aggregate_id, type, data (json), metadata (json), created_at
function Ev(metadata, data, hash) {
  this.metadata = metadata;
  this.data = data;
  this.hash = hash;
  this.createdAt = Date.now();
}

// An Aggregate has a Sevents table associated to it
function Aggregate(name) {
  this.name = name;
  this.evs = [{hash: ''}];
  this.branches = [];
  this.table = [];
}

Aggregate.prototype.latestEv = function () {
  return this.evs[this.evs.length - 1];
};

Aggregate.prototype.clone = function () {
  const agg = new Aggregate(this.name);
  agg.evs = this.evs;
  agg.branches = this.branches;
  agg.table = this.table;
  return agg;
};

Aggregate.prototype.add = async function (ev) {
  const latestHash = this.latestEv().hash;
  if (ev.metadata.prevHash === latestHash || ev.metadata.catchUp === latestHash) {
    this.evs = this.evs.concat(ev);
    if (ev.metadata.type === 'insert') {
      if (this.table[ev.data.id]) {
        throw new Error('Duplicate index');
      } else {
        this.table[ev.data.id] = ev.data;
        return this.clone();
      }
    } else if (ev.metadata.type === 'catchUp') {
      this.table = ev.data;
      return this.reverseAdd(ev.hash);
    }
    // } else if (ev.metadata.type === 'delete') {
    // } else if (ev.metadata.type === 'modify') {
    // } else if (ev.metadata.type === 'merge') {
    // }  else if SPECIAL EVENT
  } else {
    this.branches = this.branches.concat(ev);
    return this.clone();
  }
};

Aggregate.prototype.reverseAdd = async function (hash) {
  const toBeAdded = ev => ev.metadata.prevHash === hash || ev.metadata.catchUp === hash;
  const toAdd = this.branches.filter(toBeAdded);
  toAdd.forEach(async ev => {
    await this.add(ev);
    await this.reverseAdd(ev.hash);
  });
  this.branches = this.branches.filter(ev => !toBeAdded(ev));
  return this.clone();
};

// Reactors react to certain events
function Reactor() {

}

Reactor.prototype.call = () => {

};

// Dispatchers connect Reactors to Evs
function Dispatcher() {

}

Dispatcher.prototype.add = () => {

};

// A calculator keeps track of some global state
function Calculator() {

}

const Evso = {
  Ev,
  Dispatcher,
  Aggregate,
  Calculator
};

module.exports = Evso;
