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

  translate(string) {
    if((this._config.custom_translation != null) &&
        (this._config.custom_translation[string] != null))
        {
           return this._config.custom_translation[string];
        }
    return string;
  }  

  render() {
    if (!this._config || !this.hass) {
      return html``;
    }

    this.numberElements = 0;
    this.recipelength = 300;
    if(this._config.recipeLength != null){
        this.recipelength = this._config.recipeLength;
    }
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
                ${this.translate("No meal plans found")}
              </div>
            </ha-card>            
            `;
    }

    const lang = this.hass.selectedLanguage || this.hass.language;
    const tz = this.hass.config.time_zone || "GMT";

    this.numberElements++;
    
    // Build meal plan array with filtering
    var newplan = this.buildPlan(meals, lang, tz);
    var newDiv = document.createElement('div');
    var innercontent = newplan.map((daily) => `
    <div class="meal">
        <div class="day">
            <div>
                <h1 class="card-header" style="Display: inline-block">${this.getDay(daily.day, lang, tz)} - ${this.getShortDay(daily.day, lang)}</h1>
                <p style="text-indent: 2em;display: inline-block; float: right;">${typeof daily.section !== 'undefined' && daily.section.name !== null
                ? daily.section.name
                : ""}
                </p>
            </div>
            <div>
                <div class=".info inline">
                    ${daily.type === 'note' 
                    ? daily.note 
                    : ""}
                    ${daily.type === 'recipe' 
                      ? typeof daily.recipe_name !== 'undefined' 
                        ? daily.recipe_name 
                        : typeof daily.recipe.name !== 'undefined' 
                          ? daily.recipe.name 
                        : ""
                      : ""}
                    ${daily.type === 'product' 
                      ? daily.type 
                      : ""}
                </div>
                ${ daily.picture_url !== null ? `<img class="pic" src="${daily.picture_url}"></img>` : ""}
            </div>
            ${!this._config.hideRecipe ?  
            `<div class=".info"> 
                ${daily.type === 'recipe' && typeof daily.recipe.description !== 'undefined' && daily.recipe.description !== null
                ?  `${ this.recipelength > 0 ? daily.recipe.description.substring(0,this.recipelength) : daily.recipe.description}`
                : ""}
            </div>`: "" }
        </div>
    </div>          
    `);
    innercontent.forEach(cont => { newDiv.innerHTML += cont;} );
    if (newplan.length > 0) {
      return newDiv;
    }
    else {
      return html`
      <ha-card>
        <div class="not-found">
          No meal plans for today.
        </div>
      </ha-card>            
      `;        
    }
  }

  _handleClick() {
    fireEvent(this, "hass-more-info", { entityId: this._config.entity });
  }

  getCardSize() {
    return 3;
  }

  buildPlan(meals, lang, tz) {
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = today.getMonth() + 1;
    var dd = today.getDate();
    dd <10 ? dd = '0' + dd : dd = dd
    mm < 10 ? mm = '0' + mm : mm = mm
    today = yyyy + '-' + mm + '-' + dd
    var newplan = [];
    if (this._config.daily)
    {
      meals.forEach(daily => {
        if (daily.day == today) {
          newplan.push(daily)
        }
      })
    } 
    else if (this._config.section) {
      meals.forEach(daily => {
        if (daily.section.name.toLowerCase() == this._config.section.toLowerCase()) {
          newplan.push(daily);
        }        
      })
    }
    else {
      meals.slice(0,this._config.count ? this._config.count : 5).map(daily => newplan.push(daily))
    }
    return newplan
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
            box-shadow: var(--ha-card-box-shadow,none);
            box-sizing: border-box;
            border-radius: var(--ha-card-border-radius,6px);
            border-width: var(--ha-card-border-width,1px);
            border-style: solid;
            border-color: var(--ha-card-border-color,var(--divider-color,#e0e0e0));        
            position: relative;
            padding: 0px 0.67em 0.67em 0.67em;
            background-color: var(--secondary-background-color,rgb(119 119 119 / 25%))
          }

          .day {
            width: 100%;
            margin: auto;
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
            color: var(--ha-card-header-color,--primary-text-color);
            font-family: var(--ha-card-header-font-family,inherit);
            font-size: var(--ha-card-header-font-size,24px);
            letter-spacing: -0.012em;
            line-height: 48px;
            padding: 12px 16px 16px;
            display: block;
            margin-block: 0px;
            font-weight: 400;
            #font-weight: 600;
            #font-size: 18px;
            #text-shadow: 1px 1px 3px rgba(0,0,0,0.9);
            #fill: #fff;              
          }

          .recipe_name {
            font-size: 14px;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.9);
            fill: #fff;              
          }

          .section {
            font-size: 14px;
            font-style: italic;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.9);
            fill: #fff;              
          }          
          .inline {
              display: inline-block;
          }
          
          .pic {
                width: 10em;
                float: right;
                display: inline-block;
                border-radius: var(--ha-card-border-radius,6px);
            }
          .dayname {
            text-transform: uppercase;
          }
        `;
  }
}
customElements.define("grocy-meal-plan-card", MealPlanCard);