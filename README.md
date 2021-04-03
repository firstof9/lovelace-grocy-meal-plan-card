# lovelace-grocy-meal-plan-card
 Meal Plan Card for Home Assistant Grocy integration
 
 Style barrowed from [Upcoming Media Card](https://github.com/custom-cards/upcoming-media-card)

<img src="https://github.com/firstof9/lovelace-grocy-meal-plan-card/raw/main/image.png" alt="Grocy Meal Plan Card">

This goes under `cards:` in your lovelace:
```yaml
  - type: custom:grocy-meal-plan-card
    entity: sensor.grocy_meal_plan
```
