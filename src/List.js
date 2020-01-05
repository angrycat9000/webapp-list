import { html, css, LitElement } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat.js';

import Item from './Item';

export default class List extends LitElement {
  static get styles() {
    return css`
      :host {
        --wal-seperator-border: 1px solid black;
        --wal-list-background: #ffffff;
        --wal-hover-background: #aaffaa;
        --wal-selected-background: #8080ff;

        display: block;
        padding: 25px;
        width: 20rem;
        background: var(--wal-list-background);
      }

      ul {
        list-style: none;
      }

      li {
        box-sizing: border-box;
        min-height: 3rem;
        border-top: var(--wal-seperator-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.25rem 0.5rem 0.5rem;
      }

      li:hover {
        background: var(--wal-hover-background);
      }

      li:last-child {
        border-bottom: var(--wal-seperator-border);
      }

      li[aria-selected="true"] {
        background: var(--wal-selected-background);
      }
    `;
  }

  static get properties() {
    return {
      _focusIndex: { type:Number, attribute:false }
    };
  }

  constructor() {
    super();
    this._items = [];
    this._focusIndex = 0;
    this._nextId = 0;
  }

  set data(values) {
    if(!Array.isArray(values))
      values = Array.from(values);
      
    this._items = values.map(data => new Item(data));
    for(const item of this._items) {
        item.id = exists(item.data.id) ?  item.data.id : `item-${++this._nextId}`;
    }
  }

  dataBinder(item, index) {
    return html`
    ${index}: ${item.data.label}
    <button>Action</button>
    <button>Action 2</button>`;
  }

  onKeyDown(event) {
    switch(event.key) {
      case 'ArrowDown':
        if(event.shiftKey)
          this.toggleSelection(this._focusIndex + 1);
        this.setFocusOn(this._focusIndex + 1);
        break;
      case 'ArrowUp': 
        if(event.shiftKey)
          this.toggleSelection(this._focusIndex - 1);
        this.setFocusOn(this._focusIndex - 1);
        break;
      case 'Home':
        if(event.ctrlKey && event.shiftKey)
          this.extendSelectionTo(0);
        break;
      case 'End':
        if(event.ctrlKey && event.shiftKey)
          this.extendSelectionTo(this._items.lastIndex);
        break;
      case /*Space*/ ' ' : 
        if(event.shiftKey)
          this.extendSelectionTo(this._focusIndex);
        else
          this.toggleSelection(this._focusIndex);
        break;
      case 'a':
      case 'A':
        if(event.ctrlKey) {
          this.selectAll();
          event.preventDefault();
          break;
        }
    }
  }

  toggleSelection(index) {
    index = this.clampIndex(index);
    const selected = !this._items[index].selected;
    this._items[index].selected = selected;
    if(selected)
      this._lastSelectedIndex = index;
    this.requestUpdate();
  }

  selectAll() {
    for(const item of this._items)
      item.selected = true;
    this.requestUpdate();
  }

  selectOne(index) {
    index = this.clampIndex(index);
    for(const item of this._items)
      item.selected = false;

    this._items[index].selected = true;
    this._lastSelectedIndex = index;
    this.requestUpdate();
  }

  /** 
   * Selects of the items between index and the last
   * selected index.
   */
  extendSelectionTo(index) {
    let start, end;
    if(index < this._lastSelectedIndex) {
      start = index;
      end = this._lastSelectedIndex;
    } else {
      start = this._lastSelectedIndex + 1;
      end = index + 1;
    }

    for(let i = start; i < end; i++)
      this._items[i].selected = true;

    this._lastSelectedIndex = index;
    this.requestUpdate();
  }

  onItemClick(event) {
    let index = event.currentTarget.getAttribute('data-index');
    index = Number.parseInt(index);

    if(event.ctrlKey) {
      this.toggleSelection(index);
    } else if(event.shiftKey) {
      this.extendSelectionTo(index);
      document.getSelection().removeAllRanges();
    } else {
      this.selectOne(index);
    }

    this._lastSelectedIndex = index;
    this.setFocusOn(index);
  }

  setFocusOn(index) {
    index = this.clampIndex(index);
    if(index === this._focusIndex)
      return;

    this._items[this._focusIndex].focused = false;
    this._items[index].focused = true;
    this._focusIndex = index;

    this.updateComplete.then(() => {
      const newTabStop = this.shadowRoot.querySelector(`[id="${this._items[index].id}"]`);
      newTabStop.focus();
    });
  }

  clampIndex(index) {
    if(index >= this._items.length)
      return this.lastIndex;
    if(index < 0)
      return 0;
    return index;
  }

  render() {
    return html`
      <ul @keydown=${this.onKeyDown}>
        ${repeat(this._items, (item) => item.id, (item, index) => html`
          <li
            @click=${this.onItemClick}
            tabindex=${index === this._focusIndex ? '0' : '-1'}
            data-index="${index}"
            id=${item.id}
            aria-selected="${item.selected}">
            ${this.dataBinder(item, index)}
          </li>`
        )}
      </ul>
    `;
  }
}

function exists(id) {
  return 'undefined' !== typeof id && null !== id;
}