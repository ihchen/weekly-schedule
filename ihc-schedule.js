/**
 * Object that converts the given element into a weekly schedule.
 * Requires jQuery.
 * @param {String} elemID ID for element to become a schedule
 * @param {Object} options
 *    - startTime: first row in schedule (1-24)
 *    - endTime: last row in schedule (1-24)
 *    - subDivisions: divisions per hour (factor of 60)
 *    - minColWidth: minimum width of columns in pixels (integer)
 *    - editable: user can click on entry to edit it (boolean)
 *    - colors: color for open entry, closed entry, and neutral entry (css color)
 */
function IHCSchedule(elemID, options) {
  const DEFAULT_OPTIONS = {
    startTime: 8,
    endTime: 18,
    subDivisions: 1,
    minColWidth: 115,
    editable: false,
    colors: {},
    onSave: function(valueState, colorState) {},
  };
  const DAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];
  const POPUP_WIDTH = 112;

  var options = $.extend({}, DEFAULT_OPTIONS, options);
  var element = $("#"+elemID);
  var currOffset = 0;  // The leftmost day column (0 for Monday, 6 for Sunday);
  var currWidth;      // Current width of each column as percentage
  var numRows = (options.endTime - options.startTime + 1) * options.subDivisions;
  var numCols;        // Number of columns that can currently be displayed
  var poppedMenu = false;
  var valueState = {};
  var colorState = {};
  var editted = false;


  initialization(numRows);


  this.loadState = function(newValueState, newColorState) {
    valueState = newValueState;
    colorState = newColorState;

    for ( var key in newValueState ) {
      if ( newValueState.hasOwnProperty(key) ) {
        var vals = newValueState[key];

        for ( var i = 0; i < vals.length; i++ ) {
          if ( vals[i] ) {
            var id = key + "-" + i;
            var entry = $("#"+id);

            if ( entry.length ) {
              entry.html(vals[i]);
            }
          }
        }
      }
    }

    for ( var key in newColorState ) {
      if ( newColorState.hasOwnProperty(key) ) {
        var cols = newColorState[key];

        for ( var i = 0; i < cols.length; i++ ) {
          if ( cols[i] ) {
            var id = key + "-" + i;
            var entry = $("#"+id);

            if ( entry.length ) {
              entry.css('background-color', options.colors[cols[i]]);
            }
          }
        }
      }
    }
  }


  function resizeSchedule() {
    var scheduleWidth = element.width();
    numCols = Math.floor(scheduleWidth/options.minColWidth);

    // If parent of schedule can't fit full schedule
    if(numCols <= DAYS.length) {
      currWidth = (100/numCols);
      element.find('.column').css('min-width', currWidth+"%");
      element.find('.column').css('max-width', currWidth+"%");
      // Display and adjust directional buttons
      element.find('.dir-btn').css('display', 'block');

      changeOffset(currOffset);
    }
    else {
      numCols = DAYS.length + 1;
      element.find('.column').css('min-width', (100/(DAYS.length+1))+"%");
      element.find('.column').css('max-width', (100/(DAYS.length+1))+"%");
      element.find('.dir-btn').removeAttr('style');
      // reset offset
      currOffset = 0;
      element.find('.day-columns').css('left', '0');
    }
  }

  function changeOffset(offset) {
    var maxOffset = DAYS.length-numCols+1;
    var leftBtn = element.find('.left-btn');
    var rightBtn = element.find('.right-btn');

    if(offset < 0 || offset > maxOffset) {
      // Called from resizeSchedule
      if(currOffset == offset)
        offset = maxOffset;
      else
        return;
    }

    currOffset = offset;
    element.find('.day-columns').css('left', -(currOffset*currWidth)+"%");

    //Hide unnecessary buttons
    if(currOffset == 0) {
      leftBtn.css('display', 'none');
      rightBtn.css('display', 'block');
    }
    else if(currOffset == maxOffset) {
      rightBtn.css('display', 'none');
      leftBtn.css('display', 'block');
    }
    else {
      leftBtn.css('display', 'block');
      rightBtn.css('display', 'block');
    }
  }

  function openPopupMenu(elem, x, y) {
    var windowWidth = $(window).width();
    if(x + POPUP_WIDTH >= windowWidth)
      x = windowWidth - POPUP_WIDTH;

    var menu = `
      <div class="ihc-popup-menu" data-id="`+elem.attr('id')+`" style="width: `+POPUP_WIDTH+`px; left: `+x+`px; top: `+y+`px">
        <div class="edit">Edit</div>
        <hr />` +
          (function() {
            var colorBtns = ``;

            for(var prop in options.colors) {
              if(options.colors.hasOwnProperty(prop)) {
                colorBtns += `<div class="`+prop+
                `"><div style="background-color: `+options.colors[prop]+
                `"></div>`+(prop.charAt(0).toUpperCase() + prop.slice(1))+`</div>`;
              }
            }

            return colorBtns;
          })() + `
      </div>
    `;

    $('body').append(menu);
    poppedMenu = true;
  }

  function closePopupMenu() {
    $('.ihc-popup-menu').remove();
    poppedMenu = false;
  }

  // Only use on .entry.value elements
  function getTimeAndCol(entry) {
    var id = entry.attr('id');
    return id.split("-");
  }

  function changeTagName(elem, tag) {
    var attributes = ``;

    $.each(elem[0].attributes, function() {
      if(this.specified)
        attributes += this.name + `="` + this.value + `"`;
    });

    elem.replaceWith(`<` + tag + ` ` + attributes + `>` +
      (elem.val() ? elem.val() : elem.html()) +
      `</` + tag + `>`);
  }

  function initialization(numRows) {
    (function initHTML() {
      var times = [];

      // Create HTML
      var timeColumn = `
        <div class="column time-column">
          <div class="cell corner"></div>` +
            (function() {
              var timeEntries = ``;
              var hr;   // Will actually be hr - 1 to account for modding by 12
              var min;
              var time;

              for(var i = 0; i < numRows; i++) {
                hr = Math.floor(i/options.subDivisions) + (options.startTime - 1);
                min = (`0`+((60/options.subDivisions) * (i % options.subDivisions))).slice(-2);
                time = ((hr % 12) + 1) + `:` +
                      min + ` ` +
                      (hr >= 11 && hr <= 22 ? `PM` : `AM`);
                times.push(time);
                timeEntries += `<div class="cell time">` + time + `</div>`;
              }

              return timeEntries;
            })() +
          `</div>`;

      var dayColumns = `
        <div class="day-columns">` +
          (function() {
            var columns = ``;

            for(var i = 0; i < DAYS.length; i++) {
              columns += `<div class="column">` +
                (function() {
                  var dayEntries = `<div class="cell day">` + DAYS[i] + `</div>`;

                  for(var j = 0; j < numRows; j++) {
                    dayEntries += `<div id="` + times[j].replace(" ", "").replace(":", "_") + `-` + i + `" class="cell entry"></div>`;
                  }

                  return dayEntries;
                })() +
                `</div>`;
            }

            return columns;
          })() +
        `</div>`;

      var directionalButtons = `
        <div class="dir-btn left-btn">
            <div class="arrow-left"></div>
            <div class="arrow-head">❮</div>
        </div>
        <div class="dir-btn right-btn">
            <div class="arrow-right"></div>
            <div class="arrow-head">❯</div>
        </div>`;

      element.addClass("ihc-schedule");
      element.html(timeColumn + dayColumns + directionalButtons);
    })();

    // Resize and set event listeners
    resizeSchedule();
    if(typeof ResizeSensor != 'undefined') {
      new ResizeSensor(element, function() {
        resizeSchedule();
      });
    }
    else {
      $(window).on('resize', function() {
        resizeSchedule();
      });
    }

    // Set event listeners for directional buttons
    element.find('.left-btn').on('click', function() {
      changeOffset(currOffset-1);
    });
    element.find('.right-btn').on('click', function() {
      changeOffset(currOffset+1);
    });

    // Set swipe functionality
    if(typeof Hammer != 'undefined') {
      var mc = new Hammer(element[0]);

      mc.on("swipeleft", function() {
        changeOffset(currOffset+1);
      });
      mc.on("swiperight", function() {
        changeOffset(currOffset-1);
      });
    }

    // If editable, set event listeners to edit
    if(options.editable) {
      element.find('div.entry').addClass('editable');
      element.on('click', 'div.entry', function(e) {
        if(!poppedMenu) {
          e.stopPropagation();

          var x = e.pageX;
          var y = e.pageY;
          openPopupMenu($(this), x, y);
        }
      });

      $('html').on('click', function() {
        if(poppedMenu) {
          closePopupMenu();
        }
      });

      $('body').on('click', '.ihc-popup-menu > div',function(e) {
        e.stopPropagation();

        var elem = $("#"+$(this).closest('.ihc-popup-menu').attr('data-id'));

        if($(this).hasClass('edit')) {
          changeTagName(elem, 'textarea');

          if(!editted) {
            // Create save button
            element.find('.corner').html(`<button class="save-btn">Save</button>`);
            editted = true;
          }
        }
        else {
          var rc = getTimeAndCol(elem);
          var color = $(this).attr('class');

          if ( !colorState.hasOwnProperty(rc[0]) ) {
            colorState[rc[0]] = [];
          }
          colorState[rc[0]][rc[1]] = color;
          elem.css('background-color', options.colors[color]);
        }

        closePopupMenu();
      });

      element.on('click', '.save-btn', function() {
        var id, rc;

        element.find('textarea').each(function() {
          id = $(this).attr('id');
          rc = getTimeAndCol($(this));

          if ( !valueState.hasOwnProperty(rc[0]) ) {
            valueState[rc[0]] = [];
          }
          valueState[rc[0]][rc[1]] = $(this).val();
          changeTagName($(this), 'div');
        });

        element.find('.save-btn').remove();
        editted = false;

        options.onSave(valueState, colorState);
      });
    }
  }
}
