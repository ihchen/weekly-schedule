# IHC Weekly Schedule
Responsive JavaScript UI Component for displaying and editting a weekly schedule.

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
  startTime: 8,   // First time row (8 stands for 8:00 AM)
  endTime: 18,    // Last time row (18 stands for 6:00 PM)
  subDivision: 1, // Divisions between each hour
  minColWidth: 115, // Minimum width per column in pixels
  editable: false,  // Allow users to edit the schedule
  colors: {},       // Available colors in any CSS format. Color should be the value.
  onSave: function(valueState, colorState) {
    // Additional actions to take on save. (Can only save if editable: true).
  }
});
```

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
  onSave: function(valueState, colorState) {
    console.log(valueState, colorState);
  }
});
```
Parameters:
* valueState - 2d array containing each textual entry of the schedule
* colorState - 2d array containing each color name of the schedule

Undefined entries in each state array simply represents an empty value.

---

## Methods
*loadState(valueState, colorState)*

Replaces the current value and color states of the schedule with the given ones. Parameters must have at least the number
of rows in the schedule. Undefined can be used in either parameter if not desired to use.

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
ihc.loadState([
  ["test1"],
  [,"test2"],
  [,,"test3"]
], [
  [,,,,'color1'],
  [,,'color2'],
  [,'color1']
]);
```
