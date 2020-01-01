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
    };
  }

  constructor() {
    super();
    this._items = new ItemCollection();
    //this.onKeyPress = this.onKeyPress.bind(this);
  }

  set items(values) {
    this._items.set(values);
  }


  onKeyDown(event) {
    switch(event.key) {
      case 'ArrowDown':
        this.setFocusOn(this._items.focusIndex + 1);
        break;
      case 'ArrowUp': 
        this.setFocusOn(this._items.focusIndex - 1);
        break;
      case /*Space*/ ' ' : {
          const index = this._items.focusIndex;
          this.toggleSelection(index);
          break;
        }
    }
  }

  toggleSelection(index) {
    const selected = this._items.isSelected(index);
    this._items.select(index, !selected);
    this.requestUpdate();
  }

  selectOne(index) {
    for(const item of this._items)
      item.selected = false;
    this._items.select(index, true);
    this.requestUpdate();
  }

  onItemClick(event) {
    const index = event.currentTarget.getAttribute('data-index');

    if(event.ctrlKey) {
      this.toggleSelection(index);
    } else {
      this.selectOne(index);
    }

    this.requestUpdate();
  }

  setFocusOn(index) {
    if(index === this._items.focusIndex)
      return;

    this._items.focusIndex = index;
    index = this._items.focusIndex;

    const tabStop = this.shadowRoot.querySelectorAll('[tabindex="0"]');
    for(const t of tabStop)
      t.setAttribute('tabindex', '-1');

    const newTabStop = this.shadowRoot.querySelector(`[id="${this._items.idForIndex(index)}"]`);
    newTabStop.setAttribute('tabindex', '0');
    newTabStop.focus();
  }

  render() {
    return html`
      <h2>${this.title}</h2>
      <ul @keydown=${this.onKeyDown}>
        ${repeat(this._items, (item) => item.id, (item, index) => html`
          <li
            @click=${this.onItemClick}
            tabindex=${index === this._items.focusIndex ? '0' : '-1'}
            ?inert=${index !== this._items.focusIndex ? '0' : '-1'}
            data-index="${index}"
            id=${item.id}
            aria-selected="${item.selected}">
              ${index}: ${item.data.label}
              <button>Action</button>
          </li>`
        )}
      </ul>
    `;
  }


}
