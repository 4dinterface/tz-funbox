"use strict";

/**
 * @ngdoc directive
 * @name mapComponent
 *
 * @description
 * карта и путь
 *
 * @element DIV
 * @priority 0
 * @param {array} wayPoints 
 * @param {array} center
 */

var _bind = Function.prototype.bind;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MapComponent = (function () {
  function MapComponent() {
    _classCallCheck(this, MapComponent);

    MapComponent.idCount = MapComponent.idCount || 0;

    this.scope = {
      wayPoints: "=",
      center: "="
    };

    this.onDragEndWayPoint = this.onDragEndWayPoint.bind(this);
  }

  /**
   * системный callback 
   * @param $scope
   * @param element
   * @param attr   
   */

  _createClass(MapComponent, [{
    key: "link",
    value: function link($scope, element, attr) {
      this.$scope = $scope;

      //default value
      this.$scope.center = this.$scope.center || [55.56, 37.76];

      //сгенерируем id если он не указан в шаблоне
      this.id = attr.id || "map-component-" + MapComponent.idCount++;
      if (!attr.id) {
        element.attr("id", this.id);
        element[0].setAttribute("id", this.id); //сработает синхронно, в отличии от element.attr срабатывающегот асинхронно      
      }

      ymaps.ready(this.onYandexMapReady.bind(this)); //инициализируем карту          
    }

    /**
     * обработик события готовности yandex map 
     */
  }, {
    key: "onYandexMapReady",
    value: function onYandexMapReady() {
      //create map
      this.map = new ymaps.Map(this.id, {
        center: this.$scope.center,
        zoom: 7
      });

      //create point collection
      this.collection = new ymaps.GeoObjectCollection({}, {
        draggable: true // обьекты можно перемещать
      });

      this.map.geoObjects.add(this.collection);
      this.$scope.$watch("wayPoints", this.update.bind(this), true);

      //set center
      this.$scope.$watch("center", this.onChangeCenter.bind(this));
      this.map.events.add('boundschange', this.onBoundChange.bind(this));
    }

    /**
     * обработчик изменения center в ысщзу
     * позволяет устанавливать центр из вне
     */
  }, {
    key: "onChangeCenter",
    value: function onChangeCenter() {
      if (this.boundChange) return this.boundChange = false;
      this.map.setCenter(this.$scope.center);
    }

    /**
     * обработчик перемещения карты
     * устанавливает центр в scope
     */
  }, {
    key: "onBoundChange",
    value: function onBoundChange(e) {
      var _this = this;

      var newCenter = e.originalEvent.newCenter;
      this.$scope.$apply(function () {
        _this.boundChange = true;
        _this.$scope.center[0] = newCenter[0];
        _this.$scope.center[1] = newCenter[1];
      });
    }

    /**
     * обработик события dragend на placeholder
     */
  }, {
    key: "onDragEndWayPoint",
    value: function onDragEndWayPoint(e) {
      var _this2 = this;

      var target = e.originalEvent.target,
          index = this.collection.indexOf(target),
          coordinates = target.geometry.getCoordinates();

      this.$scope.$apply(function () {
        _this2.$scope.wayPoints[index].coordinates = coordinates;
      });
    }

    /**
     * обновляет карту
     * @param actual - waayPoints после изменения
     * @param old - waayPoints после изменения   
     * @returns {MapComponent}
     */
  }, {
    key: "update",
    value: function update(actual, old) {
      var _this3 = this;

      //установим координаты новым точкам
      this.$scope.wayPoints.forEach(function (wayPoint) {
        wayPoint.coordinates = wayPoint.coordinates || _this3.$scope.center.slice(0);
      });
      this.render();
    }

    /**
     * перерисовывает геообьекты   
     */
  }, {
    key: "render",
    value: function render() {
      var coordinates = this.$scope.wayPoints.map(function (item) {
        return item.coordinates;
      });

      if (this.polyline) this.map.geoObjects.remove(this.polyline);
      if (this.collection) this.collection.removeAll();

      this.renderPoints(this.$scope.wayPoints);
      this.renderPolyline(coordinates);
    }

    /**
     * отрисовывает все точки
     * @param wayPoints - массмив точек
     */
  }, {
    key: "renderPoints",
    value: function renderPoints(wayPoints) {
      for (var i = 0; i < wayPoints.length; i++) {
        var placeMark = new ymaps.Placemark(wayPoints[i].coordinates, {
          balloonContent: wayPoints[i].address,
          iconContent: i + 1
        });

        placeMark.events.add("dragend", this.onDragEndWayPoint);
        this.collection.add(placeMark);
      }
    }

    /**
     * отрисовывает ломаные
     * @param coordinates - массив точек
     */
  }, {
    key: "renderPolyline",
    value: function renderPolyline(coordinates) {
      this.polyline = new ymaps.Polyline(coordinates);
      this.polyline.options.set({
        strokeColor: '#0000FF',
        strokeWidth: 3,
        opacity: 0.5
      });
      this.map.geoObjects.add(this.polyline);
    }

    /**
     * Фабрика компонента
     * @param ...args - зависимости
     * @returns {MapComponent}
     */
  }], [{
    key: "factory",
    value: function factory() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var instance = new (_bind.apply(MapComponent, [null].concat(args)))();
      instance.link = MapComponent.prototype.link ? MapComponent.prototype.link.bind(instance) : instance.link;
      return instance;
    }
  }]);

  return MapComponent;
})();

MapComponent.factory.$inject = [];
angular.module("mapComponent", []).directive("mapComponent", MapComponent.factory);
//# sourceMappingURL=map-component.js.map