# IHC Weekly Schedule
Responsive jQuery UI Component for displaying and editting a weekly schedule.

Demo: 

## Usage
```html
<div id="scheduleHere"></div>
```
```javascript
IHCSchedule("scheduleHere");
```

## Options
```javascript
var schedule = new IHCSchedule("scheduleHere", {
  startDay: 'Monday', // Valid day name
  startTime: 8,   // First time row (8 stands for 8:00 AM)
  endTime: 18,    // Last time row (18 stands for 6:00 PM)
  subDivision: 1, // Divisions between each hour
  minColWidth: 115, // Minimum width per column in pixels
  editable: false,  // Allow users to edit the schedule
  colors: {},       // Available colors in any CSS format. Color should be the value.
  onSave: function(valueState, colorState) {
    // Additional actions to take on save. (Can only save if editable: true).
  },
  onEntryClick: null
});
```

---

#### `startDay` option
First day column to be shown. Must be a valid day (i.e. 'Sunday'). Default is 'Monday'.

---

#### `startTime` option
Time value of the first row. Must be between 1-24. 1 represents 1 AM, 24 represents 12 PM. 
Default is 8 (8 AM).

---

#### `endTime` option
Time value of the last hour. Must be between 1-24. Default is 18 (6 PM).

---

#### `subDivisions` option
Number of even sub divisions between each hour. For example, a value of 2 would include half hour marks. 
Must be a factor of 60. Default is 1.

---

#### `minColWidth` option
Minimum allowed width of each column in pixels. Default is 115.

---

#### `editable` option
Whether or not users can edit the schedule. Setting true means users can click on an entry and edit the textual value and
background color of the entry. Default is false.

---

#### `colors` option
An object containing colors and corresponding names. Colors can be anything recognized by CSS. Default is an empty object.
Example:
```javascript
IHCSchedule('scheduleHere', {
  colors: {
    open: '#C7FBCE',
    closed: 'rgb(186,186, 186)',
    neural: 'white'
  }
});
```
The color names are shown in the popup menu when `editable` is true. They are also used in the private colorState variable
to represent the colors used in the schedule (see the `onSave` option).

---

#### `onSave` option
A function that runs after the save button is clicked. Save button only shows if `editable` is true and an entry was editted.
Does nothing by default. Example:
```javascript
IHCSchedule('scheduleHere', {
  onSave: function(state) {
    console.log(state);
  }
});
```
Parameters:
* state - Object containing information in schedule

---

#### `onEntryClick` option
A function that overrides the default pop-up menu action when an entry is clicked. Requires `editable` option to be true. 

Parameters:
* elem - jQuery element representing the entry clicked
* state - Object containing schedule information
* colors - Colors object given in options

---

## Methods
**loadState(newState)**

Loads the given state into the schedule. Will not clear the schedule if it has been editted beforehand; therefore, recommended to be used on an empty schedule. If day and time given by the new state is not in the schedule, values will be ignored.

Example:
```javascript
var ihc = new IHCSchedule("scheduleHere", {
  startTime: 8,
  endTime: 10,
  colors: {
    color1: 'black',
    color2: 'white'
  }
});
ihc.loadState({
  'Monday': {
    '8_00AM': {
      'color': 'color1',
      'value': 'This is black'
    },
    '9_00AM': {
      'color': 'color2',
      'value': 'This is white'
    }
  }
});
```

## Dependencies
#### `jQuery`

## Optional Dependencies
#### `ResizeSensor`
Including [ResizeSensor](https://github.com/marcj/css-element-queries/blob/master/src/ResizeSensor.js) by marcj will allow
the schedule to resize when the parent resizes. If this plugin is not included, then the schedule will only resize when
the window resizes. Be sure to include the script before you initialize your schedules.

#### `Hammer`
Including [Hammer](http://hammerjs.github.io/) will allow for swipe functionality making the schedule more mobile friendly.
Remember to include the script before you intialize your schedules.
