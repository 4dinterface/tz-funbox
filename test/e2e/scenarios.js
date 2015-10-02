'use strict';

describe('Demo App', function () {
  var input,
    points;

  function getAddress(wayPoints) {
    return wayPoints.map(function (elm) {
      return elm.getText();
    });
  }

  var moveIndexToIndex = function (startIndex, endIndex) {
    var items = element.all(by.css("ul > li")),
      el1 = items.get(startIndex),
      el2 = items.get(endIndex);

    browser.actions()
      .mouseMove(el1, {
        x: 10,
        y: 3
      })
      .mouseDown().mouseMove(el2, {
        x: 10,
        y: 3
      })
      .mouseUp()
      .perform();
  };


  beforeAll(function () {
    browser.get('app/index.html');
    input = element(by.id('address-input'));
    points = element.all(by.repeater('point in wayPoints').column('point.address'));
  });


  it('adding address 1', function () {
    input.sendKeys('Москва', protractor.Key.ENTER);
    input.getText().then(function (text) {
      expect(text).toEqual("")
    });

    expect(getAddress(points)).toEqual([
      "Москва"
    ]);
  });

  it('adding address 2', function () {
    input.sendKeys('Нижний новгород', protractor.Key.ENTER);
    input.getText().then(function (text) {
      expect(text).toEqual("")
    });

    expect(getAddress(points)).toEqual([
      "Москва",
      "Нижний новгород"
    ]);
  });

  it('adding address 3', function () {
    input.sendKeys('Новосибирск', protractor.Key.ENTER);
    input.getText().then(function (text) {
      expect(text).toEqual("")
    });

    expect(getAddress(points)).toEqual([
      "Москва",
      "Нижний новгород",
      "Новосибирск"
    ]);
  });


  it('dragdrop down', function () {
    moveIndexToIndex(0, 2);

    expect(getAddress(points)).toEqual([
      "Нижний новгород",
      "Новосибирск",
      "Москва"
    ]);
  });


  it('dragdrop up', function () {
    moveIndexToIndex(2, 0);

    expect(getAddress(points)).toEqual([
      "Нижний новгород",
      "Москва",
      "Новосибирск"
    ]);
  });


  it('remove item', function () {
    var el1 = element(by.css("ul > li:nth-child(2) > .btn-right"));
    el1.click();

    expect(getAddress(points)).toEqual([
      "Нижний новгород",
      "Новосибирск"
    ]);

  });

});