import { html, css, LitElement } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat.js';

import ItemCollection from './ItemCollection';

export class WebappList extends LitElement {
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
    this._items = new ItemCollection();
    this._focusIndex = 0;
  }


  set items(values) {
    this._items.set(values);
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
    index = this._items.clampIndex(index);
    const selected = !this._items.isSelected(index);
    this._items.select(index, selected);
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
    for(const item of this._items)
      item.selected = false;
    this._items.select(index, true);
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
      this._items.select(i, true);

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
    index = this._items.clampIndex(index);
    if(index === this._focusIndex)
      return;

    this._focusIndex = index;

    this.updateComplete.then(() => {
      const newTabStop = this.shadowRoot.querySelector(`[id="${this._items.idForIndex(index)}"]`);
      newTabStop.focus();
    });
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
              ${index}: ${item.data.label}
              <button>Action</button>
              <button>Action 2</button>
          </li>`
        )}
      </ul>
    `;
  }


}
