'use strict';
var app = angular.module('phonecatApp', ['mapComponent']);

app.controller('PhoneListCtrl', function ($scope, $element) {
  var drag,
      placeholder,
      targetPos,
      //позиция элемента для вставки   
  offsetY,
      children,
      $document = angular.element(document);

  $scope.wayPoints = [];

  $scope.modePath = true;

  //контролёр сам определит как вести себя если возникли проблемы с маршрутом
  $scope.$on("badRoute", function () {
    alert(123123);
    angular.element("#errorpanel").show();
  });

  $scope.keyDown = function ($event) {
    if ($event.keyCode != 13) return;
    $scope.wayPoints.push({ address: $event.target.value });
    $event.target.value = "";
  };

  $scope.remove = function (index, $event) {
    $scope.wayPoints.splice(index, 1);
    $event.stopPropagation();
  };

  $scope.mouseDown = function (e) {
    var rect;
    drag = e.target.tagName == "LI" ? angular.element(e.target) : angular.element(e.target).parent();
    rect = drag[0].getBoundingClientRect();

    if (placeholder) placeholder.remove();
    placeholder = angular.element(drag).clone();
    placeholder.css("opacity", 0);
    drag[0].parentNode.insertBefore(placeholder[0], drag[0]);

    drag.css({
      "position": "absolute",
      "left": rect.left + "px",
      "top": rect.top + "px",
      "width": rect.width + "px",
      "height": rect.height + "px",
      "z-index": 1,
      "cursor": "move"
    });

    drag.css("user-select", "none");
    offsetY = rect.top - e.clientY;

    children = getChildren(drag);
    $element.on("mousemove", onMouseMove);
    $document.on("mouseup", onMouseUp);
  };

  function onMouseUp(e) {
    $element.off("mousemove", onMouseMove);
    $document.off("mouseup", onMouseUp);
    if (!drag) return;

    drag.css({
      "position": "relative",
      "left": 0,
      "top": 0,
      "height": "",
      "width": "",
      "z-index": "",
      "cursor": "auto"
    });

    placeholder.remove();
    $scope.$apply(function () {
      var srcPos = Number(drag.attr("index")),
          removePos = srcPos > targetPos ? srcPos + 1 : srcPos;
      $scope.wayPoints.splice(targetPos, 0, $scope.wayPoints[srcPos]);
      $scope.wayPoints.splice(removePos, 1);
    });

    placeholder = null;
    drag = null;
  };

  function onMouseMove(e) {
    var posY = e.clientY,
        //drag.position().top+drag.height()/2,
    target = children.find(function (el) {
      return el.rect.top < posY && el.rect.top + el.rect.height > posY;
    }),
        i = children.length - 1,
        el;

    drag.css("top", e.clientY + offsetY + "px");

    if (!target || target.el == placeholder[0]) return;

    if (target.rect.top + target.rect.height / 2 < e.clientY) {
      target.el.parentNode.insertBefore(placeholder[0], target.el);
      targetPos = Number(target.el.getAttribute("index"));
    } else {
      target.el.nextSibling.parentNode.insertBefore(placeholder[0], target.el.nextSibling);
      targetPos = Number(target.el.getAttribute("index")) + 1;
    }

    children = getChildren(drag); //массив children обновляется лишь тогда когда имело место перестановка
  };

  function getChildren(drag) {
    var arr = [],
        children = $element.find("ul").children("li");

    for (var i = 0; i < children.length; i++) {
      if (drag[0] !== children[i]) arr.push({
        el: children[i],
        rect: children[i].getBoundingClientRect()
      });
    }return arr;
  }
});
//# sourceMappingURL=map-controller.js.map