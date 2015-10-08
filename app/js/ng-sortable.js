"use strict";

/**
 * @ngdoc directive
 * @name NgSortable
 *
 * @description
 * директива обеспечивает сортировку данных, но не перемещает элементы самостоятельно
 *
 * @element UL
 * @priority 0
 * @param {array} ngSortable - данные подлежищае сортировки 
 */

var _bind = Function.prototype.bind;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NgSortable = (function () {

  /**
   * конструктор
   * вызывается фабрикой в момент создания экземпляра компонента
   * @param ...args зависимости
   */

  function NgSortable() {
    _classCallCheck(this, NgSortable);

    this.scope = {
      ngSortable: "="
    };

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.document = angular.element(document);
    this.controllerAs = "sortableController";
  }

  /**
   * системный callback
   * здеь инициалиируется приватный api компонента
   *
   * @param $scope
   * @param element
   * @param element
   * @param attr   
   */

  _createClass(NgSortable, [{
    key: "link",
    value: function link($scope, element, attr) {
      this.$scope = $scope;
      this.element = element;
      element.on("mousedown", this.onMouseDown.bind(this));
    }

    /**
     * создаёт placeholder
     * @param rect
     */
  }, {
    key: "initPlaceHolder",
    value: function initPlaceHolder(rect) {
      if (this.placeholder) this.placeholder.remove();
      this.placeholder = this.ddElement.clone();
      this.placeholder.css("opacity", 0);

      this.ddElement.css({
        "position": "absolute",
        "left": rect.left + "px",
        "top": rect.top - this.parentRect.top + "px",
        "width": rect.width + "px",
        "height": rect.height + "px",
        "z-index": 1,
        "cursor": "move"
      });

      this.ddElement.before(this.placeholder); //this.ddElement[0].parentNode.insertBefore(this.placeholder[0], this.ddElement[0])
      return this.placeholder;
    }

    /**
     * обработчик mousedown на элементе подлежащим перемещению
     * @param e
     */
  }, {
    key: "onMouseDown",
    value: function onMouseDown(e) {
      var rect;
      this.ddElement = e.target.tagName == "LI" ? angular.element(e.target) : angular.element(e.target).closest("LI", this.element);
      if (!this.ddElement) return;

      this.parentRect = this.ddElement.parent()[0].getBoundingClientRect();
      rect = this.ddElement[0].getBoundingClientRect();

      this.offsetY = rect.top - e.clientY - this.parentRect.top;

      this.initPlaceHolder(rect);

      this.items = this.getChildren(this.ddElement);
      this.document.on("mousemove", this.onMouseMove);
      this.document.on("mouseup", this.onMouseUp);
    }
  }, {
    key: "onMouseUp",

    /**
     * обработчик mousedown на document
     * @param e
     */
    value: function onMouseUp(e) {
      var _this = this;

      this.document.off("mousemove", this.onMouseMove);
      this.document.off("mouseup", this.onMouseUp);
      if (!this.ddElement) return;

      this.ddElement.css({
        "position": "relative",
        "left": 0,
        "top": 0,
        "height": "",
        "width": "",
        "z-index": "",
        "cursor": "auto"
      });

      this.placeholder.remove();
      this.$scope.$apply(function () {
        var srcPos = Number(_this.ddElement.attr("index")),
            removePos = srcPos > _this.insertPos ? srcPos + 1 : srcPos;

        _this.$scope.ngSortable.splice(_this.insertPos, 0, _this.$scope.ngSortable[srcPos]);
        _this.$scope.ngSortable.splice(removePos, 1);
      });

      this.placeholder = null;
      this.ddElement = null;
    }
  }, {
    key: "onMouseMove",

    /**
     * обработчик mousemove на document
     * @param e
     */
    value: function onMouseMove(e) {
      if (!this.items) return;

      var posY = e.clientY,
          //this.ddElement.position().top+this.ddElement.height()/2,
      target = this.items.find(function (el) {
        return el.rect.top < posY && el.rect.top + el.rect.height > posY;
      }),
          i = this.items.length - 1,
          el;

      this.ddElement.css("top", e.clientY + this.offsetY + "px");

      if (!target || target.el == this.placeholder[0]) return;

      if (target.rect.top + target.rect.height / 2 < e.clientY) {
        target.el.parentNode.insertBefore(this.placeholder[0], target.el);
        this.insertPos = Number(target.el.getAttribute("index"));
      } else {
        target.el.nextSibling.parentNode.insertBefore(this.placeholder[0], target.el.nextSibling);
        this.insertPos = Number(target.el.getAttribute("index")) + 1;
      }

      this.items = this.getChildren(this.ddElement); //массив children обновляется лишь тогда когда имело место перестановка
    }
  }, {
    key: "getChildren",

    /**
     * возвращает все dom элементы подлежащие перетаскиванию
     * @param e
     * @returns {array}   
     */
    value: function getChildren(item) {
      var arr = [],
          children = this.element.children("li");

      for (var i = 0; i < children.length; i++) {
        if (item[0] !== children[i]) arr.push({
          el: children[i],
          rect: children[i].getBoundingClientRect()
        });
      }return arr;
    }

    /**
     * обработчик mousemove на document
     * @param ...args - зависимости
     * @returns {NgSortable}
     */
  }], [{
    key: "factory",
    value: function factory() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var instance = new (_bind.apply(NgSortable, [null].concat(args)))();
      instance.link = NgSortable.prototype.link ? NgSortable.prototype.link.bind(instance) : instance.link;
      return instance;
    }
  }]);

  return NgSortable;
})();

NgSortable.factory.$inject = [];
angular.module("ngSortable", []).directive("ngSortable", NgSortable.factory);

/** смещение по клику мыши + позиция контейнера **/

/** $scope **/

/** element на котором висит деректива **/

/** перетаскиваемый элемент **/

/** указывает место куда вставляется обьект **/

/** список все дум элементов участвующих в сортировке **/

/** координаты контейнера для перетасквамых элементов **/

/** позиция в массиве куда происходит установка gперемещаемого элемента**/
//# sourceMappingURL=ng-sortable.js.map