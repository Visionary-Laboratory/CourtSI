/*
 * Dics: Definitive image comparison slider. A multiple image vanilla comparison slider.
 *
 * By Abel Cabeza Román, a Codictados developer
 * Src: https://github.com/abelcabezaroman/definitive-image-comparison-slider
 * Example: http://codictados.com/portfolio/definitive-image-comparison-slider-demo/
 */

let defaultOptions = {
  container: null,
  filters: null,
  hideTexts: true,
  textPosition: "center",
  linesOrientation: "horizontal",
  rotate: 0,
  arrayBackgroundColorText: null,
  arrayColorText: null,
  linesColor: null
};

let Dics = function(options) {
  this.options = utils.extend({}, [defaultOptions, options], {
    clearEmpty: true
  });

  this.container = this.options.container;

  if (this.container == null) {
    console.error("Container element not found!");
  } else {
    this._setOrientation(this.options.linesOrientation, this.container);
    this.images = this._getImages();
    this.sliders = [];
    this._activeSlider = null;

    this._load(this.images[0]);
  }
};

Dics.prototype._load = function(firstImage, maxCounter = 100000) {
  if (firstImage.naturalWidth) {
    this._buidAfterFirstImageLoad(firstImage);
    window.addEventListener("resize", () => {
      this._setContainerWidth(firstImage);
      this._resetSizes();
    });
  } else {
    if (maxCounter > 0) {
      maxCounter--;
      setTimeout(() => {
        this._load(firstImage, maxCounter);
      }, 100);
    } else {
      console.error("error loading images");
    }
  }
};

Dics.prototype._buidAfterFirstImageLoad = function(firstImage) {
  this._setContainerWidth(firstImage);
  this._build();
  this._setEvents();
};

Dics.prototype._setContainerWidth = function(firstImage) {
  this.options.container.style.height = `${this._calcContainerHeight(firstImage)}px`;
};

Dics.prototype._setOpacityContainerForLoading = function(opacity) {
  this.options.container.style.opacity = opacity;
};

Dics.prototype._resetSizes = function() {
  let dics = this;
  let imagesLength = dics.images.length;

  let initialImagesContainerWidth = dics.container.getBoundingClientRect()[dics.config.sizeField] / imagesLength;

  const sections$$ = dics.container.querySelectorAll("[data-function='b-dics__section']");
  for (let i = 0; i < sections$$.length; i++) {
    let section$$ = sections$$[i];

    section$$.style.flex = `0 0 ${initialImagesContainerWidth}px`;

    section$$.querySelector(".b-dics__image").style[dics.config.positionField] = `${i * -initialImagesContainerWidth}px`;

    const slider$$ = section$$.querySelector(".b-dics__slider");
    if (slider$$) {
      slider$$.style[dics.config.positionField] = `${initialImagesContainerWidth * (i + 1)}px`;
    }
  }
};

Dics.prototype._build = function() {
  let dics = this;

  dics._applyGlobalClass(dics.options);

  let imagesLength = dics.images.length;

  let initialImagesContainerWidth = dics.container.getBoundingClientRect()[dics.config.sizeField] / imagesLength;

  for (let i = 0; i < imagesLength; i++) {
    let image = dics.images[i];
    let section = dics._createElement("div", "b-dics__section");
    let imageContainer = dics._createElement("div", "b-dics__image-container");
    let slider = dics._createSlider(i, initialImagesContainerWidth);

    dics._createAltText(image, i, imageContainer);

    dics._applyFilter(image, i, dics.options.filters);
    dics._rotate(image, imageContainer);

    section.setAttribute("data-function", "b-dics__section");
    section.style.flex = `0 0 ${initialImagesContainerWidth}px`;

    image.classList.add("b-dics__image");

    section.appendChild(imageContainer);
    imageContainer.appendChild(image);

    if (i < imagesLength - 1) {
      section.appendChild(slider);
    }

    dics.container.appendChild(section);

    image.style[dics.config.positionField] = `${i * -initialImagesContainerWidth}px`;
  }

  this.sections = this._getSections();
  this._setOpacityContainerForLoading(1);
};

Dics.prototype._getImages = function() {
  return this.container.querySelectorAll("img");
};

Dics.prototype._getSections = function() {
  return this.container.querySelectorAll("[data-function=\"b-dics__section\"]");
};

Dics.prototype._createElement = function(elementClass, className) {
  let newElement = document.createElement(elementClass);
  newElement.classList.add(className);
  return newElement;
};

