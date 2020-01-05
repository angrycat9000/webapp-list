import { html, css, LitElement } from 'lit-element';


export default class WalItem extends LitElement {

  static get properties() {
    return  {
        focused: { type: Boolean},
        selected: {type: Boolean},
        label: { type: String }
    }
  }

  static get styles() {
    return [css`
        div.container {
            box-sizing: border-box;
            min-height: 3rem;
            border-top: var(--wal-seperator-border);
            display: flex;
            align-items: center;
            justify-content: stretch;
            padding: 0.25rem 0.5rem 0.5rem;
        }

        .label {
          flex: 1 1;
        }

        button {
          margin-left: 1rem;
        }
    `];
  }

  constructor() {
    super();
    this.onActivate = this.onActivate.bind(this);
    this.addEventListener('activate', this.onActivate);
    this.addEventListener('context-menu', this.onContextMenu);
  }

  render() {
    return html`
    <div class="container">
        <div class="label">${this.label}</div>
        <button @click=${this.onActionClicked} tab-index="-1">Action</button>
        <button @click=${this.onContextClicked}tab-index="-1">Context Menu</button>
    </div>`;
  }

  onActionClicked(event) {
      event.preventDefault();
      this.onActivate();
  }

  onActivate() {
      console.log(`activated "${this.label}"`);
  }

  onContextClicked(event) {
    event.preventDefault();
    this.onContextMenu();
  }

  onContextMenu() {
    console.log(`context menu "${this.label}"`)
  }
}