# lovelace-grocy-meal-plan-card
 Meal Plan Card for Home Assistant Grocy integration
 
 Style barrowed from [Upcoming Media Card](https://github.com/custom-cards/upcoming-media-card)

<img src="https://github.com/firstof9/lovelace-grocy-meal-plan-card/raw/main/image.png" alt="Grocy Meal Plan Card">

### Card Config
This goes under `cards:` in your lovelace:
```yaml
  - type: custom:grocy-meal-plan-card
    entity: sensor.grocy_meal_plan
```

### Options
| Name | Type | Default | Description |
|:--:|:--:|:--:| :--: |
| entity | `string` | **Required** | entity id of meal sensor: ie: `sensor.grocy_meal_plan` |
| count | `integer` | `5` | Amount of meals to display at once |
| daily | `boolean` | `false` | Show the current day's plan(s) |
| section | `string` | `none` | Filter plans by Grocy `section` |
| custom_translation | string-list | **Optional** |  List of translations of string values used in the card (see below). |

## Advanced options
It is possible to translate the following English strings in the card to whatever you like.

```yaml
custom_translation:
  No meal plans found: "Keine Speisepläne gefunden"
```