Dics.prototype._setEvents = function() {
  let dics = this;

  dics._disableImageDrag();

  dics._isGoingRight = null;

  let oldx = 0;

  let listener = function(event) {
    let xPageCoord = event.pageX ? event.pageX : event.touches[0].pageX;

    if (xPageCoord < oldx) {
      dics._isGoingRight = false;
    } else if (xPageCoord > oldx) {
      dics._isGoingRight = true;
    }

    oldx = xPageCoord;

    let position = dics._calcPosition(event);

    let beforeSectionsWidth = dics._beforeSectionsWidth(dics.sections, dics.images, dics._activeSlider);

    let calcMovePixels = position - beforeSectionsWidth;

    dics.sliders[dics._activeSlider].style[dics.config.positionField] = `${position}px`;

    dics._pushSections(calcMovePixels, position);
  };

  dics.container.addEventListener("click", listener);

  for (let i = 0; i < dics.sliders.length; i++) {
    let slider = dics.sliders[i];
    utils.setMultiEvents(slider, ["mousedown", "touchstart"], function(event) {
      dics._activeSlider = i;

      dics._clickPosition = dics._calcPosition(event);

      slider.classList.add("b-dics__slider--active");

      utils.setMultiEvents(dics.container, ["mousemove", "touchmove"], listener);
    });
  }

  let listener2 = function() {
    let activeElements = dics.container.querySelectorAll(".b-dics__slider--active");

    for (let activeElement of activeElements) {
      activeElement.classList.remove("b-dics__slider--active");
      utils.removeMultiEvents(dics.container, ["mousemove", "touchmove"], listener);
    }
  };

  utils.setMultiEvents(document.body, ["mouseup", "touchend"], listener2);
};

Dics.prototype._beforeSectionsWidth = function(sections, images, activeSlider) {
  let width = 0;
  for (let i = 0; i < sections.length; i++) {
    let section = sections[i];
    if (i !== activeSlider) {
      width += section.getBoundingClientRect()[this.config.sizeField];
    } else {
      return width;
    }
  }
};

Dics.prototype._calcContainerHeight = function(firstImage) {
  let imgHeight = firstImage.naturalHeight;
  let imgWidth = firstImage.naturalWidth;
  let containerWidth = this.options.container.getBoundingClientRect().width;

  return (containerWidth / imgWidth) * imgHeight;
};

Dics.prototype._setLeftToImages = function(sections, images) {
  let size = 0;
  for (let i = 0; i < images.length; i++) {
    let image = images[i];

    image.style[this.config.positionField] = `-${size}px`;
    size += sections[i].getBoundingClientRect()[this.config.sizeField];

    this.sliders[i].style[this.config.positionField] = `${size}px`;
  }
};

Dics.prototype._disableImageDrag = function() {
  for (let i = 0; i < this.images.length; i++) {
    this.sliders[i].addEventListener("dragstart", function(e) {
      e.preventDefault();
    });
    this.images[i].addEventListener("dragstart", function(e) {
      e.preventDefault();
    });
  }
};

Dics.prototype._applyFilter = function(image, index, filters) {
  if (filters) {
    image.style.filter = filters[index];
  }
};

Dics.prototype._applyGlobalClass = function(options) {
  let container = options.container;

  if (options.hideTexts) {
    container.classList.add("b-dics--hide-texts");
  }

  if (options.linesOrientation === "vertical") {
    container.classList.add("b-dics--vertical");
  }

  if (options.textPosition === "center") {
    container.classList.add("b-dics--tp-center");
  } else if (options.textPosition === "bottom") {
    container.classList.add("b-dics--tp-bottom");
  } else if (options.textPosition === "left") {
    container.classList.add("b-dics--tp-left");
  } else if (options.textPosition === "right") {
    container.classList.add("b-dics--tp-right");
  }
};

Dics.prototype._createSlider = function(i, initialImagesContainerWidth) {
  let slider = this._createElement("div", "b-dics__slider");

  if (this.options.linesColor) {
    slider.style.color = this.options.linesColor;
  }

  slider.style[this.config.positionField] = `${initialImagesContainerWidth * (i + 1)}px`;

  this.sliders.push(slider);

  return slider;
};

