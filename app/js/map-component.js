"use strict";

var _bind = Function.prototype.bind;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MapComponent = (function () {
  function MapComponent() {
    _classCallCheck(this, MapComponent);

    MapComponent.idCount = MapComponent.idCount || 0;

    this.scope = {
      wayPoints: "=",
      modePath: "="
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
        center: [55.56, 37.76],
        zoom: 7
      });

      //create point collection
      this.collection = new ymaps.GeoObjectCollection({}, {
        draggable: true // и их можно перемещать
      });
      this.map.geoObjects.add(this.collection);

      this.$scope.$watch("wayPoints", this.update.bind(this), true);
      this.$scope.$watch("modePath", this.render.bind(this));
    }

    /**
     * обработик события dragend на placeholder
     */
  }, {
    key: "onDragEndWayPoint",
    value: function onDragEndWayPoint(e) {
      var _this = this;

      var target = e.originalEvent.target,
          pos = this.collection.indexOf(target),
          coordinates = target.geometry.getCoordinates();

      ymaps.geocode(coordinates, {
        results: 1
      }).then(function (res) {
        var obj = res.geoObjects.get(0),
            detail = obj.properties.get('metaDataProperty').GeocoderMetaData;

        _this.$scope.$apply(function () {
          _this.$scope.wayPoints[pos].coordinates = coordinates;
          _this.$scope.wayPoints[pos].address = detail.text;
        });
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
      var _this2 = this;

      if (old && actual.length > old.length) {
        ymaps.geocode(actual[actual.length - 1].address, {
          results: 1
        }).then(function (res) {
          if (!res || !res.geoObjects.get(0)) return;
          var coord = res.geoObjects.get(0).geometry.getCoordinates();

          _this2.$scope.$apply(function () {
            _this2.map.setCenter(coord);
            actual[actual.length - 1].coordinates = coord;
            actual[actual.length - 1].goodAddress = true;
          });
        });
      } else {
        this.render(actual);
      }
    }

    /**
     * перерисовывает геообьекты   
     */
  }, {
    key: "render",
    value: function render() {
      var wayPoints = this.$scope.wayPoints.filter(function (point) {
        return point.coordinates;
      }),
          coordinates = wayPoints.map(function (item) {
        return item.coordinates;
      });

      if (this.polyline) this.map.geoObjects.remove(this.polyline);
      if (this.path) this.map.geoObjects.remove(this.path);
      if (this.collection) this.collection.removeAll();

      this.renderPoints(wayPoints);

      //путь или линия рисуются только в случае если все точки найдены
      if (this.$scope.wayPoints.length == wayPoints.length) {
        if (this.$scope.modePath) this.renderRoute(wayPoints, coordinates);else this.renderPolyline(wayPoints, coordinates);
      }
    }
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
  }, {
    key: "renderPolyline",
    value: function renderPolyline(wayPoints, coordinates) {
      this.polyline = new ymaps.Polyline(coordinates);
      this.polyline.options.set({
        strokeColor: '#0000FF',
        strokeWidth: 3,
        opacity: 0.5
      });
      this.map.geoObjects.add(this.polyline);
    }
  }, {
    key: "renderRoute",
    value: function renderRoute(wayPoints, coordinates) {
      var _this3 = this;

      ymaps.route(coordinates).then(function (route) {
        _this3.path = route.getPaths();

        _this3.path.options.set({
          strokeColor: '#FF0000',
          strokeWidth: 2
        });
        _this3.map.geoObjects.add(_this3.path);
      });
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