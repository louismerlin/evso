// A Sevent is created when something happens
// id, aggregate_id, type, data (json), metadata (json), created_at
function Ev(metadata, data, hash) {
  this.metadata = metadata;
  this.data = data;
  this.hash = hash;
  this.createdAt = Date.now();
}

Ev.prototype.commit = async function (aggregate) {
  return aggregate.add(this);
};

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

Aggregate.prototype.add = async function (ev) {
  if (ev.metadata.prevHash === this.latestEv().hash) {
    this.evs = this.evs.concat(ev);
    if (ev.metadata.type === 'insert') {
      if (this.table[ev.data.id]) {
        throw new Error('Duplicate index');
      } else {
        this.table[ev.data.id] = ev.data;
      }
    // } else if (ev.metadata.type === 'delete') {
    // } else if (ev.metadata.type === 'modify') {
    // }  else if SPECIAL EVENT
    }
  } else {
    this.branches = this.branches.concat(ev);
  }
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
