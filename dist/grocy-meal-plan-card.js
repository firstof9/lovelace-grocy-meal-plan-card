const LitElement = customElements.get("hui-masonry-view")
  ? Object.getPrototypeOf(customElements.get("hui-masonry-view"))
  : Object.getPrototypeOf(customElements.get("hui-view"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

window.customCards = window.customCards || [];
window.customCards.push({
  type: "grocy-meal-plan-card",
  name: "Meal Plan",
  description: "A card to display your meal plan from Grocy.",
  preview: false,
});

const fireEvent = (node, type, detail, options) => {
  options = options || {};
  detail = detail === null || detail === undefined ? {} : detail;
  const event = new Event(type, {
    bubbles: options.bubbles === undefined ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === undefined ? true : options.composed,
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};

class MealPlanCard extends LitElement {
  static get properties() {
    return {
      _config: {},
      hass: {},
    };
  }
  setConfig(config) {
    if (!config.entity) {
      throw new Error("Please select the meal plan sensor");
    }
    this._config = config;
  }

  render() {
    if (!this._config || !this.hass) {
      return html``;
    }

    this.numberElements = 0;

    const stateObj = this.hass.states[this._config.entity];

    if (!stateObj) {
      return html`
            <style>
              .not-found {
                flex: 1;
                background-color: yellow;
                padding: 8px;
              }
            </style>
            <ha-card>
              <div class="not-found">
                Entity not available: ${this._config.entity}
              </div>
            </ha-card>
          `;
    }

    return html`
          <ha-card @click="${this._handleClick}">
            ${this.renderPlan(stateObj.attributes.meals)}
          </ha-card>
        `;
  }

  renderPlan(meals) {
    if (!meals || meals.length === 0) {
      return html`
            <ha-card>
              <div class="not-found">
                No meal plans found.
              </div>
            </ha-card>            
            `;
    }

    const lang = this.hass.selectedLanguage || this.hass.language;
    const tz = this.hass.config.time_zone || "GMT";

    this.numberElements++;
    return html`
            <div style="padding: 5px 10px;">
            ${meals
        .slice(0, 5)
        .map(
          (daily) => html`
                    <div class="meal" style="background: url('${daily.picture_url}') no-repeat 100% 0; background-size: contain">
                      <div class="day">
                      <svg class="svg_view" viewBox="0 0 200 100">
                        <text>
                        <tspan class="dayname view daytitle" x="0" dy="1em">
                          ${this.getDay(daily.day, lang, tz)}
                        </tspan>
                        <tspan class="recipe_name view" x="0" dy="1.3em">
                            ${this.getShortDay(daily.day, lang)}
                        </tspan>
                        <tspan class="recipe_name view" x="0" dy="1.3em">
                          ${daily.recipe_name}
                        </tspan>
                        ${daily.note !== null &&
              daily.note !== undefined
              ? html`
                              <tspan class="note view" x="0" dy="1.3em">
                                ${daily.note}
                              </tspan>
                            `
              : ""}
                        </text>
                        </svg>
                       </div>
                    `
        )}
            </div>                
        `;

  }

  _handleClick() {
    fireEvent(this, "hass-more-info", { entityId: this._config.entity });
  }

  getCardSize() {
    return 3;
  }

  getDay(theDate, lang, tz) {
    theDate = theDate.split('T')[0] + " 12:00"

    return new Date(theDate).toLocaleString(lang, {
      weekday: "short", timeZone: tz,
    })
  }

  getShortDay(theDate, lang) {
    theDate = theDate.split('T')[0] + " 12:00"

    return new Date(theDate).toLocaleString(lang, { dateStyle: "short" })
  }

  static get styles() {
    return css`
          ha-card {
            cursor: pointer;
            margin: auto;
            padding-top: 1.3em;
            padding-bottom: 1.3em;
            padding-left: 1em;
            padding-right: 1em;
            position: relative;
          }
    
          .meal {
            width: 100%;
            overflow: hidden;
            margin-left: auto;
            margin-right: auto;
            margin-bottom: 10px;
            background-repeat: no-repeat;
            background-size: auto 100%;
            box-shadow: 3px 2px 25px rgba(0,0,0,.8);
            position: relative;
          }

          .day {
            width: 100%;
            background: linear-gradient(to right, #000 48%,
                  transparent 80%,#000 100%);
            margin: auto;
            box-shadow: inset 0 0 0 3px #000;
            overflow: hidden;
          }

          .view {
            overflow: visible;
            width: 55%;
            margin-top: 1%;
            margin-left: 2.5%;
            alignment-baseline: text-after-edge;              
          }

          .svg_view {
            overflow: visible;
            width: 55%;
            margin-top: 1%;
            margin-left: 2.5%;
            alignment-baseline: text-after-edge;
          }

          .daytitle {
            font-weight: 600;
            font-size: 18px;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.9);
            fill: #fff;              
          }

          .recipe_name {
            font-size: 14px;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.9);
            fill: #fff;              
          }
    
          .dayname {
            text-transform: uppercase;
          }
        `;
  }
}
customElements.define("grocy-meal-plan-card", MealPlanCard);