"use strict"

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

class NgSortable {

  /** смещение по клику мыши + позиция контейнера **/
  offsetY;

  /** $scope **/
  $scope;

  /** element на котором висит деректива **/
  element;

  /** перетаскиваемый элемент **/
  ddElement;

  /** указывает место куда вставляется обьект **/
  placeholder;

  /** список все дум элементов участвующих в сортировке **/
  items;

  /** координаты контейнера для перетасквамых элементов **/
  parentRect;

  /** позиция в массиве куда происходит установка gперемещаемого элемента**/
  insertPos;

  /**
   * конструктор
   * вызывается фабрикой в момент создания экземпляра компонента
   * @param ...args зависимости
   */
  constructor() {
    this.scope = {
      ngSortable: "="
    };
    
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.document = angular.element(document);
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
  link($scope, element, attr) {
    this.$scope = $scope;
    this.element = element;
    element.on("mousedown", this.onMouseDown.bind(this));        
  }  

  /**
   * обработчик mousedown на элементе подлежащим перемещению
   * @param e
   */
  onMouseDown(e) {
    var rect, parentRect;
    this.ddElement = e.target.tagName == "LI" ? angular.element(e.target) : angular.element(e.target).closest("LI", this.element);
    if (!this.ddElement) return;

    parentRect = this.ddElement.parent()[0].getBoundingClientRect();
    rect = this.ddElement[0].getBoundingClientRect();
    
    this.offsetY = (rect.top - e.clientY) - parentRect.top;
    
    this.initPlaceHolder(rect,parentRect);
    
    this.items = this.getChildren(this.ddElement);
    this.document.on("mousemove", this.onMouseMove);
    this.document.on("mouseup", this.onMouseUp);
  };

  /**
   * обработчик mousedown на document
   * @param e
   */
  onMouseUp(e) {
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
    })

    this.placeholder.remove();
    this.$scope.$apply(() => {
      var srcPos = Number(this.ddElement.attr("index")),
          removePos = srcPos > this.insertPos ? srcPos + 1 : srcPos;

      this.$scope.ngSortable.splice(this.insertPos, 0, this.$scope.ngSortable[srcPos]);
      this.$scope.ngSortable.splice(removePos, 1);
    });

    this.placeholder = null;
    this.ddElement = null;
  };

  /**
   * обработчик mousemove на document
   * @param e
   */
  onMouseMove(e) {
    if(!this.items) return;
    
    var posY = e.clientY, //this.ddElement.position().top+this.ddElement.height()/2,
      target = this.items.find((el) => el.rect.top < posY && el.rect.top + el.rect.height > posY),
      i = this.items.length - 1,
      el;

    //установим координаты перетаскиваемому обьекту
    this.ddElement.css("top", (e.clientY + this.offsetY) + "px");

    //установим placeholder
    if (!target || target.el == this.placeholder[0]) return;

    if (target.rect.top + (target.rect.height / 2) < e.clientY) {
      angular.element(target.el).before(this.placeholder[0]); //target.el.parentNode.insertBefore(this.placeholder[0], target.el)
      this.insertPos = Number(target.el.getAttribute("index"))
    } else {
      angular.element(target.el).after(this.placeholder[0]); //target.el.nextSibling.parentNode.insertBefore(this.placeholder[0], target.el.nextSibling)
      this.insertPos = Number(target.el.getAttribute("index")) + 1
    }

    this.items = this.getChildren(this.ddElement); //массив children обновляется лишь тогда когда имело место перестановка
  };

  /**
   * создаёт placeholder
   * @param rect
   */
  initPlaceHolder(rect, parentRect){
    if (this.placeholder) this.placeholder.remove();
    this.placeholder = this.ddElement.clone();
    this.placeholder.css("opacity", 0);

    this.ddElement.css({
      "position": "absolute",
      "left": rect.left + "px",
      "top": rect.top - parentRect.top + "px",
      "width": rect.width + "px",
      "height": rect.height + "px",
      "z-index": 1,
      "cursor": "move"
    })

    this.ddElement.before(this.placeholder); //this.ddElement[0].parentNode.insertBefore(this.placeholder[0], this.ddElement[0])
    return this.placeholder;
  }

  /**
   * возвращает все dom элементы подлежащие перетаскиванию
   * @param e
   * @returns {array}   
   */
  getChildren(item) {
    var arr = [],
      children = this.element.children("li");

    for (let i = 0; i < children.length; i++) {
      if (item[0] !== children[i]) arr.push({
        el: children[i],
        rect: children[i].getBoundingClientRect()
      });
    }
    return arr;
  }

  /**
   * обработчик mousemove на document
   * @param ...args - зависимости
   * @returns {NgSortable}
   */
  static factory(...args) {
    var instance = new NgSortable(...args);
    instance.link = NgSortable.prototype.link ? NgSortable.prototype.link.bind(instance) : instance.link;
    return instance;
  }
}

NgSortable.factory.$inject = [];
angular.module("ngSortable", []).directive("ngSortable", NgSortable.factory);