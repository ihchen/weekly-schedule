'use strict';

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
  var DEFAULT_OPTIONS = {
    startTime: 8,
    endTime: 18,
    subDivisions: 1,
    minColWidth: 115,
    editable: false,
    colors: {},
    onSave: function onSave(valueState, colorState) {}
  };
  var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var POPUP_WIDTH = 112;

  var options = $.extend({}, DEFAULT_OPTIONS, options);
  var element = $("#" + elemID);
  var currOffset = 0; // The leftmost day column (0 for Monday, 6 for Sunday);
  var currWidth; // Current width of each column as percentage
  var numRows = (options.endTime - options.startTime + 1) * options.subDivisions;
  var numCols; // Number of columns that can currently be displayed
  var poppedMenu = false;
  var valueState = [];
  var colorState = [];
  var editted = false;

  initialization(numRows);

  this.loadState = function (newValueState, newColorState) {
    var currValueEntry, currColorEntry;

    for (var i = 0; i < numRows; i++) {
      for (var j = 0; j < DAYS.length; j++) {
        if (newValueState) {
          currValueEntry = newValueState[i][j];
          if (currValueEntry) {
            $("#" + i + "-" + j).html(currValueEntry);
            valueState[i][j] = currValueEntry;
          } else if (valueState[i][j]) valueState[i][j] = undefined;
        }

        if (newColorState) {
          currColorEntry = newColorState[i][j];
          if (currColorEntry) {
            $("#" + i + "-" + j).css('background-color', options.colors[currColorEntry]);
            colorState[i][j] = currColorEntry;
          } else if (colorState[i][j]) colorState[i][j] == undefined;
        }
      }
    }
  };

  function resizeSchedule() {
    var scheduleWidth = element.width();
    numCols = Math.floor(scheduleWidth / options.minColWidth);

    // If parent of schedule can't fit full schedule
    if (numCols <= DAYS.length) {
      currWidth = 100 / numCols;
      element.find('.column').css('min-width', currWidth + "%");
      element.find('.column').css('max-width', currWidth + "%");
      // Display and adjust directional buttons
      element.find('.dir-btn').css('display', 'block');

      changeOffset(currOffset);
    } else {
      numCols = DAYS.length + 1;
      element.find('.column').css('min-width', 100 / (DAYS.length + 1) + "%");
      element.find('.column').css('max-width', 100 / (DAYS.length + 1) + "%");
      element.find('.dir-btn').removeAttr('style');
      // reset offset
      currOffset = 0;
      element.find('.day-columns').css('left', '0');
    }
  }

  function changeOffset(offset) {
    var maxOffset = DAYS.length - numCols + 1;
    var leftBtn = element.find('.left-btn');
    var rightBtn = element.find('.right-btn');

    if (offset < 0 || offset > maxOffset) {
      // Called from resizeSchedule
      if (currOffset == offset) offset = maxOffset;else return;
    }

    currOffset = offset;
    element.find('.day-columns').css('left', -(currOffset * currWidth) + "%");

    //Hide unnecessary buttons
    if (currOffset == 0) {
      leftBtn.css('display', 'none');
      rightBtn.css('display', 'block');
    } else if (currOffset == maxOffset) {
      rightBtn.css('display', 'none');
      leftBtn.css('display', 'block');
    } else {
      leftBtn.css('display', 'block');
      rightBtn.css('display', 'block');
    }
  }

  function openPopupMenu(elem, x, y) {
    var windowWidth = $(window).width();
    if (x + POPUP_WIDTH >= windowWidth) x = windowWidth - POPUP_WIDTH;

    var menu = '\n      <div class="ihc-popup-menu" data-id="' + elem.attr('id') + '" style="width: ' + POPUP_WIDTH + 'px; left: ' + x + 'px; top: ' + y + 'px">\n        <div class="edit">Edit</div>\n        <hr />' + function () {
      var colorBtns = '';

      for (var prop in options.colors) {
        if (options.colors.hasOwnProperty(prop)) {
          colorBtns += '<div class="' + prop + '"><div style="background-color: ' + options.colors[prop] + '"></div>' + (prop.charAt(0).toUpperCase() + prop.slice(1)) + '</div>';
        }
      }

      return colorBtns;
    }() + '\n      </div>\n    ';

    $('body').append(menu);
    poppedMenu = true;
  }

  function closePopupMenu() {
    $('.ihc-popup-menu').remove();
    poppedMenu = false;
  }

  // Only use on .entry.value elements
  function getRowCol(entry) {
    var id = entry.attr('id');
    return [parseInt(id[0], 10), parseInt(id[2], 10)];
  }

  function changeTagName(elem, tag) {
    var attributes = '';

    $.each(elem[0].attributes, function () {
      if (this.specified) attributes += this.name + '="' + this.value + '"';
    });

    elem.replaceWith('<' + tag + ' ' + attributes + '>' + (elem.val() ? elem.val() : elem.html()) + '</' + tag + '>');
  }

  function initialization(numRows) {
    (function initHTML() {
      // Create HTML
      var timeColumn = '\n        <div class="column time-column">\n          <div class="cell corner"></div>' + function () {
        var timeEntries = '';
        var hr; // Will actually be hr - 1 to account for modding by 12
        var min;

        for (var i = 0; i < numRows; i++) {
          hr = Math.floor(i / options.subDivisions) + (options.startTime - 1);
          min = ('0' + 60 / options.subDivisions * (i % options.subDivisions)).slice(-2);
          timeEntries += '<div class="cell time">' + (hr % 12 + 1) + ':' + min + ' ' + (hr >= 11 && hr <= 22 ? 'PM' : 'AM') + '</div>';
        }

        return timeEntries;
      }() + '</div>';

      var dayColumns = '\n        <div class="day-columns">' + function () {
        var columns = '';

        for (var i = 0; i < DAYS.length; i++) {
          columns += '<div class="column">' + function () {
            var dayEntries = '<div class="cell day">' + DAYS[i] + '</div>';

            for (var j = 0; j < numRows; j++) {
              dayEntries += '<div id="' + j + '-' + i + '" class="cell entry"></div>';
            }

            return dayEntries;
          }() + '</div>';
        }

        return columns;
      }() + '</div>';

      var directionalButtons = '\n        <div class="dir-btn left-btn">\n            <div class="arrow-left"></div>\n            <div class="arrow-head">\u276E</div>\n        </div>\n        <div class="dir-btn right-btn">\n            <div class="arrow-right"></div>\n            <div class="arrow-head">\u276F</div>\n        </div>';

      element.addClass("ihc-schedule");
      element.html(timeColumn + dayColumns + directionalButtons);
    })();

    // Set up states
    for (var i = 0; i < numRows; i++) {
      valueState.push([]);
      colorState.push([]);
    }

    // Resize and set event listeners
    resizeSchedule();
    if (typeof ResizeSensor != 'undefined') {
      new ResizeSensor(element, function () {
        resizeSchedule();
      });
    } else {
      $(window).on('resize', function () {
        resizeSchedule();
      });
    }

    // Set event listeners for directional buttons
    element.find('.left-btn').on('click', function () {
      changeOffset(currOffset - 1);
    });
    element.find('.right-btn').on('click', function () {
      changeOffset(currOffset + 1);
    });

    // Set swipe functionality
    if (typeof Hammer != 'undefined') {
      var mc = new Hammer(element[0]);

      mc.on("swipeleft", function () {
        changeOffset(currOffset + 1);
      });
      mc.on("swiperight", function () {
        changeOffset(currOffset - 1);
      });
    }

    // If editable, set event listeners to edit
    if (options.editable) {
      element.find('div.entry').addClass('editable');
      element.on('click', 'div.entry', function (e) {
        if (!poppedMenu) {
          e.stopPropagation();

          var x = e.pageX;
          var y = e.pageY;
          openPopupMenu($(this), x, y);
        }
      });

      $('html').on('click', function () {
        if (poppedMenu) {
          closePopupMenu();
        }
      });

      $('body').on('click', '.ihc-popup-menu > div', function (e) {
        e.stopPropagation();

        var elem = $("#" + $(this).closest('.ihc-popup-menu').attr('data-id'));

        if ($(this).hasClass('edit')) {
          changeTagName(elem, 'textarea');

          if (!editted) {
            // Create save button
            element.find('.corner').html('<button class="save-btn">Save</button>');
            editted = true;
          }
        } else {
          var rc = getRowCol(elem);
          var color = $(this).attr('class');

          colorState[rc[0]][rc[1]] = color;
          elem.css('background-color', options.colors[color]);
        }

        closePopupMenu();
      });

      element.on('click', '.save-btn', function () {
        var id, rc;

        element.find('textarea').each(function () {
          id = $(this).attr('id');
          rc = getRowCol($(this));

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