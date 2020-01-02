import Item from './Item';

function exists(id) {
  return 'undefined' !== typeof id && null !== id;
}

export default class ItemCollection {
  constructor() {
    this._items = [];
    this._nextId = 0;
  }

  set(values)  {
    this._items = values.map(data => new Item(data));
    for(const item of this._items) {
        item.id = exists(item.data.id) ?  item.data.id : this.generateId();
    }
  }

  generateId() {
    return `wal-id-${++this._nextId}`;
  }

  isSelected(index) {
    return this._items[index].selected;
  }

  select(index, isSelected=true) {
    this._items[index].selected = isSelected;
  }

  clampIndex(index) {
    if(index >= this._items.length)
      return this.lastIndex;
    if(index < 0)
      return 0;
    return index;
  }

  get lastIndex() {
    return this._items.length-1;
  }

  idForIndex(index) {
    return this._items[index].id;
  }

  [Symbol.iterator]() {
    return this._items[Symbol.iterator]();
  }
}
