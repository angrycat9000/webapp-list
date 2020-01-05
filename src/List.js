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
        --focus-color: darkorange;
        --focus-width: 4px;

        display: block;
        padding: 25px;
        width: 20rem;
        background: var(--wal-list-background);
      }

      ul {
        list-style: none;
      }

      li:focus {
        outline-color: var(--focus-color);
        outline-style: solid;
        outline-width: var(--focus-width);
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
      selectionMode: { type: String },
      _focusIndex: { type:Number, attribute:false }
    };
  }

  constructor() {
    super();
    this._items = [];
    this._focusIndex = 0;
    this._nextId = 0;
    this.selectionMode = 'single';
  }

  set data(values) {
    if(!Array.isArray(values))
      values = Array.from(values);
      
    this._items = values.map(data => new Item(data));
    for(const item of this._items) {
        item.id = exists(item.data.id) ?  item.data.id : `item-${++this._nextId}`;
    }
  }

  dataBinder(item) {
    return html`
    <wal-item 
      label=${item.data.label}
      ?focus=${item.focus}
      ?selected=${item.selected}></wal-item>`;
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
      case 'F10':
        if(event.shiftKey) {
          this.contextMenu(this._focusIndex);
          event.preventDefault();
        }
        break;
      case 'ContextMenu':
      case 'ArrowRight': 
        this.contextMenu(this._focusIndex);
        event.preventDefault();
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
        }
        break;
      case 'Enter':
        this.activate(this._focusIndex);
        break;
    }
  }

  activate(index) {
    const detail = {
      index: index,
      item: this._items[index]
    }
    const event = new CustomEvent('activate', { detail });
    this.shadowRoot.querySelector('ul').children[index].firstElementChild.dispatchEvent(event);
  }

  contextMenu(index) {
    const detail = {
      index: index,
      item: this._items[index]
    }
    const event = new CustomEvent('context-menu', { detail });
    this.shadowRoot.querySelector('ul').children[index].firstElementChild.dispatchEvent(event);
  }

  toggleSelection(index) {
    if('none' === this.selectionMode)
      return;

    index = this.clampIndex(index);
    const selected = !this._items[index].selected;
    this._items[index].selected = selected;
    if(selected)
      this._lastSelectedIndex = index;
    this.requestUpdate();
  }

  selectAll() {
    if('multiple' !== this.selectionMode)
      return;

    for(const item of this._items)
      item.selected = true;
    this.requestUpdate();
  }

  selectOne(index) {
    if('none' === this.selectionMode)
      return;

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
    if('none' === this.selectionMode)
      return;

    if('single' !== this.selectionMode)
      return this.selectOne(index);

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
    if(event.defaultPrevented)
      return;

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
      return this._items.length - 1;
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