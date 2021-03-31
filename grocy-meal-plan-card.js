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
            <div class="meal clear ${this.numberElements > 1 ? "spacer" : ""}">
            ${meals
                .slice(0, 5)
                .map(
                    (daily) => html`
                      <div class="day">
                        <div class="dayname">
                          ${this.getDay(daily.day, lang, tz)}
                        </div>
                        <i
                          class="image"
                          style="background: url('${daily.picture_url}') no-repeat 100% 0; 
                          background-size: contain"
                        ></i
                        ><br />
                        <span class="recipe_name">
                          ${daily.recipe_name}
                        </span>
                        ${daily.note !== null &&
                            daily.note !== undefined
                            ? html`
                              <div class="note">
                                ${daily.note}
                              </div>
                            `
                            : ""}
                       </div>
                    `
                )}                
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
    
          .spacer {
            padding-top: 1em;
          }
    
          .clear {
            clear: both;
          }
    
          .meal {
            width: 100%;
            margin: 0 auto;
            display: flex;
          }
    
          .day {
            flex: 1;
            display: block;
            text-align: center;
            color: var(--primary-text-color);
            border-right: 0.1em solid #d9d9d9;
            line-height: 2;
            box-sizing: border-box;
          }
    
          .dayname {
            text-transform: uppercase;
          }
    
          .image {
              overflow: hidden;
          }
        `;
    }
}
customElements.define("grocy-meal-plan-card", MealPlanCard);