Dics.prototype._createAltText = function(image, i, imageContainer) {
  let textContent = image.getAttribute("alt");
  if (textContent) {
    let text = this._createElement("p", "b-dics__text");

    if (this.options.arrayBackgroundColorText) {
      text.style.backgroundColor = this.options.arrayBackgroundColorText[i];
    }
    if (this.options.arrayColorText) {
      text.style.color = this.options.arrayColorText[i];
    }

    text.appendChild(document.createTextNode(textContent));

    imageContainer.appendChild(text);
  }
};

Dics.prototype._rotate = function(image, imageContainer) {
  image.style.rotate = `-${this.options.rotate}`;
  imageContainer.style.rotate = this.options.rotate;
};

Dics.prototype._removeActiveElements = function() {
  let activeElements = Dics.container.querySelectorAll(".b-dics__slider--active");

  for (let activeElement of activeElements) {
    activeElement.classList.remove("b-dics__slider--active");
    utils.removeMultiEvents(Dics.container, ["mousemove", "touchmove"], Dics.prototype._removeActiveElements);
  }
};

Dics.prototype._setOrientation = function(linesOrientation) {
  this.config = {};

  if (linesOrientation === "vertical") {
    this.config.offsetSizeField = "offsetHeight";
    this.config.offsetPositionField = "offsetTop";
    this.config.sizeField = "height";
    this.config.positionField = "top";
    this.config.clientField = "clientY";
    this.config.pageField = "pageY";
  } else {
    this.config.offsetSizeField = "offsetWidth";
    this.config.offsetPositionField = "offsetLeft";
    this.config.sizeField = "width";
    this.config.positionField = "left";
    this.config.clientField = "clientX";
    this.config.pageField = "pageX";
  }
};

Dics.prototype._calcPosition = function(event) {
  let containerCoords = this.container.getBoundingClientRect();
  let pixel = !isNaN(event[this.config.clientField]) ? event[this.config.clientField] : event.touches[0][this.config.clientField];

  return containerCoords[this.config.positionField] < pixel ? pixel - containerCoords[this.config.positionField] : 0;
};

Dics.prototype._pushSections = function(calcMovePixels, position) {
  this._setFlex(position, this._isGoingRight);

  let section = this.sections[this._activeSlider];
  let postActualSection = this.sections[this._activeSlider + 1];
  let sectionWidth = postActualSection.getBoundingClientRect()[this.config.sizeField] - (calcMovePixels - this.sections[this._activeSlider].getBoundingClientRect()[this.config.sizeField]);

  section.style.flex = this._isGoingRight === true ? `2 0 ${calcMovePixels}px` : `1 1 ${calcMovePixels}px`;
  postActualSection.style.flex = this._isGoingRight === true ? ` ${sectionWidth}px` : `2 0 ${sectionWidth}px`;

  this._setLeftToImages(this.sections, this.images);
};

Dics.prototype._setFlex = function(position, isGoingRight) {
  let beforeSumSectionsSize = 0;

  for (let i = 0; i < this.sections.length; i++) {
    let section = this.sections[i];
    const sectionSize = section.getBoundingClientRect()[this.config.sizeField];

    beforeSumSectionsSize += sectionSize;

    if ((isGoingRight && position > (beforeSumSectionsSize - sectionSize) && i > this._activeSlider) || (!isGoingRight && position < beforeSumSectionsSize) && i < this._activeSlider) {
      section.style.flex = `1 100 ${sectionSize}px`;
    } else {
      section.style.flex = `0 0 ${sectionSize}px`;
    }
  }
};

let utils = {
  extend: function(target, objects, options) {
    for (let object in objects) {
      if (objects.hasOwnProperty(object)) {
        recursiveMerge(target, objects[object]);
      }
    }

    function recursiveMerge(target, object) {
      for (let property in object) {
        if (object.hasOwnProperty(property)) {
          let current = object[property];
          if (utils.getConstructor(current) === "Object") {
            if (!target[property]) {
              target[property] = {};
            }
            recursiveMerge(target[property], current);
          } else {
            if (options.clearEmpty) {
              if (current == null) {
                continue;
              }
            }
            target[property] = current;
          }
        }
      }
    }

    return target;
  },

  setMultiEvents: function(element, events, func) {
    for (let i = 0; i < events.length; i++) {
      element.addEventListener(events[i], func);
    }
  },

  removeMultiEvents: function(element, events, func) {
    for (let i = 0; i < events.length; i++) {
      element.removeEventListener(events[i], func, false);
    }
  },

  getConstructor: function(object) {
    return Object.prototype.toString.call(object).slice(8, -1);
  }
};
