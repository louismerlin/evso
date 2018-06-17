// A Sevent is created when something happens
// id, aggregate_id, type, data (json), metadata (json), created_at
function Sevent(metadata, data, hash) {
  this.metadata = metadata;
  this.data = data;
  this.hash = hash;
  this.createdAt = Date.now();
}

Sevent.prototype.commit = async function (aggregate) {
  return aggregate.add(this);
};

// An Aggregate has a Sevents table associated to it
function Aggregate(name) {
  this.name = name;
  this.sevents = [{hash: ''}];
  this.branches = [];
  this.table = [];
}

Aggregate.prototype.latestSevent = function () {
  return this.sevents[this.sevents.length - 1];
};

Aggregate.prototype.add = async function (sevent) {
  if (sevent.metadata.prevHash === this.latestSevent().hash) {
    this.sevents = this.sevents.concat(sevent);
    if (sevent.metadata.type === 'insert') {
      if (this.table[sevent.data.id]) {
        throw new Error('Duplicate index');
      } else {
        this.table[sevent.data.id] = sevent.data;
      }
    // } else if (sevent.metadata.type === 'delete') {
    // } else if (sevent.metadata.type === 'modify') {
    // }  else if SPECIAL EVENT
    }
  } else {
    this.branches = this.branches.concat(sevent);
  }
};

// Reactors react to certain events
function Reactor() {

}

Reactor.prototype.call = () => {

};

// Dispatchers connect Reactors to Sevents
function Dispatcher() {

}

Dispatcher.prototype.add = () => {

};

// A calculator keeps track of some global state
function Calculator() {

}

const Sevents = {
  Sevent,
  Dispatcher,
  Aggregate,
  Calculator
};

module.exports = Sevents;
