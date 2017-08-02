describe("IHCSchedule", function() {

  beforeEach(function() {
    var fixture = '<div id="parent"><div id="ihc-schedule"></div></div>';
    document.body.insertAdjacentHTML('afterbegin', fixture);
  });

  afterEach(function() {
    document.body.removeChild(document.getElementById('parent'));
  });

  describe('initialization', function() {

    beforeEach(function() {
      IHCSchedule('ihc-schedule', {
        startTime: 8,
        endTime: 16,
        subDivisions: 3,
      });
    });

    describe('HTML', function() {

      it('should generate the correct times', function() {
        var times = $('.entry.time');
        expect(times[0].innerHTML).toBe('8:00 AM');
        expect(times[times.length-1].innerHTML).toBe('4:40 PM');
        expect(times[13].innerHTML).toBe('12:20 PM');
      });

      it('should generate the correct days', function() {
        var days = $('.entry.day');
        expect(days[0].innerHTML).toBe('Monday');
        expect(days[days.length-1].innerHTML).toBe('Sunday');
      });

      it('should generate the correct number of rows per column', function() {
        var timeColumn = $('.time-column');
        var firstDayColumn = $('.column').eq(1);
        expect(firstDayColumn.children().length).toBe(28);
        expect(timeColumn.children().length).toBe(firstDayColumn.children().length);
      });

      it('should generate correct number of columns', function() {
        var dayColumns = $('.day-columns');
        expect(dayColumns.children().length).toBe(7);
      });

      it('should have a buttons as children of schedule class', function() {
        var schedule = $('.ihc-schedule');
        expect(schedule.children().hasClass('dir-btn')).toBeTruthy();
      });
    });

    describe('resize', function() {

      it('should resize upon initializing', function() {
        var parentWidth = $('#parent').width();
        var columnWidth = parseFloat($('.column')[0].style.minWidth, 10);
        var checkVal;
        if(parentWidth < 920)
          checkVal = 100/Math.floor(parentWidth/115);
        else
          checkVal = 12.5;
        expect(columnWidth).toBeCloseTo(checkVal);
      });
    });
  });

  describe('resizeSchedule', function() {

    it('should resize properly based on parent width', function() {
      $('#parent').css('width', '400px');
      IHCSchedule('ihc-schedule');
      var colWidth = parseFloat($('.column').css('min-width'), 10);
      expect(colWidth).toBeCloseTo(33.3333);
    });

    it('should resize when parent resizes if ResizeSensor exists', function() {
      if(typeof ResizeSensor == 'undefined') {
        expect(true).toBeTruthy();
      }
      else {
        var parent = $('#parent');

        parent.css('width', '1000px');
        IHCSchedule('ihc-schedule');
        var oldColumnWidth = $('.column').width();

        parent.css('width', '500px');
        var newColumnWidth = $('.column').width();

        expect(oldColumnWidth).not.toBe(newColumnWidth);
      }
    });

    it('should display directional buttons if small enough', function() {
      $('#parent').css('width', '500px');
      IHCSchedule('ihc-schedule');
      expect($('.right-btn').css('display')).toBe('block');
    });

    it('should not display directional buttons if big enough', function() {
      $('#parent').css('width', '1500px');
      IHCSchedule('ihc-schedule');
      expect($('.dir-btn').css('display')).toBe('none');
    });

    // it('should update state accordingly', function() {
    //   var parent = $('#parent');
    //   parent.css('width', '880px');
    //   IHCSchedule('ihc-schedule');
    //   $('.right-btn').click();
    //
    //   parent.css('width', '1200px');
    //   expect($('.day-columns')[0].style.left).toBe('0%');
    // });
  });

  describe('changeState', function() {

    beforeEach(function() {
      $('#parent').css('width', '630px');
      IHCSchedule('ihc-schedule');
    });

    it('left-btn should not do anything when Monday is leftmost', function() {
      $('.left-btn').click();
      expect($('.day-columns')[0].style.left).toBe('0%');
    });

    it('right-btn should not do anything when Sunday is rightmost', function() {
      $('.right-btn').click();
      $('.right-btn').click();
      $('.right-btn').click();
      $('.right-btn').click();
      expect($('.day-columns')[0].style.left).toBe('-60%');
    });

    it('displays left-btn appropriately', function() {
      expect($('.left-btn').css('display')).toBe('none');
      $('.right-btn').click();
      expect($('.left-btn').css('display')).toBe('block');
      $('.left-btn').click();
      expect($('.left-btn').css('display')).toBe('none');
    });

    it('displays left-btn appropriately', function() {
      $('.right-btn').click();
      $('.right-btn').click();
      $('.right-btn').click();
      expect($('.right-btn').css('display')).toBe('none');
      $('.left-btn').click();
      expect($('.right-btn').css('display')).toBe('block');
      $('.right-btn').click();
      expect($('.right-btn').css('display')).toBe('none');
    });
  });
});
