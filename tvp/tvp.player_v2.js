;(function (global) {
	/* Zepto v1.0-1-ga3cab6c - polyfill zepto detect event ajax form fx - zeptojs.com/license */
	
	
	;(function(undefined){
	  if (String.prototype.trim === undefined) // fix for iOS 3.2
	    String.prototype.trim = function(){ return this.replace(/^\s+|\s+$/g, '') }
	
	  // For iOS 3.x
	  // from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reduce
	  if (Array.prototype.reduce === undefined)
	    Array.prototype.reduce = function(fun){
	      if(this === void 0 || this === null) throw new TypeError()
	      var t = Object(this), len = t.length >>> 0, k = 0, accumulator
	      if(typeof fun != 'function') throw new TypeError()
	      if(len == 0 && arguments.length == 1) throw new TypeError()
	
	      if(arguments.length >= 2)
	       accumulator = arguments[1]
	      else
	        do{
	          if(k in t){
	            accumulator = t[k++]
	            break
	          }
	          if(++k >= len) throw new TypeError()
	        } while (true)
	
	      while (k < len){
	        if(k in t) accumulator = fun.call(undefined, accumulator, t[k], k, t)
	        k++
	      }
	      return accumulator
	    }
	
	  // Production steps of ECMA-262, Edition 5, 15.4.4.18
	// Reference: http://es5.github.com/#x15.4.4.18
	if ( !Array.prototype.forEach ) {
	  Array.prototype.forEach = function forEach( callback, thisArg ) {
	    var T, k;
	    if ( this == null ) {
	      throw new TypeError( "this is null or not defined" );
	    }
	    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
	    var O = Object(this);
	    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
	    // 3. Let len be ToUint32(lenValue).
	    var len = O.length >>> 0; // Hack to convert O.length to a UInt32
	    // 4. If IsCallable(callback) is false, throw a TypeError exception.
	    // See: http://es5.github.com/#x9.11
	    if ( {}.toString.call(callback) !== "[object Function]" ) {
	      throw new TypeError( callback + " is not a function" );
	    }
	    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
	    if ( thisArg ) {
	      T = thisArg;
	    }
	    // 6. Let k be 0
	    k = 0;
	    // 7. Repeat, while k < len
	    while( k < len ) {
	      var kValue;
	      // a. Let Pk be ToString(k).
	      //   This is implicit for LHS operands of the in operator
	      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
	      //   This step can be combined with c
	      // c. If kPresent is true, then
	      if ( Object.prototype.hasOwnProperty.call(O, k) ) {
	        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
	        kValue = O[ k ];
	        // ii. Call the Call internal method of callback with T as the this value and
	        // argument list containing kValue, k, and O.
	        callback.call( T, kValue, k, O );
	      }
	      // d. Increase k by 1.
	      k++;
	    }
	    // 8. return undefined
	  };
	}
	
	if (!Array.prototype.indexOf) {
	    Array.prototype.indexOf = function(elt /*, from*/ ) {
	      var len = this.length >>> 0;
	
	      var from = Number(arguments[1]) || 0;
	      from = (from < 0) ? Math.ceil(from) : Math.floor(from);
	      if (from < 0)
	        from += len;
	
	      for (; from < len; from++) {
	        if (from in this &&
	          this[from] === elt)
	          return from;
	      }
	      return -1;
	    };
	  }
	})()
	
	var Zepto = (function() {
	  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
	    document = window.document,
	    elementDisplay = {}, classCache = {},
	    getComputedStyle =  document.defaultView?document.defaultView.getComputedStyle:document.documentElement.currentStyle,
	    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
	    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
	    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
	    rootNodeRE = /^(?:body|html)$/i,
	
	    // special attributes that should be get/set via method calls
	    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],
	
	    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
	    table = document.createElement('table'),
	    tableRow = document.createElement('tr'),
	    containers = {
	      'tr': document.createElement('tbody'),
	      'tbody': table, 'thead': table, 'tfoot': table,
	      'td': tableRow, 'th': tableRow,
	      '*': document.createElement('div')
	    },
	    readyRE = /complete|loaded|interactive/,
	    classSelectorRE = /^\.([\w-]+)$/,
	    idSelectorRE = /^#([\w-]*)$/,
	    tagSelectorRE = /^[\w-]+$/,
	    class2type = {},
	    toString = class2type.toString,
	    zepto = {},
	    camelize, uniq,
	    tempParent = document.createElement('div')
	
	  zepto.matches = function(element, selector) {
	    if (!element || element.nodeType !== 1) return false
	    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
	                          element.oMatchesSelector || element.matchesSelector
	    if (matchesSelector) return matchesSelector.call(element, selector)
	    // fall back to performing a selector:
	    var match, parent = element.parentNode, temp = !parent
	    if (temp) (parent = tempParent).appendChild(element)
	    match = ~zepto.qsa(parent, selector).indexOf(element)
	    temp && tempParent.removeChild(element)
	    return match
	  }
	
	  function type(obj) {
	    return obj == null ? String(obj) :
	      class2type[toString.call(obj)] || "object"
	  }
	
	  function isFunction(value) { return type(value) == "function" }
	  function isWindow(obj)     { return obj != null && obj == obj.window }
	  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
	  function isObject(obj)     { return type(obj) == "object" }
	  function isPlainObject(obj) {
	    if (!obj || obj.toString() !== "[object Object]" || obj.nodeType || obj.setInterval) {
	      return false;
	    }
	
	    if (obj.constructor && !obj.hasOwnProperty("constructor") && !obj.constructor.prototype.hasOwnProperty("isPrototypeOf")) {
	      return false;
	    }
	
	    var key;
	    for (key in obj) {}
	
	    return key === undefined || obj.hasOwnProperty(key);
	  }
	  function isArray(value) { return value instanceof Array }
	  function likeArray(obj) { return typeof obj.length == 'number' }
	
	  function compact(array) { return filter.call(array, function(item){ return item != null }) }
	  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
	  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
	  function dasherize(str) {
	    return str.replace(/::/g, '/')
	           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
	           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
	           .replace(/_/g, '-')
	           .toLowerCase()
	  }
	  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }
	
	  function classRE(name) {
	    return name in classCache ?
	      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
	  }
	
	  function maybeAddPx(name, value) {
	    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
	  }
	
	  function defaultDisplay(nodeName) {
	    var element, display
	    if (!elementDisplay[nodeName]) {
	      element = document.createElement(nodeName)
	      document.body.appendChild(element)
	      display = getComputedStyle(element, '').getPropertyValue("display")
	      element.parentNode.removeChild(element)
	      display == "none" && (display = "block")
	      elementDisplay[nodeName] = display
	    }
	    return elementDisplay[nodeName]
	  }
	
	  function children(element) {
	    return 'children' in element ?
	      slice.call(element.children) :
	      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
	  }
	
	  // `$.zepto.fragment` takes a html string and an optional tag name
	  // to generate DOM nodes nodes from the given html string.
	  // The generated DOM nodes are returned as an array.
	  // This function can be overriden in plugins for example to make
	  // it compatible with browsers that don't support the DOM fully.
	  zepto.fragment = function(html, name, properties) {
	    if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
	    if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
	    if (!(name in containers)) name = '*'
	
	    var nodes, dom, container = containers[name]
	    container.innerHTML = '' + html
	    dom = $.each(slice.call(container.childNodes), function(){
	      container.removeChild(this)
	    })
	    if (isPlainObject(properties)) {
	      nodes = $(dom)
	      $.each(properties, function(key, value) {
	        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
	        else nodes.attr(key, value)
	      })
	    }
	    return dom
	  }
	
	  // `$.zepto.Z` swaps out the prototype of the given `dom` array
	  // of nodes with `$.fn` and thus supplying all the Zepto functions
	  // to the array. Note that `__proto__` is not supported on Internet
	  // Explorer. This method can be overriden in plugins.
	  zepto.Z = function(dom, selector) {
	    dom = dom || []
	    dom.__proto__ = $.fn
	    dom.selector = selector || ''
	    return dom
	  }
	
	  // `$.zepto.isZ` should return `true` if the given object is a Zepto
	  // collection. This method can be overriden in plugins.
	  zepto.isZ = function(object) {
	    return object instanceof zepto.Z
	  }
	
	  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
	  // takes a CSS selector and an optional context (and handles various
	  // special cases).
	  // This method can be overriden in plugins.
	  zepto.init = function(selector, context) {
	    // If nothing given, return an empty Zepto collection
	    if (!selector) return zepto.Z()
	    // If a function is given, call it when the DOM is ready
	    else if (isFunction(selector)) return $(document).ready(selector)
	    // If a Zepto collection is given, juts return it
	    else if (zepto.isZ(selector)) return selector
	    else {
	      var dom
	      // normalize array if an array of nodes is given
	      if (isArray(selector)) dom = compact(selector)
	      // Wrap DOM nodes. If a plain object is given, duplicate it.
	      else if (isObject(selector))
	        dom = [isPlainObject(selector) ? $.extend({}, selector) : selector], selector = null
	      // If it's a html fragment, create nodes from it
	      else if (fragmentRE.test(selector))
	        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
	      // If there's a context, create a collection on that context first, and select
	      // nodes from there
	      else if (context !== undefined) return $(context).find(selector)
	      // And last but no least, if it's a CSS selector, use it to select nodes.
	      else dom = zepto.qsa(document, selector)
	      // create a new Zepto collection from the nodes found
	      return zepto.Z(dom, selector)
	    }
	  }
	
	  // `$` will be the base `Zepto` object. When calling this
	  // function just call `$.zepto.init, which makes the implementation
	  // details of selecting nodes and creating Zepto collections
	  // patchable in plugins.
	  $ = function(selector, context){
	    return zepto.init(selector, context)
	  }
	
	  $._tvp = true;
	
	  function extend(target, source, deep) {
	    for (key in source)
	      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
	        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
	          target[key] = {}
	        if (isArray(source[key]) && !isArray(target[key]))
	          target[key] = []
	        extend(target[key], source[key], deep)
	      }
	      else if (source[key] !== undefined) target[key] = source[key]
	  }
	
	  // Copy all but undefined properties from one or more
	  // objects to the `target` object.
	  $.extend = function(target){
	    var deep, args = slice.call(arguments, 1)
	    if (typeof target == 'boolean') {
	      deep = target
	      target = args.shift()
	    }
	    args.forEach(function(arg){ extend(target, arg, deep) })
	    return target
	  }
	
	  // `$.zepto.qsa` is Zepto's CSS selector implementation which
	  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
	  // This method can be overriden in plugins.
	  zepto.qsa = function(element, selector){
	    var found;
	    return (isDocument(element) && idSelectorRE.test(selector)) ?
	      ( (found = element.getElementById(RegExp.$1)) ? [found] : [] ) :
	      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
	      slice.call(
	        classSelectorRE.test(selector) ? element.getElementsByClassName(RegExp.$1) :
	        tagSelectorRE.test(selector) ? element.getElementsByTagName(selector) :
	        element.querySelectorAll(selector)
	      )
	  }
	
	  function filtered(nodes, selector) {
	    return selector === undefined ? $(nodes) : $(nodes).filter(selector)
	  }
	
	  $.contains = function(parent, node) {
	    return parent !== node && parent.contains(node)
	  }
	
	  function funcArg(context, arg, idx, payload) {
	    return isFunction(arg) ? arg.call(context, idx, payload) : arg
	  }
	
	  function setAttribute(node, name, value) {
	    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
	  }
	
	  // access className property while respecting SVGAnimatedString
	  function className(node, value){
	    var klass = node.className,
	        svg   = klass && klass.baseVal !== undefined
	
	    if (value === undefined) return svg ? klass.baseVal : klass
	    svg ? (klass.baseVal = value) : (node.className = value)
	  }
	
	  // "true"  => true
	  // "false" => false
	  // "null"  => null
	  // "42"    => 42
	  // "42.5"  => 42.5
	  // JSON    => parse if valid
	  // String  => self
	  function deserializeValue(value) {
	    var num
	    try {
	      return value ?
	        value == "true" ||
	        ( value == "false" ? false :
	          value == "null" ? null :
	          !isNaN(num = Number(value)) ? num :
	          /^[\[\{]/.test(value) ? $.parseJSON(value) :
	          value )
	        : value
	    } catch(e) {
	      return value
	    }
	  }
	
	  $.type = type
	  $.isFunction = isFunction
	  $.isWindow = isWindow
	  $.isArray = isArray
	  $.isPlainObject = isPlainObject
	
	  $.isEmptyObject = function(obj) {
	    var name
	    for (name in obj) return false
	    return true
	  }
	
	  $.inArray = function(elem, array, i){
	    return emptyArray.indexOf.call(array, elem, i)
	  }
	
	  $.camelCase = camelize
	  $.trim = function(str) { return str.trim() }
	
	  // plugin compatibility
	  $.uuid = 0
	  $.support = { }
	  $.expr = { }
	
	  $.map = function(elements, callback){
	    var value, values = [], i, key
	    if (likeArray(elements))
	      for (i = 0; i < elements.length; i++) {
	        value = callback(elements[i], i)
	        if (value != null) values.push(value)
	      }
	    else
	      for (key in elements) {
	        value = callback(elements[key], key)
	        if (value != null) values.push(value)
	      }
	    return flatten(values)
	  }
	
	  $.each = function(elements, callback){
	    var i, key
	    if (likeArray(elements)) {
	      for (i = 0; i < elements.length; i++)
	        if (callback.call(elements[i], i, elements[i]) === false) return elements
	    } else {
	      for (key in elements)
	        if (callback.call(elements[key], key, elements[key]) === false) return elements
	    }
	
	    return elements
	  }
	
	  $.grep = function(elements, callback){
	    return filter.call(elements, callback)
	  }
	
	  if (window.JSON) $.parseJSON = JSON.parse
	
	  // Populate the class2type map
	  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	    class2type[ "[object " + name + "]" ] = name.toLowerCase()
	  })
	
	  // Define methods that will be available on all
	  // Zepto collections
	  $.fn = {
	    // Because a collection acts like an array
	    // copy over these useful array functions.
	    forEach: emptyArray.forEach,
	    reduce: emptyArray.reduce,
	    push: emptyArray.push,
	    sort: emptyArray.sort,
	    indexOf: emptyArray.indexOf,
	    concat: emptyArray.concat,
	
	    // `map` and `slice` in the jQuery API work differently
	    // from their array counterparts
	    map: function(fn){
	      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
	    },
	    slice: function(){
	      return $(slice.apply(this, arguments))
	    },
	
	    ready: function(callback){
	      if (readyRE.test(document.readyState)) callback($)
	      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
	      return this
	    },
	    get: function(idx){
	      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
	    },
	    toArray: function(){ return this.get() },
	    size: function(){
	      return this.length
	    },
	    remove: function(){
	      return this.each(function(){
	        if (this.parentNode != null)
	          this.parentNode.removeChild(this)
	      })
	    },
	    each: function(callback){
	      emptyArray.every.call(this, function(el, idx){
	        return callback.call(el, idx, el) !== false
	      })
	      return this
	    },
	    filter: function(selector){
	      if (isFunction(selector)) return this.not(this.not(selector))
	      return $(filter.call(this, function(element){
	        return zepto.matches(element, selector)
	      }))
	    },
	    add: function(selector,context){
	      return $(uniq(this.concat($(selector,context))))
	    },
	    is: function(selector){
	      return this.length > 0 && zepto.matches(this[0], selector)
	    },
	    not: function(selector){
	      var nodes=[]
	      if (isFunction(selector) && selector.call !== undefined)
	        this.each(function(idx){
	          if (!selector.call(this,idx)) nodes.push(this)
	        })
	      else {
	        var excludes = typeof selector == 'string' ? this.filter(selector) :
	          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
	        this.forEach(function(el){
	          if (excludes.indexOf(el) < 0) nodes.push(el)
	        })
	      }
	      return $(nodes)
	    },
	    has: function(selector){
	      return this.filter(function(){
	        return isObject(selector) ?
	          $.contains(this, selector) :
	          $(this).find(selector).size()
	      })
	    },
	    eq: function(idx){
	      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
	    },
	    first: function(){
	      var el = this[0]
	      return el && !isObject(el) ? el : $(el)
	    },
	    last: function(){
	      var el = this[this.length - 1]
	      return el && !isObject(el) ? el : $(el)
	    },
	    find: function(selector){
	      var result, $this = this
	      if (typeof selector == 'object')
	        result = $(selector).filter(function(){
	          var node = this
	          return emptyArray.some.call($this, function(parent){
	            return $.contains(parent, node)
	          })
	        })
	      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
	      else result = this.map(function(){ return zepto.qsa(this, selector) })
	      return result
	    },
	    closest: function(selector, context){
	      var node = this[0], collection = false
	      if (typeof selector == 'object') collection = $(selector)
	      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
	        node = node !== context && !isDocument(node) && node.parentNode
	      return $(node)
	    },
	    parents: function(selector){
	      var ancestors = [], nodes = this
	      while (nodes.length > 0)
	        nodes = $.map(nodes, function(node){
	          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
	            ancestors.push(node)
	            return node
	          }
	        })
	      return filtered(ancestors, selector)
	    },
	    parent: function(selector){
	      return filtered(uniq(this.pluck('parentNode')), selector)
	    },
	    children: function(selector){
	      return filtered(this.map(function(){ return children(this) }), selector)
	    },
	    contents: function() {
	      return this.map(function() { return slice.call(this.childNodes) })
	    },
	    siblings: function(selector){
	      return filtered(this.map(function(i, el){
	        return filter.call(children(el.parentNode), function(child){ return child!==el })
	      }), selector)
	    },
	    empty: function(){
	      return this.each(function(){ this.innerHTML = '' })
	    },
	    // `pluck` is borrowed from Prototype.js
	    pluck: function(property){
	      return $.map(this, function(el){ return el[property] })
	    },
	    show: function(){
	      return this.each(function(){
	        this.style.display == "none" && (this.style.display = null)
	        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
	          this.style.display = defaultDisplay(this.nodeName)
	      })
	    },
	    replaceWith: function(newContent){
	      return this.before(newContent).remove()
	    },
	    wrap: function(structure){
	      var func = isFunction(structure)
	      if (this[0] && !func)
	        var dom   = $(structure).get(0),
	            clone = dom.parentNode || this.length > 1
	
	      return this.each(function(index){
	        $(this).wrapAll(
	          func ? structure.call(this, index) :
	            clone ? dom.cloneNode(true) : dom
	        )
	      })
	    },
	    wrapAll: function(structure){
	      if (this[0]) {
	        $(this[0]).before(structure = $(structure))
	        var children
	        // drill down to the inmost element
	        while ((children = structure.children()).length) structure = children.first()
	        $(structure).append(this)
	      }
	      return this
	    },
	    wrapInner: function(structure){
	      var func = isFunction(structure)
	      return this.each(function(index){
	        var self = $(this), contents = self.contents(),
	            dom  = func ? structure.call(this, index) : structure
	        contents.length ? contents.wrapAll(dom) : self.append(dom)
	      })
	    },
	    unwrap: function(){
	      this.parent().each(function(){
	        $(this).replaceWith($(this).children())
	      })
	      return this
	    },
	    clone: function(){
	      return this.map(function(){ return this.cloneNode(true) })
	    },
	    hide: function(){
	      return this.css("display", "none")
	    },
	    toggle: function(setting){
	      return this.each(function(){
	        var el = $(this)
	        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
	      })
	    },
	    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
	    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
	    html: function(html){
	      return html === undefined ?
	        (this.length > 0 ? this[0].innerHTML : null) :
	        this.each(function(idx){
	          var originHtml = this.innerHTML
	          $(this).empty().append( funcArg(this, html, idx, originHtml) )
	        })
	    },
	    text: function(text){
	      return text === undefined ?
	        (this.length > 0 ? this[0].textContent : null) :
	        this.each(function(){ this.textContent = text })
	    },
	    attr: function(name, value){
	      var result
	      return (typeof name == 'string' && value === undefined) ?
	        (this.length == 0 || this[0].nodeType !== 1 ? undefined :
	          (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
	          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
	        ) :
	        this.each(function(idx){
	          if (this.nodeType !== 1) return
	          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
	          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
	        })
	    },
	    removeAttr: function(name){
	      return this.each(function(){ this.nodeType === 1 && setAttribute(this, name) })
	    },
	    prop: function(name, value){
	      return (value === undefined) ?
	        (this[0] && this[0][name]) :
	        this.each(function(idx){
	          this[name] = funcArg(this, value, idx, this[name])
	        })
	    },
	    data: function(name, value){
	      var data = this.attr('data-' + dasherize(name), value)
	      return data !== null ? deserializeValue(data) : undefined
	    },
	    val: function(value){
	      return (value === undefined) ?
	        (this[0] && (this[0].multiple ?
	           $(this[0]).find('option').filter(function(o){ return this.selected }).pluck('value') :
	           this[0].value)
	        ) :
	        this.each(function(idx){
	          this.value = funcArg(this, value, idx, this.value)
	        })
	    },
	    offset: function(coordinates){
	      if (coordinates) return this.each(function(index){
	        var $this = $(this),
	            coords = funcArg(this, coordinates, index, $this.offset()),
	            parentOffset = $this.offsetParent().offset(),
	            props = {
	              top:  coords.top  - parentOffset.top,
	              left: coords.left - parentOffset.left
	            }
	
	        if ($this.css('position') == 'static') props['position'] = 'relative'
	        $this.css(props)
	      })
	      if (this.length==0) return null
	      var obj = this[0].getBoundingClientRect()
	      return {
	        left: obj.left + window.pageXOffset,
	        top: obj.top + window.pageYOffset,
	        width: Math.round(obj.width),
	        height: Math.round(obj.height)
	      }
	    },
	    css: function(property, value){
	      if (arguments.length < 2 && typeof property == 'string')
	        return this[0] && (this[0].style[camelize(property)] || getComputedStyle(this[0], '').getPropertyValue(property))
	
	      var css = ''
	      if (type(property) == 'string') {
	        if (!value && value !== 0)
	          this.each(function(){ this.style.removeProperty(dasherize(property)) })
	        else
	          css = dasherize(property) + ":" + maybeAddPx(property, value)
	      } else {
	        for (key in property)
	          if (!property[key] && property[key] !== 0)
	            this.each(function(){ this.style.removeProperty(dasherize(key)) })
	          else
	            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
	      }
	
	      return this.each(function(){ this.style.cssText += ';' + css })
	    },
	    index: function(element){
	      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
	    },
	    hasClass: function(name){
	      return emptyArray.some.call(this, function(el){
	        return this.test(className(el))
	      }, classRE(name))
	    },
	    addClass: function(name){
	      return this.each(function(idx){
	        classList = []
	        var cls = className(this), newName = funcArg(this, name, idx, cls)
	        newName.split(/\s+/g).forEach(function(klass){
	          if (!$(this).hasClass(klass)) classList.push(klass)
	        }, this)
	        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
	      })
	    },
	    removeClass: function(name){
	      return this.each(function(idx){
	        if (name === undefined) return className(this, '')
	        classList = className(this)
	        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
	          classList = classList.replace(classRE(klass), " ")
	        })
	        className(this, classList.trim())
	      })
	    },
	    toggleClass: function(name, when){
	      return this.each(function(idx){
	        var $this = $(this), names = funcArg(this, name, idx, className(this))
	        names.split(/\s+/g).forEach(function(klass){
	          (when === undefined ? !$this.hasClass(klass) : when) ?
	            $this.addClass(klass) : $this.removeClass(klass)
	        })
	      })
	    },
	    scrollTop: function(){
	      if (!this.length) return
	      return ('scrollTop' in this[0]) ? this[0].scrollTop : this[0].scrollY
	    },
	    position: function() {
	      if (!this.length) return
	
	      var elem = this[0],
	        // Get *real* offsetParent
	        offsetParent = this.offsetParent(),
	        // Get correct offsets
	        offset       = this.offset(),
	        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()
	
	      // Subtract element margins
	      // note: when an element has margin: auto the offsetLeft and marginLeft
	      // are the same in Safari causing offset.left to incorrectly be 0
	      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
	      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0
	
	      // Add offsetParent borders
	      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
	      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0
	
	      // Subtract the two offsets
	      return {
	        top:  offset.top  - parentOffset.top,
	        left: offset.left - parentOffset.left
	      }
	    },
	    offsetParent: function() {
	      return this.map(function(){
	        var parent = this.offsetParent || document.body
	        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
	          parent = parent.offsetParent
	        return parent
	      })
	    }
	  }
	
	  // for now
	  $.fn.detach = $.fn.remove
	
	  // Generate the `width` and `height` functions
	  ;['width', 'height'].forEach(function(dimension){
	    $.fn[dimension] = function(value){
	      var offset, el = this[0],
	        Dimension = dimension.replace(/./, function(m){ return m[0].toUpperCase() })
	      if (value === undefined) return isWindow(el) ? el['inner' + Dimension] :
	        isDocument(el) ? el.documentElement['offset' + Dimension] :
	        (offset = this.offset()) && offset[dimension]
	      else return this.each(function(idx){
	        el = $(this)
	        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
	      })
	    }
	  })
	
	  function traverseNode(node, fun) {
	    fun(node)
	    for (var key in node.childNodes) traverseNode(node.childNodes[key], fun)
	  }
	
	  // Generate the `after`, `prepend`, `before`, `append`,
	  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
	  adjacencyOperators.forEach(function(operator, operatorIndex) {
	    var inside = operatorIndex % 2 //=> prepend, append
	
	    $.fn[operator] = function(){
	      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
	      var argType, nodes = $.map(arguments, function(arg) {
	            argType = type(arg)
	            return argType == "object" || argType == "array" || arg == null ?
	              arg : zepto.fragment(arg)
	          }),
	          parent, copyByClone = this.length > 1
	      if (nodes.length < 1) return this
	
	      return this.each(function(_, target){
	        parent = inside ? target : target.parentNode
	
	        // convert all methods to a "before" operation
	        target = operatorIndex == 0 ? target.nextSibling :
	                 operatorIndex == 1 ? target.firstChild :
	                 operatorIndex == 2 ? target :
	                 null
	
	        nodes.forEach(function(node){
	          if (copyByClone) node = node.cloneNode(true)
	          else if (!parent) return $(node).remove()
	
	          traverseNode(parent.insertBefore(node, target), function(el){
	            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
	               (!el.type || el.type === 'text/javascript') && !el.src)
	              window['eval'].call(window, el.innerHTML)
	          })
	        })
	      })
	    }
	
	    // after    => insertAfter
	    // prepend  => prependTo
	    // before   => insertBefore
	    // append   => appendTo
	    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
	      $(html)[operator](this)
	      return this
	    }
	  })
	
	  zepto.Z.prototype = $.fn
	
	  // Export internal API functions in the `$.zepto` namespace
	  zepto.uniq = uniq
	  zepto.deserializeValue = deserializeValue
	  $.zepto = zepto
	
	  return $;
	})();
	
	if (typeof global === "undefined") {
	  window.Zepto = Zepto;
	}
	
	;(function($){
	  function detect(ua){
	    var os = this.os = {}, browser = this.browser = {},
	      webkit = ua.match(/WebKit\/([\d.]+)/),
	      android = ua.match(/(Android)(\s+|\/)([\d.]+)/),
	      ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
	      iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
	      webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
	      touchpad = webos && ua.match(/TouchPad/),
	      kindle = ua.match(/Kindle\/([\d.]+)/),
	      silk = ua.match(/Silk\/([\d._]+)/),
	      blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
	      bb10 = ua.match(/(BB10).*Version\/([\d.]+)/),
	      rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/),
	      playbook = ua.match(/PlayBook/),
	      chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/),
	      firefox = ua.match(/Firefox\/([\d.]+)/)
	
	    // Todo: clean this up with a better OS/browser seperation:
	    // - discern (more) between multiple browsers on android
	    // - decide if kindle fire in silk mode is android or not
	    // - Firefox on Android doesn't specify the Android version
	    // - possibly devide in os, device and browser hashes
	
	    if (browser.webkit = !!webkit) browser.version = webkit[1]
	
	    if (android) os.android = true, os.version = android[3]
	    if (iphone) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
	    if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
	    if (webos) os.webos = true, os.version = webos[2]
	    if (touchpad) os.touchpad = true
	    if (blackberry) os.blackberry = true, os.version = blackberry[2]
	    if (bb10) os.bb10 = true, os.version = bb10[2]
	    if (rimtabletos) os.rimtabletos = true, os.version = rimtabletos[2]
	    if (playbook) browser.playbook = true
	    if (kindle) os.kindle = true, os.version = kindle[1]
	    if (silk) browser.silk = true, browser.version = silk[1]
	    if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true
	    if (chrome) browser.chrome = true, browser.version = chrome[1]
	    if (firefox) browser.firefox = true, browser.version = firefox[1]
	
	    os.tablet = !!(ipad || playbook || (android && !ua.match(/Mobile/)) || (firefox && ua.match(/Tablet/)))
	    os.phone  = !!(!os.tablet && (android || iphone || webos || blackberry || bb10 ||
	      (chrome && ua.match(/Android/)) || (chrome && ua.match(/CriOS\/([\d.]+)/)) || (firefox && ua.match(/Mobile/))))
	  }
	
	  detect.call($, navigator.userAgent)
	  // make available to unit tests
	  $.__detect = detect
	
	})(Zepto)
	
	;(function($){
	  var $$ = $.zepto.qsa, handlers = {}, _zid = 1, specialEvents={},
	      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }
	
	  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'
	
	  function zid(element) {
	    return element._zid || (element._zid = _zid++)
	  }
	  function findHandlers(element, event, fn, selector) {
	    event = parse(event)
	    if (event.ns) var matcher = matcherFor(event.ns)
	    return (handlers[zid(element)] || []).filter(function(handler) {
	      return handler
	        && (!event.e  || handler.e == event.e)
	        && (!event.ns || matcher.test(handler.ns))
	        && (!fn       || zid(handler.fn) === zid(fn))
	        && (!selector || handler.sel == selector)
	    })
	  }
	  function parse(event) {
	    var parts = ('' + event).split('.')
	    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
	  }
	  function matcherFor(ns) {
	    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
	  }
	
	  function eachEvent(events, fn, iterator){
	    if ($.type(events) != "string") $.each(events, iterator)
	    else events.split(/\s/).forEach(function(type){ iterator(type, fn) })
	  }
	
	  function eventCapture(handler, captureSetting) {
	    return handler.del &&
	      (handler.e == 'focus' || handler.e == 'blur') ||
	      !!captureSetting
	  }
	
	  function realEvent(type) {
	    return hover[type] || type
	  }
	
	  function add(element, events, fn, selector, getDelegate, capture){
	    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
	    eachEvent(events, fn, function(event, fn){
	      var handler   = parse(event)
	      handler.fn    = fn
	      handler.sel   = selector
	      // emulate mouseenter, mouseleave
	      if (handler.e in hover) fn = function(e){
	        var related = e.relatedTarget
	        if (!related || (related !== this && !$.contains(this, related)))
	          return handler.fn.apply(this, arguments)
	      }
	      handler.del   = getDelegate && getDelegate(fn, event)
	      var callback  = handler.del || fn
	      handler.proxy = function (e) {
	        var result = callback.apply(element, [e].concat(e.data))
	        if (result === false) e.preventDefault(), e.stopPropagation()
	        return result
	      }
	      handler.i = set.length
	      set.push(handler)
	      if(element.addEventListener)
	      element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
	      else
	        element.attachEvent("on"+realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
	    })
	  }
	  function remove(element, events, fn, selector, capture){
	    var id = zid(element)
	    eachEvent(events || '', fn, function(event, fn){
	      findHandlers(element, event, fn, selector).forEach(function(handler){
	        delete handlers[id][handler.i];
	        if(element.removeEventListener)
	        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
	        else
	          element.detachEvent("on"+realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
	      })
	    })
	  }
	
	  $.event = { add: add, remove: remove }
	
	  $.proxy = function(fn, context) {
	    if ($.isFunction(fn)) {
	      var proxyFn = function(){ return fn.apply(context, arguments) }
	      proxyFn._zid = zid(fn)
	      return proxyFn
	    } else if (typeof context == 'string') {
	      return $.proxy(fn[context], fn)
	    } else {
	      throw new TypeError("expected function")
	    }
	  }
	
	  $.fn.bind = function(event, callback){
	    return this.each(function(){
	      add(this, event, callback)
	    })
	  }
	  $.fn.unbind = function(event, callback){
	    return this.each(function(){
	      remove(this, event, callback)
	    })
	  }
	  $.fn.one = function(event, callback){
	    return this.each(function(i, element){
	      add(this, event, callback, null, function(fn, type){
	        return function(){
	          var result = fn.apply(element, arguments)
	          remove(element, type, fn)
	          return result
	        }
	      })
	    })
	  }
	
	  var returnTrue = function(){return true},
	      returnFalse = function(){return false},
	      ignoreProperties = /^([A-Z]|layer[XY]$)/,
	      eventMethods = {
	        preventDefault: 'isDefaultPrevented',
	        stopImmediatePropagation: 'isImmediatePropagationStopped',
	        stopPropagation: 'isPropagationStopped'
	      }
	  function createProxy(event) {
	    var key, proxy = { originalEvent: event }
	    for (key in event)
	      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]
	
	    $.each(eventMethods, function(name, predicate) {
	      proxy[name] = function(){
	        this[predicate] = returnTrue
	        return event[name].apply(event, arguments)
	      }
	      proxy[predicate] = returnFalse
	    })
	    return proxy
	  }
	
	  // emulates the 'defaultPrevented' property for browsers that have none
	  function fix(event) {
	    if (!('defaultPrevented' in event)) {
	      event.defaultPrevented = false
	      var prevent = event.preventDefault
	      event.preventDefault = function() {
	        this.defaultPrevented = true
	        prevent.call(this)
	      }
	    }
	  }
	
	  $.fn.delegate = function(selector, event, callback){
	    return this.each(function(i, element){
	      add(element, event, callback, selector, function(fn){
	        return function(e){
	          var evt, match = $(e.target).closest(selector, element).get(0)
	          if (match) {
	            evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
	            return fn.apply(match, [evt].concat([].slice.call(arguments, 1)))
	          }
	        }
	      })
	    })
	  }
	  $.fn.undelegate = function(selector, event, callback){
	    return this.each(function(){
	      remove(this, event, callback, selector)
	    })
	  }
	
	  $.fn.live = function(event, callback){
	    $(document.body).delegate(this.selector, event, callback)
	    return this
	  }
	  $.fn.die = function(event, callback){
	    $(document.body).undelegate(this.selector, event, callback)
	    return this
	  }
	
	  $.fn.on = function(event, selector, callback){
	    return !selector || $.isFunction(selector) ?
	      this.bind(event, selector || callback) : this.delegate(selector, event, callback)
	  }
	  $.fn.off = function(event, selector, callback){
	    return !selector || $.isFunction(selector) ?
	      this.unbind(event, selector || callback) : this.undelegate(selector, event, callback)
	  }
	
	  $.fn.trigger = function(event, data){
	    if (typeof event == 'string' || $.isPlainObject(event)) event = $.Event(event)
	    fix(event)
	    event.data = data
	    return this.each(function(){
	      // items in the collection might not be DOM elements
	      // (todo: possibly support events on plain old objects)
	      if('dispatchEvent' in this) this.dispatchEvent(event)
	    })
	  }
	
	  // triggers event handlers on current element just as if an event occurred,
	  // doesn't trigger an actual event, doesn't bubble
	  $.fn.triggerHandler = function(event, data){
	    var e, result
	    this.each(function(i, element){
	      e = createProxy(typeof event == 'string' ? $.Event(event) : event)
	      e.data = data
	      e.target = element
	      $.each(findHandlers(element, event.type || event), function(i, handler){
	        result = handler.proxy(e)
	        if (e.isImmediatePropagationStopped()) return false
	      })
	    })
	    return result
	  }
	
	  // shortcut methods for `.bind(event, fn)` for each event type
	  ;('focusin focusout load resize scroll unload click dblclick '+
	  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
	  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
	    $.fn[event] = function(callback) {
	      return callback ?
	        this.bind(event, callback) :
	        this.trigger(event)
	    }
	  })
	
	  ;['focus', 'blur'].forEach(function(name) {
	    $.fn[name] = function(callback) {
	      if (callback) this.bind(name, callback)
	      else this.each(function(){
	        try { this[name]() }
	        catch(e) {}
	      })
	      return this
	    }
	  })
	
	  $.Event = function(type, props) {
	    if (typeof type != 'string') props = type, type = props.type
	    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
	    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
	    event.initEvent(type, bubbles, true, null, null, null, null, null, null, null, null, null, null, null, null)
	    event.isDefaultPrevented = function(){ return this.defaultPrevented }
	    return event
	  }
	
	})(Zepto);
	
	;
	(function($) {
	  var jsonpObj, gcGet, paramToStr, createFunName, callError, callSuccess, callComplete;
	
	  gcGet = function(callbackName, script) {
	    script.parentNode.removeChild(script);
	    window[callbackName] = undefined;
	    try {
	      delete window[callbackName];
	    } catch (e) {}
	  };
	
	  paramToStr = function(parameters, encodeURI) {
	    var str = "",
	      key, parameter;
	    for (key in parameters) {
	      if (parameters.hasOwnProperty(key)) {
	        key = encodeURI ? encodeURIComponent(key) : key;
	        parameter = encodeURI ? encodeURIComponent(parameters[key]) : parameters[key];
	        str += key + "=" + parameter + "&";
	      }
	    }
	    return str.replace(/&$/, "");
	  };
	
	  createFunName = function() {
	    return "cb_" + tvp.$.createGUID(16);
	  };
	
	  callError = function(callback, errorMsg) {
	    if (typeof(callback) !== 'undefined') {
	      callback(errorMsg);
	    }
	  };
	
	  callSuccess = function(callback, data) {
	    if (typeof(callback) !== 'undefined') {
	      callback(data);
	    }
	  };
	
	  callComplete = function(callback) {
	    if (typeof(callback) !== 'undefined') {
	      callback();
	    }
	  };
	
	  jsonpObj = {};
	  jsonpObj.init = function(options) {
	    var key;
	    for (key in options) {
	      if (options.hasOwnProperty(key)) {
	        jsonpObj.options[key] = options[key];
	      }
	    }
	    return true;
	  };
	
	  jsonpObj.get = function(options) {
	    options = options || {};
	    var url = options.url,
	      callbackParameter = options.callbackParameter || 'callback',
	      parameters = options.data || {}, script = document.createElement('script'),
	      callbackName = options.jsonpCallback || createFunName(),
	      prefix = "?";
	
	    if (!url) {
	      return;
	    }
	
	    parameters[callbackParameter] = callbackName;
	    if (url.indexOf("?") >= 0) {
	      prefix = "&";
	    }
	    url += prefix + paramToStr(parameters, true);
	    url = url.replace(/=\?/, '=' + callbackName);
	
	    window[callbackName] = function(data) {
	      if (typeof(data) === 'undefined') {
	        callError(options.error, 'Invalid JSON data returned');
	      } else {
	        callSuccess(options.success, data);
	      }
	      gcGet(callbackName, script);
	      callComplete(options.complete);
	    };
	    script.setAttribute('src', url);
	    document.getElementsByTagName('head')[0].appendChild(script);
	
	    script.onerror = function() {
	      gcGet(callbackName, script);
	      callComplete(options.complete);
	      callError(options.error, 'Error while trying to access the URL');
	    }
	  };
	
	  $.ajax = jsonpObj.get;
	
	})(Zepto);
	
	/**
	 * zepto 兼容ie
	 */
	;(function($){
	  // __proto__ doesn't exist on IE<11, so redefine
	  // the Z function to use object extension instead
	  if (!('__proto__' in {})) {
	    $.extend($.zepto, {
	      Z: function(dom, selector){
	        dom = dom || []
	        $.extend(dom, $.fn)
	        dom.selector = selector || ''
	        dom.__Z = true
	        return dom
	      },
	      // this is a kludge but works
	      isZ: function(object){
	        return $.type(object) === 'array' && '__Z' in object
	      }
	    })
	  }
	
	  // getComputedStyle shouldn't freak out when called
	  // without a valid element as argument
	  if (typeof window.getComputedStyle == 'function'){
	  	try {
		    getComputedStyle(undefined)
		  } catch(e) {
		    var nativeGetComputedStyle = window.getComputedStyle;
		    window.getComputedStyle = function(element){
		      try {
		        return nativeGetComputedStyle.apply(window,arguments);
		      } catch(e) {
		        return null
		      }
		    }
		  }
	  }
	})(Zepto);
	/**
	 * @fileOverview 腾讯视频云播放器 tvp根节点定义
	 */
	
	/**
	 * @namespace tvp
	 * @type {object}
	 */
	var tvp = {};
	
	/**
	 * 最后一次更改时间，grunt自动维护，不需要手动修改
	 * @type String
	 */
	tvp.lastModify = "2014-12-02 14:43:05";
	
	
	/**
	 * 最后build的版本号，不需要手动修改，每次使用grunt合并或者编译，都会自动+1
	 * @type String
	 */
	tvp.ver = "$V2.0Build2050$";
	/**
	 * 框架名称
	 * @type {String}
	 */
	tvp.name = "腾讯视频统一播放器";
	
	//借助uglify可以实现条件编译，比如if(DEBUG){console.log("test")}
	//如果uglify设置DEBUG为false，那么整个语句都不会出现在最终relase的代码文件中
	typeof DEBUG == "undefined" && (DEBUG = 1);
	if (typeof FILEPATH == "undefined") {
		if (DEBUG) {
			if (document.location.hostname == "popotang.qq.com" || document.location.hostname == "qqlive.oa.com") {
				FILEPATH = "../js/";
			} else {
				FILEPATH = "http://imgcache.gtimg.cn/tencentvideo_v1/tvp/js/";
			}
		}
	}
	/**
	 * 解决非qq.com域名使用iframe的形式嵌入我们的页面报错的bug
	 * @type 
	 */
	var top = window.top;
	if(top != window){
		try{
			tvp.topurl = top.location.href;
		}
		catch(e){
			top = window;
		}
	}
	
	tvp.log = function(msg) {
		if (DEBUG && document.getElementById('tvp_debug_console') != null) {
			var debugN = document.getElementById('tvp_debug_console');
			debugN.innerHTML += msg + " | ";
		} else if (window.console) {
			window.console.log("[" + (tvp.log.debugid++) + "] " + msg);
		}
	}
	/**
	 * 打印调试日志
	 *
	 * @param {}
	 *          msg
	 */
	tvp.debug = function(msg) {
		if (!DEBUG && tvp.log.isDebug === -1) {
			tvp.log.isDebug = tvp.$.getUrlParam("debug") == "true" ? 1 : 0;
		}
		if (DEBUG || !! tvp.log.isDebug) {
			tvp.log(msg);
		}
	}
	/**
	 * @ignore
	 * @type
	 * @example
	 * -1表示根据URL参数，1表示调试，0表示非调试，建议-1
	 */
	tvp.log.isDebug = -1;
	/**
	 * @ignore
	 * @type Number
	 */
	tvp.log.debugid = 1;
	
	//设备上报参数
	tvp.DEVICE = {
		aphone: 1,
		iphone: 2,
		ipad: 3,
		other: 0
	};
	//平台上报参数
	tvp.PLATFORM = {
		wechat: 1,
		mqq: 2,
		qqbrowser: 3,
		other: 0
	};
	
	//appid 配置
	tvp.APPID = {
		wechatPublic:10000,
		news:10001,
		qqmusic:10007
	};
	
	/**
	 * 统一播放器，自定义事件定义
	 * @type Object 
	 */
	tvp.ACTION = {
		/**
		 * 在create方法中确认了要使用h5点播播放器时触发
		 * @type String
		 */
		onVodH5Init : "tvp:vodhtml5:beforeInit",
		/**
		 * 当flash播放器完成初始化时触发
		 * @type String
		 */
		onFlashPlayerInited : "tvp:flash:inited"
	};
	(function() {
	  var Deferred, PENDING, REJECTED, RESOLVED, VERSION, after, execute, flatten, has, installInto, isArguments, wrap, _when,
	    __slice = [].slice;
	  VERSION = '1.3.2', PENDING = "pending", RESOLVED = "resolved", REJECTED = "rejected";
	
	
	  has = function(obj, prop) {
	    return obj != null ? obj.hasOwnProperty(prop) : void 0;
	  };
	
	  function isArray(value) {
	    return value instanceof Array
	  }
	  isArguments = function(obj) {
	    return has(obj, 'length') && has(obj, 'callee');
	  };
	
	  flatten = function(array) {
	    if (isArguments(array)) {
	      return flatten(Array.prototype.slice.call(array));
	    }
	    if (!isArray(array)) {
	      return [array];
	    }
	    return array.reduce(function(memo, value) {
	      if (isArray(value)) {
	        return memo.concat(flatten(value));
	      }
	      memo.push(value);
	      return memo;
	    }, []);
	  };
	
	  after = function(times, func) {
	    if (times <= 0) {
	      return func();
	    }
	    return function() {
	      if (--times < 1) {
	        return func.apply(this, arguments);
	      }
	    };
	  };
	
	  wrap = function(func, wrapper) {
	    return function() {
	      var args;
	      args = [func].concat(Array.prototype.slice.call(arguments, 0));
	      return wrapper.apply(this, args);
	    };
	  };
	
	  execute = function(callbacks, args, context) {
	    var callback, _i, _len, _ref, _results;
	    _ref = flatten(callbacks);
	    _results = [];
	    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	      callback = _ref[_i];
	      _results.push(callback.call.apply(callback, [context].concat(__slice.call(args))));
	    }
	    return _results;
	  };
	
	  Deferred = function() {
	    var alwaysCallbacks, close, closingArguments, doneCallbacks, failCallbacks, state;
	    state = PENDING;
	    doneCallbacks = [];
	    failCallbacks = [];
	    alwaysCallbacks = [];
	    closingArguments = {};
	    this.promise = function(candidate) {
	      var pipe, storeCallbacks;
	      candidate = candidate || {};
	      candidate.state = function() {
	        return state;
	      };
	      storeCallbacks = function(shouldExecuteImmediately, holder) {
	        return function() {
	          if (state === PENDING) {
	            holder.push.apply(holder, flatten(arguments));
	          }
	          if (shouldExecuteImmediately()) {
	            execute(arguments, closingArguments);
	          }
	          return candidate;
	        };
	      };
	      candidate.done = storeCallbacks((function() {
	        return state === RESOLVED;
	      }), doneCallbacks);
	      candidate.fail = storeCallbacks((function() {
	        return state === REJECTED;
	      }), failCallbacks);
	      candidate.always = storeCallbacks((function() {
	        return state !== PENDING;
	      }), alwaysCallbacks);
	      pipe = function(doneFilter, failFilter) {
	        var deferred, filter;
	        deferred = new Deferred();
	        filter = function(target, source, filter) {
	          if (filter) {
	            return target(function() {
	              return source(filter.apply(null, flatten(arguments)));
	            });
	          } else {
	            return target(function() {
	              return source.apply(null, flatten(arguments));
	            });
	          }
	        };
	        filter(candidate.done, deferred.resolve, doneFilter);
	        filter(candidate.fail, deferred.reject, failFilter);
	        return deferred;
	      };
	      candidate.pipe = pipe;
	      candidate.then = pipe;
	      return candidate;
	    };
	    this.promise(this);
	    close = function(finalState, callbacks, context) {
	      return function() {
	        if (state === PENDING) {
	          state = finalState;
	          closingArguments = arguments;
	          execute([callbacks, alwaysCallbacks], closingArguments, context);
	        }
	        return this;
	      };
	    };
	    this.resolve = close(RESOLVED, doneCallbacks);
	    this.reject = close(REJECTED, failCallbacks);
	    this.resolveWith = function() {
	      var args, context;
	      context = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
	      return close(RESOLVED, doneCallbacks, context).apply(null, args);
	    };
	    this.rejectWith = function() {
	      var args, context;
	      context = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
	      return close(REJECTED, failCallbacks, context).apply(null, args);
	    };
	    return this;
	  };
	
	  _when = function() {
	    var def, defs, finish, trigger, _i, _j, _len, _len1;
	    trigger = new Deferred();
	    defs = flatten(arguments);
	    finish = after(defs.length, trigger.resolve);
	    for (_i = 0, _len = defs.length; _i < _len; _i++) {
	      def = defs[_i];
	      def.done(finish);
	    }
	    for (_j = 0, _len1 = defs.length; _j < _len1; _j++) {
	      def = defs[_j];
	      //修复使用when时走fail分支不带参数的bug-jarvanxing-2014-6-12 
	      def.fail(function(errorCode,errorContent) {
	        return trigger.reject(errorCode,errorContent);
	      });
	    }
	    return trigger.promise();
	  };
	
	  installInto = function(fw) {
	    fw.Deferred = function() {
	      return new Deferred();
	    };
	    fw.ajax = wrap(fw.ajax, function(ajax, options) {
	      var createWrapper, def;
	      if (options == null) {
	        options = {};
	      }
	      def = new Deferred();
	      createWrapper = function(wrapped, finisher) {
	        return wrap(wrapped, function() {
	          var args, func;
	          func = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
	          if (func) {
	            func.apply(null, args);
	          }
	          return finisher.apply(null, args);
	        });
	      };
	      options.success = createWrapper(options.success, def.resolve);
	      options.error = createWrapper(options.error, def.reject);
	      ajax(options);
	      return def.promise();
	    });
	    return fw.when = _when;
	  };
	
	  if (typeof exports !== 'undefined') {
	    exports.Deferred = function() {
	      return new Deferred();
	    };
	    exports.when = _when;
	    exports.installInto = installInto;
	  } else {
	    this.Deferred = function() {
	      return new Deferred();
	    };
	    this.Deferred.when = _when;
	    this.Deferred.installInto = installInto;
	    this.DeferedClass = Deferred;
	  }
	
	}).call(tvp);
	
	
	tvp.Deferred.installInto(typeof Zepto != "undefined" ? Zepto : jq);
	;
	(function($) {
		$.param = function(obj, prefix) {
			var str = [];
	
			for (var p in obj) {
	
				if ($.isFunction(obj[p]))
					continue;
				var k = prefix ? prefix + "[" + p + "]" : p,
					v = obj[p];
				str.push($.isPlainObject(v) ? $.param(v, k) : (k) + "=" + encodeURIComponent(v));
			}
	
			return str.join("&");
		};
	
	})(Zepto)
	/**
	 * @fileOverview 腾讯视频云播放器 引入jquery
	 */
	
	/*
	 * @include "./tvp.define.js" @include "../../extend/zepto.js"
	 */
	
	/**
	 * 定义辅助函数
	 *
	 * @namespace tvp.$
	 *
	 */
	;
	var _isUseInnerZepto = false;
	if (typeof Zepto != "undefined" && !!Zepto._tvp) {
		tvp.$ = Zepto;
		_isUseInnerZepto = true;
	}
	else {
		tvp.$ = {};
		_isUseInnerZepto = false;
	}
	
	;
	(function() {
		if(_isUseInnerZepto){
			return ;
		}
		
		else if (typeof window["Zepto"] === "function") {
			tvp.$ = window["Zepto"];
			return;
		}
	
		else if (typeof window["jQuery"] === "function" && typeof window["jQuery"].Deferred === "function") {
			tvp.$ = window["jQuery"];
			if (!tvp.$.os && typeof Zepto != "undefined" && Zepto.__detect) {
				Zepto.__detect.call(tvp.$, navigator.userAgent);
			}
			return;
		}
	
		else if (typeof window["jq"] === "function") {
			tvp.$ = window["jq"];
			if (!tvp.$.os && typeof Zepto != "undefined" && Zepto.__detect) {
				Zepto.__detect.call(tvp.$, navigator.userAgent);
			}
		}
	
	})();
	
	// fix some broswer has no document.DOCUMENT_NODE attribute
	;
	(function() {
		if (typeof document.DOCUMENT_NODE == "undefined") {
			document.DOCUMENT_NODE = 9;
		}
	})()
	
	/**
	 * 扩展浏览器和操作系统判断
	 */
	;
	(function($) {
		function detect(ua) {
	
			var MQQBrowser = ua.match(/MQQBrowser\/(\d+\.\d+)/i),
				MQQClient = ua.match(/QQ\/(\d+\.(\d+)\.(\d+)\.(\d+))/i) || ua.match(/V1_AND_SQ_([\d\.]+)/),
				WeChat = ua.match(/MicroMessenger\/((\d+)\.(\d+))\.(\d+)/) || ua.match(/MicroMessenger\/((\d+)\.(\d+))/),
				MacOS = ua.match(/Mac\sOS\sX\s(\d+\.\d+)/),
				WinOS = ua.match(/Windows(\s+\w+)?\s+?(\d+\.\d+)/),
				MiuiBrowser = ua.match(/MiuiBrowser\/(\d+\.\d+)/i),
				M1 = ua.match(/MI-ONE/),
				MIPAD = ua.match(/MI PAD/),
				UC = ua.match(/UCBrowser\/(\d+\.\d+(\.\d+\.\d+)?)/) || ua.match(/\sUC\s/),
				IEMobile = ua.match(/IEMobile(\/|\s+)(\d+\.\d+)/) || ua.match(/WPDesktop/),
				// ipod = ua.match(/(ipod\sOS)\s([\d_]+)/),
				ipod = ua.match(/(ipod).*\s([\d_]+)/i),
				iphone = ua.match(/(iphone)\sos\s([\d_]+)/i),
				Chrome = ua.match(/Chrome\/(\d+\.\d+)/),
				AndriodBrowser = ua.match(/Mozilla.*Linux.*Android.*AppleWebKit.*Mobile Safari/),
				android = ua.match(/(android)\s([\d\.]+)/i),
				HTC = ua.indexOf("HTC") > -1;
	
			$.browser = $.browser || {}, $.os = $.os || {};
			// 扩展ie判断
			if (window.ActiveXObject) {
				var vie = 6;
				(window.XMLHttpRequest || (ua.indexOf('MSIE 7.0') > -1)) && (vie = 7);
				(window.XDomainRequest || (ua.indexOf('Trident/4.0') > -1)) && (vie = 8);
				(ua.indexOf('Trident/5.0') > -1) && (vie = 9);
				(ua.indexOf('Trident/6.0') > -1) && (vie = 10);
				$.browser.ie = true, $.browser.version = vie;
			}
			else if (ua.indexOf('Trident/7.0') > -1) {
				$.browser.ie = true, $.browser.version = 11;
			}
	
			if(android){
				this.os.android = true;
				this.os.version = android[2];
			}
			if (ipod){
				this.os.ios = this.os.ipod = true;
				this.os.version = ipod[2].replace(/_/g, '.');
			}
			if(iphone){
				this.os.iphone = this.os.ios = true;
				this.os.version = iphone[2].replace(/_/g,'.');
			}
			// windows 系统
			if (WinOS)
				this.os.windows = true, this.os.version = WinOS[2];
			// Mac系统
			if (MacOS)
				this.os.Mac = true, this.os.version = MacOS[1];
			// 乐Pad
			if (ua.indexOf("lepad_hls") > 0)
				this.os.LePad = true;
			// 小米pad
			if (MIPAD)
				this.os.MIPAD = true;
			// 补充一些国内主流的手机浏览器
			// 手机QQ浏览器
			if (MQQBrowser)
				this.browser.MQQ = true, this.browser.version = MQQBrowser[1];
			// IOS手机QQ打开
			if (MQQClient)
				this.browser.MQQClient = true, this.browser.version = MQQClient[1];
			// 微信
			if (WeChat)
				this.browser.WeChat = true, this.browser.version = WeChat[1];
			// MIUI自带浏览器
			if (MiuiBrowser)
				this.browser.MIUI = true, this.browser.version = MiuiBrowser[1];
			// UC浏览器
			if (UC)
				this.browser.UC = true, this.browser.version = UC[1] || NaN;
			// IEMobile
			if (IEMobile)
				this.browser.IEMobile = true, this.browser.version = IEMobile[2];
			// android default browser
			if (AndriodBrowser) {
				this.browser.AndriodBrowser = true;
			}
			// for 小米1
			if (M1) {
				this.browser.M1 = true;
			}
			// chrome
			if (Chrome) {
				this.browser.Chrome = true, this.browser.version = Chrome[1];
			}
			if (this.os.windows) {
				if (typeof navigator.platform != "undefined" && navigator.platform.toLowerCase() == "win64") {
					this.os.win64 = true;
				}
				else {
					this.os.win64 = false;
				}
			}
	
			var osType = {
				iPad7 : 'iPad; CPU OS 7',
				LePad : 'lepad_hls',
				XiaoMi : 'MI-ONE',
				SonyDTV : "SonyDTV",
				SamSung : 'SAMSUNG',
				HTC : 'HTC',
				VIVO : 'vivo'
			}
	
			for (var os in osType) {
				this.os[os] = (ua.indexOf(osType[os]) !== -1);
			}
			// 修正wp手机识别
			$.os.phone = $.os.phone || /windows phone/i.test(ua);
	
			this.os.getNumVersion = function() {
				return parseFloat($.os.version, "10");
			}
	
			// 当前系统是否支持触屏触摸,ios5以下的版本touch支持有问题，当作不支持来处理
			this.os.hasTouch = 'ontouchstart' in window;
			if (this.os.hasTouch && this.os.ios && this.os.getNumVersion() < 6) {
				this.os.hasTouch = false;
			}
	
			// 微信4.5 tap事件有问题
			if ($.browser.WeChat && $.browser.version < 5.0) {
				this.os.hasTouch = false;
			}
	
			$.extend($.browser, {
				        /**
				         * 获取数字格式的版本号
				         */
				        getNumVersion : function() {
					        return parseFloat($.browser.version, "10");
				        },
				        /**
				         * 是否是受支持的firefox版本
				         *
				         * @memberOf QQLive.browser
				         * @return {Boolean}
				         */
				        isFFCanOcx : function() {
					        if (!!$.browser.firefox && $.browser.getNumVersion() >= 3.0) {
						        return true;
					        }
					        return false;
				        },
				        /**
				         * 当前浏览器是否支持QQLive
				         */
				        isCanOcx : function() {
					        return (!!$.os.windows && (!!$.browser.ie || $.browser.isFFCanOcx() || !!$.browser.webkit));
				        },
				        /**
				         * 是否是支持的非IE浏览器
				         */
				        isNotIESupport : function() {
					        return (!!$.os.windows && (!!$.browser.webkit || $.browser.isFFCanOcx()));
				        }
			        });
	
			// 兼容老的userAgent接口
			$.userAgent = {};
			$.extend($.userAgent, $.os);
			$.extend($.userAgent, $.browser);
			$.userAgent.browserVersion = $.browser.version;
			$.userAgent.osVersion = $.os.version;
			delete $.userAgent.version;
	
		}
		detect.call($, navigator.userAgent);
	})(tvp.$);
	
	/**
	 * 扩展静态基本函数
	 */
	;
	(function($) {
		var extFun = {
			/**
			 * 单独根据id获取dom元素
			 */
			getByID : function(id) {
				return document.getElementById(id);
			},
			/**
			 * 空函数
			 *
			 * @lends tvp.$
			 */
			noop : function() {
			},
			/**
			 * 是否是字符串
			 *
			 * @lends tvp.$
			 */
			isString : function(val) {
				return $.type(val) === "string";
			},
			/**
			 * 是否未定义
			 *
			 * @lends tvp.$
			 */
			isUndefined : function(val) {
				return $.type(val) === "undefined";
			},
			/**
			 * 获取当前毫秒
			 *
			 * @lends tvp.$
			 * @return {Number}
			 */
			now : function() {
				return new Date().getTime();
			},
	
			/**
			 * 获取标准日期格式的时间
			 */
			getISOTimeFormat : function() {
				var date = new Date(),
					y = date.getFullYear(),
					m = date.getMonth() + 1,
					d = date.getDate(),
					// 
					h = date.getHours(),
					M = date.getMinutes(),
					s = date.getSeconds();
				return [[y, m < 10 ? "0" + m : m, d < 10 ? "0" + d : d].join("-"), [h < 10 ? "0" + h : h, M < 10 ? "0" + M : M, s < 10 ? "0" + s : s].join(":")].join(" ");
			},
			/**
			 * 格式化秒
			 */
			formatSeconds : function(seconds) {
				seconds = parseInt(seconds);
				var M = parseInt(seconds / 60),
					h = M >= 60 ? parseInt(M / 60) : 0,
					s = seconds % 60,
					str = "";
				M >= 60 && (M = M % 60);
				if (h > 0) {
					str += h < 10 ? "0" + h : h;
					str += ":";
				}
				str += M < 10 ? "0" + M : M;
				str += ":"
				str += s < 10 ? "0" + s : s;
				return str;
			},
			/**
			 * 把时长转成1小时30分50秒的形式
			 * @param  {[type]} seconds [description]
			 * @return {[type]}         [description]
			 */
			formatSecondsWithText : function(seconds) {
				var str = this.formatSeconds(seconds),
					arr = str.split(':'),
					res = '';
				switch (arr.length) {
					case 1 :
						res = arr[0] + '秒';
						break;
					case 2 :
						res = arr[0] + "分" + arr[1] + "秒";
						break;
					case 3 :
						res = arr[0] + "小时" + arr[1] + "分" + arr[2] + "秒";
						break;
					default :
						res = str;
				}
	
				return res;
			},
	
			/**
			 * 把bytes转成23.2M这种
			 * @return {[type]} [description]
			 */
			formatFileSize : function(bytes) {
				bytes = parseInt(bytes, 10);
				bytes = bytes / 1024 / 1024;
				bytes = bytes.toFixed(1);
				return bytes + 'M';
			},
			/**
			 * 获取当前域名真实的host
			 */
			getHost : function() {
				var _host = window.location.hostname || window.location.host,
					_sarray = location.host.split(".");
				if (_sarray.length > 1) {
					_host = _sarray.slice(_sarray.length - 2).join(".");
				}
				return _host;
			},
			/**
			 * 从URL中获取指定的参数值
			 *
			 * @memberOf Live
			 * @param {String}
			 *          p url参数
			 * @param {String}
			 *          u url 默认为当前url，可为空，如果传入该变量，将从该变量中查找参数p
			 * @return {String} 返回的参数值
			 */
			getUrlParam : function(p, u) {
				u = u || document.location.toString();
				var reg = new RegExp("(^|&|\\\\?)" + p + "=([^&]*)(&|$|#)"),
					r = null;
				if (r = u.match(reg))
					return r[2];
				return "";
			},
			/**
			 * 设置url中指定的参数
			 *
			 * @param {string}
			 *          name [参数名]
			 * @param {string}
			 *          value [参数值]
			 * @param {string}
			 *          url [发生替换的url地址|默认为location.href]
			 * @return {string} [返回处理后的url]
			 */
			setUrlParam : function(name, value, url) {
				url = url || location.href;
				var reg = new RegExp('[\?&#]' + name + '=([^&#]+)', 'gi'),
					matches = url.match(reg), strArr, extra,
					key = '{key' + new Date().getTime() + '}';
				if (matches && matches.length > 0) {
					strArr = (matches[matches.length - 1]);
				}
				else {
					strArr = '';
				}
	
				extra = name + '=' + value;
	
				// 当原url中含有要替换的属性:value不为空时，仅对值做替换,为空时，直接把参数删除掉
				if (strArr) {
					var first = strArr.charAt(0);
					url = url.replace(strArr, key);
					url = url.replace(key, value ? first + extra : '');
				}
				// 当原url中不含有要替换的属性且value值不为空时,直接在url后面添加参数字符串
				else if (value) {
	
					if (url.indexOf('?') > -1) {
						url += '&' + extra;
					}
					else {
						url += '?' + extra;
					}
				}
	
				// 其它情况直接返回原url
				return url;
			},
			/**
			 * 过滤XSS
			 *
			 * @param {string}
			 *          str
			 * @return {}
			 */
			filterXSS : function(str) {
				if (!$.isString(str))
					return str;
				return str.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/\'/g, "&apos;");
			},
			/**
			 * 创建GUID字符串
			 *
			 * @return {}
			 */
			createGUID : function(len) {
				len = len || 32;
				var guid = "";
				for (var i = 1; i <= len; i++) {
					var n = Math.floor(Math.random() * 16.0).toString(16);
					guid += n;
				}
				return guid;
			},
			/**
			 * 格式化尺寸
			 * @param  {type} size [description]
			 * @return {type}      [description]
			 */
			formatSize : function(size) {
				var s = "" + size;
				if (s.indexOf("%") > 0)
					return s;
				if (s.indexOf("px") > 0)
					return s;
	
				if (/^\d+$/.test(s))
					return s + "px";
				return s;
			},
			compareVersion : function(n, k) {
				n = String(n).split(".");
				k = String(k).split(".");
				try {
					for (var o = 0, j = Math.max(n.length, k.length); o < j; o++) {
						var m = isFinite(n[o]) && Number(n[o]) || 0,
							p = isFinite(k[o]) && Number(k[o]) || 0;
						if (m < p) {
							return -1
						}
						else {
							if (m > p) {
								return 1
							}
						}
					}
				}
				catch (q) {
					return -1
				}
				return 0
			},
			/**
			 * 判断参数是否是true，诸如//1 ,true ,'true'
			 * @param  {[type]}  v [description]
			 * @return {Boolean}   [description]
			 */
			isTrue : function(v) {
				return eval(tvp.$.filterXSS(v)); // 0 ,1 ,true
													// ,false,'true','false'..
			},
			/**
			 * 根据插件name载入插件对应CSS文件
			 * @return {[type]} [description]
			 */
			loadPluginCss : function(name) {
				var url = "",
					urlArray = tvp.defaultConfig.pluginCssUrl;
				if (name in urlArray) {
					url = tvp.defaultConfig.cssPath + urlArray[name];
				}
				return $.loadCss(url);
	
			},
			/**
			 * [getData 获取本地存储信息]
			 * @param  {[type]} name  [description]
			 * @param  {[type]} value [description]
			 * @return {[type]}       [description]
			 */
			getData : function(name, value) {
				if (window.localStorage) {
					return window.localStorage[name];
				}
			},
			setData : function(name, value) {
				if (window.localStorage) {
					window.localStorage[name] = value;
					return true;
				}
			},
			delData : function(name) {
				if (window.localStorage) {
					window.localStorage.removeItem(name);
					return true;
				}
			},
			formatTpl : function(str, obj) {
				if (!str || $.type(obj) !== 'object')
					return;
				for (var key in obj) {
					var name = '${' + key + '}';
					while (str.indexOf(name) > -1) {
						str = str.replace(name, obj[key]);
					}
				}
				return str;
			},
			/**
			 * 载入CSS文件
			 * @return {[type]} [description]
			 */
			loadCss : function(url) {
				var defer = $.Deferred();
				var isDone = false;
				if (!!url) {
					// 禁止回溯路径
					// 例如:http://imgcache.gtimg.cn/tencentvideo_v1/mobile/v2/style/../../../../qzone/css/play.css
					// 将指向到http://imgcache.gtimg.cn/qzone/css/play.css
					while (url.indexOf("../") >= 0) {
						url = url.replace("../", "");
					}
					url = $.filterXSS(url);
					var doc = document;
					var head = doc.getElementsByTagName("head")[0] || doc.documentElement;
					var baseElement = head.getElementsByTagName("base")[0];
					var node = doc.createElement("link");
					node.rel = "stylesheet";
					node.href = url;
	
					node.onload = node.onerror = function() {
						node.onload = node.onerror = null;
						isDone = true;
						defer.resolve();
					}
					// if ($.browser.WeChat || $.browser.MQQClient || ($.os.ios &&
					// parseInt($.os.version,10) <= 5)) {
					// //onload和onerror不一定触发
					// setTimeout(function() {
					// if (!isDone) {
					// defer.resolve();
					// }
					// }, 2000);
					// }
	
					// onload和onerror不一定触发
					setTimeout(function() {
						        if (!isDone) {
							        defer.resolve();
						        }
					        }, 2500);
	
					baseElement ? head.insertBefore(node, baseElement) : head.appendChild(node);
				}
				else {
					defer.reject();
				}
				return defer;
			}
		}
		$.extend($, extFun);
	})(tvp.$);
	
	/**
	 * 扩展cookies
	 */
	;
	(function($) {
		/**
		 * @leads tvp.$
		 * @name tvp.$.cookie
		 * @type {Object}
		 */
		$.cookie = {
			/**
			 * 设置一个cookie
			 * @param {String}
			 *          name cookie名称
			 * @param {String}
			 *          value cookie值
			 * @param {String}
			 *          domain 所在域名 默认为window.location.host的值
			 * @param {String}
			 *          path 所在路径 默认为是"\"
			 * @param {Number}
			 *          hour 存活时间，单位:小时
			 * @return {Boolean} 是否成功
			 */
			set : function(name, value, domain, path, hour) {
				if (hour) {
					var today = new Date();
					var expire = new Date();
					expire.setTime(today.getTime() + 3600000 * hour);
				}
				document.cookie = name + "=" + value + "; " + (hour ? ("expires=" + expire.toGMTString() + "; ") : "") + (path ? ("path=" + path + "; ") : "path=/; ") + (domain ? ("domain=" + domain + ";") : ("domain=" + window.location.host + ";"));
				return true;
			},
	
			/**
			 * 获取指定名称的cookie值
			 *
			 * @param {String}
			 *          name cookie名称
			 * @return {String} 获取到的cookie值
			 */
			get : function(name) {
				var r = new RegExp("(?:^|;+|\\s+)" + name + "=([^;]*)");
				var m = document.cookie.match(r);
				return (!m ? "" : m[1]);
			},
	
			/**
			 * 删除指定cookie,复写为过期
			 *
			 * @param {String}
			 *          name cookie名称
			 * @param {String}
			 *          domain 所在域 默认为 window.location.host的值
			 * @param {String}
			 *          path 所在路径 默认为是"\"
			 */
			del : function(name, domain, path) {
				var exp = new Date();
				exp.setTime(exp.getTime() - 1);
				document.cookie = name + "=; expires=" + exp.toGMTString() + ";" + (path ? ("path=" + path + "; ") : "path=/; ") + (domain ? ("domain=" + domain + ";") : ("domain=" + window.location.host + ";"));
			}
		}
	})(tvp.$)
	/**
	 * @fileOverview 腾讯视频云播放器 定义tvp下的通用函数接口
	 */
	
	/*
	 * @include "./tvp.define.js"
	 * @include "./tvp.$.js"
	 */
	
	tvp = tvp || {};
	
	/**
	 * 封装通用函数
	 *
	 * @namespace tvp.common
	 * @type {Object}
	 */
	tvp.common = {
		/**
		 * 是否使用HTML5播放器播放
		 */
		isUseHtml5: function() {
			var ua = navigator.userAgent,
				flashVer = tvp.version.getFlashMain(),
				m = null;
	
			if (/ipad|ipod|iphone|lepad_hls|IEMobile|WPDesktop/ig.test(ua)) {
				return true;
			}
			//对于没有安装flash的又非安卓系统同时支持播放mp4文件的就默认使用h5
			if((isNaN(flashVer) || flashVer < 10) && tvp.common.isSupportMP4() && !tvp.$.os.android && (tvp.$.browser.ie && tvp.$.browser.version >= 11)){
				return true;
			}
	
			//Android系统
			if (!!tvp.$.os.android) {
	
				// 如果支持HTML5的<video>标签并且支持H.264解码，则也认为支持HTML5
				if (tvp.common.isSupportMP4()) {
					return true;
				}
	
				//Android下 手机QQ浏览器4.2原生支持HTML5和HLS 对方接口人susiehuang
				if (tvp.$.browser.MQQ && tvp.$.browser.getNumVersion() >= 4.2) {
					return true;
				}
				if (ua.indexOf("MI2") != -1) { // 小米手机4.0支持HTML5
					return true;
				}
	
				//微信4.2版本以上原生支持html5
				if (tvp.$.os.version >= "4" && (m = ua.match(/MicroMessenger\/((\d+)\.(\d+))\.(\d+)/))) {
					if (m[1] >= 4.2) {
						return true;
					}
				}
	
				//安卓4.1基本都支持HTML5了，遇到特例就case by case解决吧
				if (tvp.$.os.version >= "4.1") {
					return true;
				}
			}
	
			return false;
		},
		/**
		 * 是否使用HLS
		 * @return {Boolean} [description]
		 */
		isUseHLS: function() {
			if (tvp.$.os.ios) return true;
		},
		/**
		 * 直播是否用HTML5
		 *
		 * @return {}
		 */
		isLiveUseHTML5: function() {
			if (tvp.$.os.ios) return true;
			if (tvp.$.os.ipad) return true;
			if (!!tvp.$.os.android) {
				if (tvp.common.isSupportM3u8()) {
					return true;
				}
			}
			return false;
		},
		isSupportM3u8: function() {
			var video = document.createElement("video");
			var list = [
				'application/x-mpegURL',
				'audio/mpegurl',
				'vnd.apple.mpegURL',
				'application/vnd.apple.mpegURL'
			];
			var rs = false;
			if (typeof video.canPlayType == "function") {
				tvp.$.each(list, function(i, o) {
					if (video.canPlayType(o)) {
						rs = true;
						return;
					}
				});
			}
			video = null;
			if (!!tvp.$.os.android) {
				//Chrome能播放m3u8但是检测不出
				if (tvp.$.os.version >= "4" && tvp.$.browser.Chrome) {
					rs = true;
				}
	
				//uc9.6以下有问题(小米1)
				// if(tvp.$.browser.UC && tvp.$.compareVersion(tvp.$.browser.version,'9.6') < 0){
				// 	rs = false;
				// }
	
				//小米1除了qq浏览器基本都有问题
				if (tvp.$.browser.M1) {
					rs = false;
				}
	
				//天宇v8播不了
				if (/V8 Build/.test(navigator.userAgent)) {
					rs = false;
				}
	
				//qq浏览器4.2以上总是支持的
				if (tvp.$.browser.MQQ && tvp.$.browser.getNumVersion() >= 4.2) {
					rs = true;
				}
			}
			return rs;
		},
		/**
		 * 是否支持HTML5的MP4解码
		 *
		 * @return {Boolean}
		 */
		isSupportMP4: function() {
			var video = document.createElement("video");
			if (typeof video.canPlayType == "function") {
				//MP4
				if (video.canPlayType('video/mp4; codecs="mp4v.20.8"') == "probably") {
					return true;
				}
				//H.264
				if (video.canPlayType('video/mp4; codecs="avc1.42E01E"') == "probably" || video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') == "probably") {
					return true;
				}
			}
			return false;
		},
		/**
		 * 当前设备是支持SVG
		 * @return {Boolean} [description]
		 */
		isSupportSVG: function() {
			if (!document.implementation || !tvp.$.isFunction(document.implementation.hasFeature)) {
				return false;
			}
			return document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
		},
	
		/**
		 * 是否强制使用MP4直接链接
		 *
		 * @return {Boolean}
		 */
		isEnforceMP4: function() {
			var ua = navigator.userAgent,
				m = null;
			if (!!tvp.$.os.android) {
				if (tvp.$.browser.firefox) {
					return true;
				}
				if (tvp.$.os.version >= "4.0" && tvp.$.browser.MQQ && tvp.$.browser.version < "4.0") { // 手机QQ浏览器3.*版本在Android4无法使用H5和flash
					return true;
				}
			}
			return false;
		},
		/**
		 * 获取当前用户的QQ号码
		 */
		getUin: function() {
			var skey = tvp.$.cookie.get("skey"),
				lskey = tvp.$.cookie.get("lskey"),
				suin = "",
				uin = 0,
				useLeak = false;
			isLeak = typeof(isLeak) == "undefined" ? false : true;
			useLeak = !!isLeak && lskey != "";
	
			if (!useLeak && skey == "") {
				return 0;
			}
	
			suin = tvp.$.cookie.get("uin");
			if (suin == "") {
				if (!!useLeak) {
					suin = tvp.$.cookie.get("luin");
				}
			}
			uin = parseInt(suin.replace(/^o0*/g, ""), 10);
			if (isNaN(uin) || uin <= 10000) {
				return 0;
			}
			return uin;
		},
		/**
		 * 获取登录的skey
		 *
		 * @return {}
		 */
		getSKey: function() {
			var skey = tvp.$.cookie.get("skey"),
				lskey = tvp.$.cookie.get("lskey"),
				key = "";
			if (!!isLeak) {
				if (skey != "" && lskey != "") {
					key = [skey, lskey].join(";");
				} else {
					key = skey || lskey;
				}
			} else {
				key = skey;
			}
			return key;
		},
		/**
		 * 打开登录框
		 */
		openLogin: function() {
	
		},
		/**
		 * 获取指定视频vid的截图
		 *
		 * @param {string}
		 *          lpszVID 视频vid
		 * @param {number}
		 *          idx 视频看点 默认是0
		 * @return {string} 视频截图
		 */
		getVideoSnap: function(lpszVID, idx) {
			var szPic;
			var uin;
			var hash_bucket = 10000 * 10000;
			var object = lpszVID;
	
			if (lpszVID.indexOf("_") > 0) {
				var arr = lpszVID.split("_");
				lpszVID = arr[0];
				idx = parseInt(arr[1]);
			}
	
			var uint_max = 0x00ffffffff + 1;
			var hash_bucket = 10000 * 10000;
			var tot = 0;
			for (var inx = 0; inx < lpszVID.length; inx++) {
				var nchar = lpszVID.charCodeAt(inx);
				tot = (tot * 32) + tot + nchar;
				if (tot >= uint_max) tot = tot % uint_max;
			}
			uin = tot % hash_bucket;
			if (idx == undefined) idx = 0;
			if (idx == 0) {
				szPic = ["http://vpic.video.qq.com/", uin, "/", lpszVID, "_160_90_3.jpg"].join("");
			} else {
				szPic = ["http://vpic.video.qq.com/", uin, "/", lpszVID, "_", "160_90_", idx, "_1.jpg"].join("");
			}
			return szPic;
		},
		/**
		 * 得到手机设备上用的截图
		 * @param  {[type]} vid   [description]
		 * @param  {[type]} index [description]
		 * @return {[type]}       [description]
		 */
		getVideoSnapMobile:function(vid,index){
			index = index || 0;
			var sizeArr = ['496_280'],
				url = 'http://shp.qpic.cn/qqvideo_ori/0/{vid}_{index}/0';
			return url.replace('{vid}',vid).replace('{index}',sizeArr[index]);
		},
	
		/**
		 * 为了 缩略图 传入错误的情况
		 * @param  {[type]} img [description]
		 * @return {[type]}     [description]
		 */
		picerr:function(img){
			//img.src="http://imgcache.gtimg.cn/tencentvideo_v1/vstyle/mobile/v2/style/img/player/bg_poster.jpg";
		},
	
		/**
		 * 获取设备上报映射id值
		 * @return {Number}
		 */
		getDeviceId: function() {
			var id = tvp.DEVICE.other;
			if (tvp.$.os.iphone) {
				id = tvp.DEVICE.iphone;
			} else if (tvp.$.os.ipad) {
				id = tvp.DEVICE.ipad;
			} else if (tvp.$.os.android && tvp.$.os.phone) {
				id = tvp.DEVICE.aphone;
			}
			return id;
		},
	
		/**
		 * 获取平台上报映射id值
		 * @return {Number}
		 */
		getPlatformId: function() {
			var id = tvp.PLATFORM.other;
			if (tvp.$.browser.WeChat) {
				id = tvp.PLATFORM.wechat;
			} else if (tvp.$.browser.MQQClient) {
				id = tvp.PLATFORM.mqq;
			} else if (tvp.$.browser.MQQ) {
				id = tvp.PLATFORM.qqbrowser;
			}
			return id;
		},
	
		/**
		 * 获取URL参数
		 * @return {Object}
		 */
		getParams: function(url){
			var s_start = url.indexOf('?'),
				_s = url.substring(s_start+1);
			var regx = /\w+=[^&]+/g;
			var _m, _p={}, _t;
			while( (_m=regx.exec(_s))!==null ){
				_t = _m[0].split('=');
				if(_t.length>=2){
					_p[_t.shift()] = _t.join('=')
				}
			}
			return _p;
		}
	};
	
	tvp.version = (function() {
		/** private */
		var vOcx = "0.0.0.0",
			vflash = "0.0.0",
			actObj, reportObj = new Image(),reported = false, needReport = false;
		if(document.location.host == "film.qq.com") {
			needReport = true;
		}
		/**
		 * 将数字格式的控件的版本号转换成标准的带有.符号分隔的版本号
		 */
	
		function changeVerToString(nVer) {
			if (checkVerFormatValid(nVer)) {
				return nVer;
			}
			if (/\d+/i.test(nVer)) {
				var nMain = parseInt(nVer / 10000 / 100, 10);
				var nSub = parseInt(nVer / 10000, 10) - nMain * 100;
				var nReleaseNO = parseInt(nVer, 10) - (nMain * 100 * 10000 + nSub * 10000);
				strVer = nMain + "." + nSub + "." + nReleaseNO;
				return strVer;
			}
			return nVer;
		}
	
		/**
		 * 检查控件版本号是否合法
		 *
		 * @ignore
		 */
	
		function checkVerFormatValid(version) {
			return (/^(\d+\.){2}\d+(\.\d+)?$/.test(version));
		};
	
	
		return {
			/**
			 * 获取用户当前安装的腾讯视频播放器版本
			 * @return {String}
			 */
			getOcx: function(enableCache) {
				// 相当于有个变量做cache，不再重复判断了
				if (tvp.$.isUndefined(enableCache)) {
					enableCache = true;
				}
				if (!!enableCache && vOcx != "0.0.0.0") {
					return vOcx;
				}
				var step;
				// IE
				if (!!tvp.$.browser.ie) {
					try {
						step = "IE begin";
						// 据说这个做成全局的可能减少错误概率
						actObj = new ActiveXObject(QQLive.config.PROGID_QQLIVE_INSTALLER);
						if (typeof actObj.getVersion != "undefined") {
							vOcx = actObj.GetVersionByClsid(QQLive.config.OCX_CLSID);
							step = "get actObj.GetVersionByClsid:"+vOcx;
						} else {
							step = "no function:actObj.GetVersionByClsid";
						}
					} catch (err) {
						needReport && (!reported) && (reported = true) && (reportObj.src = "http://btrace.qq.com/collect?sIp=&iQQ=" + tvp.common.getUin() + "&sBiz=IE&sOp=" + encodeURIComponent(navigator.userAgent) + "&iSta=0&iTy=2432&iFlow=&sUrl=" + encodeURIComponent(location.toString()) + "&sRef=" + encodeURIComponent(document.referrer) + "&sMsg=" + encodeURIComponent(err.message) + "&sStep=" + encodeURIComponent(step) + "&_=" + Math.random());
					}
				} else if (tvp.$.browser.isNotIESupport()) {
					step = "no IE begin";
					var plugs = navigator.plugins,
						plug;
					if (!tvp.$.isUndefined(plugs.namedItem)) {
						step = "plugs.namedItem";
						plug = plugs.namedItem("腾讯视频");
					}
					if (!plug) {
						step = "no plugs.namedItem:tencentvideo";
						// 循环找出腾讯视频的plugins信息
						for (var i = 0, len = plugs.length; i < len; i++) {
							// 找到腾讯视频的plugin信息
							if (plugs[i] && plugs[i].name == "腾讯视频" || plugs[i].filename == "npQQLive.dll") {
								plug = plugs[i];
								break;
							}
						}
					}
					if (!!plug) {
						// FF有version的属性（强烈顶下FF的这个接口）
						// 但是Chrome没有，只能从description中截取，这个描述信息是“version:”开头（跟lexlin约定好的）
						if (!tvp.$.isUndefined(plug.version)) {
							step = "plug.version:" + plug.version;
							vOcx = plug.version;
						} else {
							step = "plug.description:" + plug.description;
							var r;
							var desc = plug.description;
							if (r = desc.match(/version:((\d+\.){3}(\d+)?)/)) {
								vOcx = r[1];
							}
						}
					} else {
						step = "no plugs[i].filename:npQQLive.dll";
					}
				}
				if (!parseInt(vOcx, 10)) {
					needReport && (!reported) && (reported = true) && (reportObj.src = "http://btrace.qq.com/collect?sIp=&iQQ=" + tvp.common.getUin() + "&sBiz=" + (tvp.$.browser.ie ? "IE" : "NOIE") + "&sOp=" + encodeURIComponent(navigator.userAgent) + "&iSta=0&iTy=2432&iFlow=&sUrl=" + encodeURIComponent(location.toString()) + "&sRef=" + encodeURIComponent(document.referrer) + "&sMsg=" + vOcx + "&sStep=" + encodeURIComponent(step) + "&_=" + Math.random());
				}
				vOcx = changeVerToString(vOcx);
				return vOcx;
			},
			/**
			 * 获取当前用户安装的flash插件版本号
			 *
			 *
			 */
			getFlash: function() {
				if (vflash != "0.0.0") {
					return vflash;
				}
				var swf = null,
					ab = null,
					ag = [],
					S = "Shockwave Flash",
					t = navigator,
					q = "application/x-shockwave-flash",
					R = "SWFObjectExprInst"
				if (!!tvp.$.browser.ie) {
					try {
						var step = "IE begin";
						swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
						step = "new ActiveXObject";
						if (swf) {
							ab = swf.GetVariable("$version");
							step = "swf.GetVariable";
							if (ab) {
								ab = ab.split(" ")[1].split(",");
								ag = [parseInt(ab[0], 10), parseInt(ab[1], 10), parseInt(ab[2], 10)]
							}
						}
					} catch (err) {
						needReport && (!reported) && (reported = true) && (reportObj.src = "http://btrace.qq.com/collect?sIp=&iQQ=" + tvp.common.getUin() + "&sBiz=IE&sOp=" + encodeURIComponent(navigator.userAgent) + "&iSta=1&iTy=2432&iFlow=&sUrl=" + encodeURIComponent(location.toString()) + "&sRef=" + encodeURIComponent(document.referrer) + "&sMsg=" + encodeURIComponent(err.message) + "&sStep=" + encodeURIComponent(step) + "&_=" + Math.random());
					}
				} else if (!tvp.$.isUndefined(t.plugins) && typeof t.plugins[S] == "object") {
					var step = "no IE begin";
					ab = t.plugins[S].description;
					step = "plugins[S].description";
					if (ab && !(!tvp.$.isUndefined(t.mimeTypes) && t.mimeTypes[q] && !t.mimeTypes[q].enabledPlugin)) {
						step = "parse description";
						ab = ab.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
						ag[0] = parseInt(ab.replace(/^(.*)\..*$/, "$1"), 10);
						ag[1] = parseInt(ab.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
						ag[2] = /[a-zA-Z]/.test(ab) ? parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0;
					} else {
						step = "no mimeTypes or disable";
					}
				}
				vflash = ag.join(".");
				if (!parseInt(vflash, 10)) {
					needReport && (!reported) && (reported = true) && (reportObj.src = "http://btrace.qq.com/collect?sIp=&iQQ=" + tvp.common.getUin() + "&sBiz=" + (tvp.$.browser.ie ? "IE" : "NOIE") + "&sOp=" + encodeURIComponent(navigator.userAgent) + "&iSta=1&iTy=2432&iFlow=&sUrl=" + encodeURIComponent(location.toString()) + "&sRef=" + encodeURIComponent(document.referrer) + "&sMsg=" + vflash + "&sStep=" + encodeURIComponent(step) + "&_=" + Math.random());
				}
				return vflash;
			},
			/**
			 * 获取flash主版本号
			 *
			 * @return {Number}
			 */
			getFlashMain: function() {
				return parseInt(tvp.version.getFlash().split(".")[0], 10);
			}
		}
	})();
	;
	(function(tvp, $) {
	
		var PACKAGEINFO = {
			qqlive: {
				text1: '腾讯视频客户端',
				text2: "可观看更多视频",
				md5Cgi: 'http://mcgi.v.qq.com/commdatav2?cmd=39&otype=json&confid=${id}',
				payUrl: 'http://film.qq.com/weixin/detail/${index}/${cid}.html',
				scheme: 'tenvideo2://',
				logoClass:'',
				openUrl: "tenvideo2://?action=5&video_id=${vid}",
				liveOpenUrl: 'tenvideo2://?action=8&channel_id=${lid}',
				ipadDownloadUrl: "https://itunes.apple.com/cn/app/teng-xun-shi-pinhd/id407925512?mt=8",
				iphoneDownloadUrl: "http://itunes.apple.com/cn/app/id458318329?mt=8",
				aphoneDownloadUrl: "http://mcgi.v.qq.com/commdatav2?cmd=4&confid=140&platform=aphone",
				VIA: "ANDROIDQQ.QQLIVE",
				appId: '100730521',
				downloadId: "TencentVideo",
				taskName: "TencentVideo",
				packageName: $.os.iphone ? 'com.tencent.live4iphone' : "com.tencent.qqlive",
				packageUrl: 'tenvideo2://can_open_me_if_install_and_regeister_this_scheme'
			},
			weishi: {
				text1: '微视客户端',
				text2: "发现更多精彩",
				logoClass:'tvp_download_app_solo_weishi',
				md5Cgi: 'http://www.weishi.com/api/packdata.php?confid=${id}',
				scheme: $.os.iphone ? ' weishiiosscheme://' : 'weishiandroidscheme://',
				openUrl: $.os.iphone ? ' weishiiosscheme://detail?tweetid=${id}' : 'weishiandroidscheme://detail?tweetid=${id}',
				iphoneDownloadUrl: "http://www.weishi.com/download/index.php?pgv_ref=weishi.shipin.xinwenfenxiang",
				aphoneDownloadUrl: "http://www.weishi.com/download/index.php?pgv_ref=weishi.shipin.xinwenfenxiang",
				ipadDownloadUrl: '',
				VIA: "ANDROIDQQ.WEISHI",
				appId: '1101083114',
				downloadId: "TencentWeishi",
				taskName: "TencentWeishi",
				packageName: $.os.iphone ? 'com.tencent.microvision' : "com.tencent.weishi",
				packageUrl: $.os.iphone ? 'weishiiosscheme://can_open_me_if_install_and_regeister_this_scheme' : 'weishiandroidscheme://can_open_me_if_install_and_regeister_this_scheme'
			},
			/**
			 * andriod下有检测应用宝的需要
			 */
			yyb : {
				packageName : 'com.tencent.android.qqdownloader'
			}
		};
	
		tvp.app = {
			config: {
				//默认app索引名称
				defaultName: 'qqlive',
				//qq api地址
				QQApiUrl: "http://pub.idqqimg.com/qqmobile/qqapi.js",
				//手q浏览器 api地址
				mqqApiUrl: "http://res.imtt.qq.com/browser_lightapp/QQBrowserApi/getCryptext/browser_interface_getCryptext.js"
			},
			//是否已安装视频app
			// hasApp: 0,
			//手q中加载qqapi的defer对象
			loadQQClientDefer: false,
			//加载下载器api的defer对象
			loadDownloaderDefer: false,
			//加载qq浏览器的api的defer对象
			loadMqqDefer: false,
			//根据设备和app名字索引获取app默认下载地址
			getDownloadUrl: function(url, name) {
				name = name || tvp.app.config.defaultName;
				url = $.os.iphone ? PACKAGEINFO[name].iphoneDownloadUrl : (url || PACKAGEINFO[name].aphoneDownloadUrl);
				url = $.os.ipad ? PACKAGEINFO[name].ipadDownloadUrl : url;
				return url;
			},
			getPayUrl:function(cid){
				var h5url = $.formatTpl(PACKAGEINFO.qqlive.payUrl, {
					index: cid.slice(0, 1),
					cid: cid
				});
				return h5url;
			},
			/**
			 * [getOpenUrl 返回app打开地址]
			 * @param openId 例如weishi的消息id
			 * @param openUrl 直接指定app打开地址
			 * @param appName app名称索引,例如weishi
			 * @param type 打开方式(详情页/播放页/专题页/web专题页)
			 * @param lid 直播id
			 * @param vid 视频id
			 * @param tid 专题id
			 * @param cid 专辑id
			 * @param pay 是否付费
			 * @param version app版本号
			 * @return {string} app打开地址
			 */
			getOpenUrl: function(op) {
				var params = {};
				var url = false;
				if (!op) {
					return url;
				}
				//如果指定为其它app,则直接取相应打开地址
				if (op.appName && op.appName !== tvp.app.config.defaultName) {
					url = op.openId ? PACKAGEINFO[op.appName].openUrl.replace('${id}', op.openId) : PACKAGEINFO[op.appName].scheme;
					return url;
				}
	
				//for 视频app
				//直播电视台
				if (op.lid) {
					params.channel_id = op.lid;
				}
				//好莱坞有专辑id
				else if(op.cid){
					params.cover_id = op.cid;
				}
				//传入专题id
				else if (op.tid) {
					params.topic_id = op.tid;
				}
				//传入了vid数组或者没有vid返回模板
				else if (op.vidArray || !op.vid) {
					params.video_id = '${vid}';
				}
				//传入了视频id
				else if (op.vid) {
					params.video_id = op.vid;
				}
	
				if(op.vid2){
					params.video_id = op.vid2;
				}
	
				switch (op.openType) {
					//专辑详情页
					case 6:
						if(op.cid){
							params.action = 1;
						}
						break;
					//for 全屏
					case 2:
						if (op.lid) {
							params.action = 8;
						} else {
							params.action = 7;
						}
						break;
					//专题页
					case 3:
						if (op.lid) {
							params.action = 8;
						} else if (op.tid) {
							params.action = 6;
						} else {
							params.action = 5;
						}
						break;
					//好莱坞付费
					case 4:
						if (op.cid) {
							params.action = 1;
						}
						break;					
						//默认就是详情页
					default:
						//直播电视台
						if (op.lid) {
							params.action = 8;
						}
						else if(op.cid){
							params.action = 1;
						} 
						else {
							params.action = 5;
						}
				}
	
				//增加渠道号方便app统计
				if(op.promotionId){
					params.from = op.promotionId+'_'+(op.contentId?op.contentId:'');
				}
	
				params.action = params.action || 5;
	
				url = PACKAGEINFO.qqlive.scheme + '?' + decodeURIComponent($.param(params));
	
				//好莱坞付费
				if ((op.cid||op.h5Url) && parseInt(op.pay)) {
					var h5url = op.cid?tvp.app.getPayUrl(op.cid):op.h5Url;
	
					if ($.os.iphone) {
						url = h5url;
						//蛋疼此处为了ios在打开付费页时不带额外参数
						op.openUrl = url;
					}
					//android3.2以前的版本直接走付费h5链接
					else if (op.version && parseInt(op.version) < 5852) {
						url = h5url;
					}
				}
	
				//直接指定打开地址(付费强制走自己页面)
				if(url !== h5url && op.openUrl){
					url = $.filterXSS(op.openUrl);
					if(url.indexOf('from')<0 && url.indexOf('?')>-1 && op.promotionId){
						url+='&from='+op.promotionId+'_'+(op.contentId?op.contentId:'');
					}
				}
	
				return url;
			},
			//方便别处获取配置信息
			getPackageInfo: function() {
				return PACKAGEINFO;
			},
			//当前webview类型
			pageType: function() {
				//微信
				if ($.browser.WeChat) {
					return 1;
				}
				//先判断是不是在手机qq下，用户安装了手Q浏览器后，在手Q里打开页面ua会既被识别成手Q也会被识别成QQ浏览器
				if ($.browser.MQQClient) {
					return 2;
				}
				//QQ浏览器
				if ($.browser.MQQ) {
					return 3;
				}
				return 0;
			}(),
			/**
			 * 平台是否有app
			 */
			isSupportApp: function() {
				if ($.os.iphone || $.os.ipod || $.os.ipad) {
					return true;
				}
				if ($.os.android) {
					return true;
				}
				return false;
			}(),
			/**
			 * 去除绑定尝试打开app,有些情况要特殊处理
			 */
			unbindTryOpenAppBanner:function(banner){
				banner?banner.noTryOpen = true:"";
			},
			/**
			 * 绑定尝试打开app事件
			 * @param  {[type]}  src      [description]
			 * @param  {Boolean} isIosOld [description]
			 * @return {[type]}           [description]
			 */
			bindTryOpenAppBanner: function(banner) {
				if (!(banner && banner.rewriteText)) {
					return;
				}
				//微信/手q/qq浏览器用内部接口判断
				if(tvp.app.pageType){
					return;
				}
	
				var clickEvent = tvp.$.os.hasTouch ? 'touchend' : 'click',
					$btn = banner.$btn,
					// downloadUrl = $btn.attr('href'),
					openUrl = $btn.attr('data-url'),
					isChrome = tvp.$.browser.Chrome,
					canOpen = function() {
						var ua = navigator.userAgent;
						if(!tvp.$.os.android && !tvp.$.os.iphone){
							return false;
						}					
						if (ua.indexOf("qqnews/") != -1) {
							return false;
						}
						if(tvp.$.os.android && isChrome){
							return false;
						}
						if((/^http|https/g).test(openUrl)){
							return false;
						}
						return true;
					};
				if(!canOpen()){
					return false;
				}
				//显示为打开
				//banner.rewriteText(1);			
				$btn.bind('touchend click',function(e){
					if(!banner.noTryOpen){
						e.preventDefault();
					}	
				});	
				$btn.bind(clickEvent, function() {
					if(!banner.noTryOpen){
						tvp.app.tryOpenAppBanner($btn);
					}
				});
			},
			/**
			 * 尝试打开app
			 * @return {[type]} [description]
			 */
			tryOpenAppBanner: function($btn) {
				if(!$btn.length){
					return;
				}
				var self = this,
					targetDownloadUrl = $btn.attr('href'),
					targetOpenUrl = $btn.attr('data-url'),			
				 	downloadAppBanner = function() {
						location.href = targetDownloadUrl;
					},
					openAppBanner = function(){
						if(tvp.$.os.android){
							var e = document.createElement("iframe");
							e.style.cssText = "width:1px;height:1px;position:fixed;top:0;left:0;";
							e.src = targetOpenUrl;
							document.body.appendChild(e);
						}
						else if(tvp.$.os.iphone){
							location.href = targetOpenUrl;
						}
					};
	
				setTimeout(function() {
					var startTime = new Date().valueOf();
					openAppBanner();
					startTime = new Date().valueOf();
	
					setTimeout(function() {
						var endTime = new Date().valueOf();
						if (1550 > endTime - startTime) {
							downloadAppBanner();
						}
					}, 1500);
				}, 100);
			},
			/**
			 * 加载qq浏览器api(仅ios需要),可以判断是否安装app及拿到鉴权key来开放限速
			 */
			loadMqqAPI: function() {
				if(tvp.app.loadMqqDefer){
					return tvp.app.loadMqqDefer;
				}
				var defer = $.Deferred();
				tvp.app.loadMqqDefer = defer;
				if (window.x5) {
					defer.resolve();
				}else {
					var apiurl = this.config.mqqApiUrl;
					$.getScript(apiurl, function() {
						window.x5 ? defer.resolve() : defer.reject();
					});
				}
				setTimeout(function() {
					defer.reject();
				}, 3000);
				return defer;
			},
			/**
			 * qq浏览器中检测是否安装app
			 * @return defer 1安装0未安装
			 */
			invokeQQBrowserAPI: function(op) {
				//蛋疼用手q打开qq浏览器,ua是qq浏览器但是判断得用手qapi判断
				if(!$.os.iphone && window.QQApi && QQApi.checkAppInstalled){
					return this.invokeQQClientAPI(op);
				}
				var defer = $.Deferred();
	
				function cb() {
					if (window.x5 && x5.ios && x5.ios.getMobileAppSupport) {
						var a = {
							"scheme": op.packageInfo.packageUrl
						};
						x5.ios.getMobileAppSupport(a, function(rs) {
							defer.resolve(rs && rs.isSupportApp == 1 ? 1 : 0);
						}, function() {
							defer.resolve(0);
						});
					} else {
						defer.resolve(0);
					}
					//超过300ms没结果就算没安装
					setTimeout(function() {
						defer.resolve(0);
					}, 300)
				}
				if (!$.os.iphone && window.x5mtt && window.x5mtt.isApkInstalled) {
					var _flag = window.x5mtt.isApkInstalled('{"packagename": ' + op.packageInfo.packageName + '}');
					defer.resolve(_flag != -1 ? 1 : 0);
				} else if ($.os.iphone && parseInt($.os.version)>5) {
					tvp.app.loadMqqAPI().done(function() {
						cb();
					}).fail(function() {
						defer.resolve(0);
					});
				} else {
					defer.resolve(0);
				}
	
				setTimeout(function() {
					defer.resolve(0);
				}, 3000);		
				return defer;
			},
			/**
			 * 手q中加载qqapi,拉稀的andriod+手q api,只要js重复载入就挂掉了,此处为了保证jsapi只拉取一次
			 */
			loadQQClientAPI: function() {
				if (tvp.app.loadQQClientDefer) {
					return tvp.app.loadQQClientDefer;
				} 			
				var defer = $.Deferred();
				tvp.app.loadQQClientDefer = defer;
				if (window.mqq || window.QQApi) {
					defer.resolve();
				}else {			
					var apiurl = this.config.QQApiUrl;
					$.getScript(apiurl, function() {
						defer.resolve();
					});
				}
				setTimeout(function() {
					defer.reject();
				}, 3000);
				return defer;
			},
			/**
			 * 手q中检测是否安装app
			 * @return defer 1安装0未安装
			 */
			invokeQQClientAPI: function(op) {
				var defer = $.Deferred();
				var ios = $.os.iphone;
				var scheme = ios ? op.packageInfo.packageUrl : op.packageInfo.packageName;
	
				this.loadQQClientAPI().done(function() {
					cb();
				}).fail(function() {
					defer.resolve(0);
				});
				function cb() {
					if (!ios && window.QQApi && QQApi.checkAppInstalled) {
						QQApi.checkAppInstalled(scheme, function(r) {
							if (r && r != 0) {
								r = r.split('\.');
								r = r[r.length - 1];
								defer.resolve(1, r);
							} else {
								defer.resolve(0);
							}
						})
					} else if (window.mqq && mqq.app && mqq.app.isAppInstalled) {
						mqq.app.isAppInstalled(scheme, function(rs) {
							// if (mqq.invoke) {
							// 	mqq.invoke('QQApi', 'checkAppInstalled', scheme, function(ver) {
							// 		if (ver && ver.length) {
							// 			ver = ver.split('\.');
							// 			ver = ver[ver.length - 1];
							// 		}
							// 		defer.resolve(rs ? 1 : 0, ver);
							// 	});
							// } else {
							// 	defer.resolve(rs ? 1 : 0);
							// }
	
							// checkAppInstalled 不用了，导致手Q判断是否安装失败
							// 判断版本号的mqq api不提供返回版本号了
							defer.resolve(rs ? 1 : 0);
						});
					} else {
						defer.resolve(0);
					}
				}
	
				setTimeout(function() {
					defer.resolve(0);
				}, 5000);
	
				return defer;
	
			},
			/**
			 * 根据渠道号和app名称获取app下载包和md5
			 * @param  {number} 渠道号
			 * @param  {string} app名字索引
			 * @return defer
			 */
			getAppMd5: function(id, name) {
				id = id || 140;
				name = name || tvp.app.config.defaultName;
				var defer = $.Deferred();
				var url = PACKAGEINFO[name].md5Cgi.replace('${id}', id);
				$.ajax({
					"url": url,
					"dataType": "jsonp"
				}).then(function(json) {
					//兼容新旧格式
					defer.resolve(json && json.data ? json.data : json);
				});
				return defer;
			},
			report: function(op, t) {
				var params = {};
				var t = t && t.curVideo ? t : false;
				if (t) {
					params = {
						vid: t.curVideo.getVid() || t.curVideo.getChannelId(),
						appId: t.config.appid || t.config.appId,
						contentId: t.config.contentId
					};
				}
				if (op) {
					op = $.extend(op, params);
					tvp.report(op);
				}
			},
			/**
			 * 微信中判断是否安装app
			 * @param  {object}
			 * @return defer 1安装0未安装2升级
			 */
			invokeWeChatAPI: function(op) {
				var defer = $.Deferred();
				var self = this;
				//判断在正常页面和在iframe内部的情况			
				if (window != top) {
					WeixinJSBridge = top.WeixinJSBridge;
				}
				if (!WeixinJSBridge.invoke) {
					defer.resolve(0);
				}
	
				//拿到上网环境方便banner上报
				self.getNetworkTypeInWechat().done(function(nettype) {
					if (op && op.t && op.t.config) {
						op.t.config.nettype = nettype;
					}
				});
	
				if ($.os.iphone) {
					WeixinJSBridge.invoke('getInstallState', op.packageInfo, function(n) {
						var o = n.err_msg;
						if (o.indexOf("get_install_state:yes") > -1) {
							defer.resolve(1);
						} else {
							defer.resolve(0);
						}
					});
				} else { //aphone
					WeixinJSBridge.invoke('getInstallState', op.packageInfo, function(n) {
						var o = n.err_msg;
						if (o.indexOf("get_install_state:yes") > -1) {
							var arr = o.split("yes_"),
								ver = 0;
							if (arr.length >= 2) {
								ver = parseInt(arr[1], 10);
							}
							ver = isNaN(ver) ? 0 : ver;
							defer.resolve(1, ver);
						} else {
							defer.resolve(0);
						}
					})
				}
	
				setTimeout(function(){
					defer.resolve(0);
				},6000);
	
				return defer;
			},
			/**
			 * 微信中获取网络类型
			 * @return defer
			 */
			getNetworkTypeInWechat: function() {
				var defer = $.Deferred();
				WeixinJSBridge.invoke("getNetworkType", {}, function(res) {
					var nettype = -1; //未知
					if (res && res.err_msg) {
	
						if (res.err_msg === 'network_type:fail') {
							nettype = 0; //无网络连接
						}
						if (res.err_msg === 'network_type:wifi') {
							nettype = 1; //wifi
						}
						if (res.err_msg === 'network_type:edge') {
							nettype = 2; //2G/3G
						}
						if (res.err_msg === 'network_type:wwan') {
							nettype = 3; //2G/3G
						}
					}
					defer.resolve(nettype);
				});
				return defer;
			},
			/**
			 * 获取场景,是否安装app,app链接等信息
			 */
			check: function(config) {
				var self = tvp.app,
					pageType = self.pageType,
					ios = $.os.iphone,
					config = config || {},
					defer = $.Deferred();
	
				//默认为视频app
				config.appName = config.appName || tvp.app.config.defaultName;
				config.packageInfo = PACKAGEINFO[config.appName];
	
				//在微信里就需要尝试获取微信接口判断是否安装了App
				if (pageType == 1) {
					var dc = window == top ? document : top.document;
					if (!top.WeixinJSBridge) {
						try{
							dc.addEventListener("WeixinJSBridgeReady", function() {
								self.invokeWeChatAPI(config).then(function(rs, ver) {
									defer.resolve(self.buildResult(rs, config, ver));
								});
							});
						}catch(e){
							defer.resolve(self.buildResult(0, config));
						}				
					} else {
						self.invokeWeChatAPI(config).then(function(rs, ver) {
							defer.resolve(self.buildResult(rs, config, ver));
						});
					}
	
				}
				//在qq浏览器下
				else if (pageType == 3) {
					try{
						self.invokeQQBrowserAPI(config).then(function(rs, ver) {
							defer.resolve(self.buildResult(rs, config, ver));
						});
					}catch(e){
						defer.resolve(self.buildResult(0, config));
					}
				}
				//在手机qq下
				else if (pageType == 2) {
					try{
						self.invokeQQClientAPI(config).then(function(rs, ver) {
							defer.resolve(self.buildResult(rs, config, ver));
						});
					}catch(e){
						defer.resolve(self.buildResult(0, config));
					}				
				} else {
					defer.resolve(self.buildResult(0, config));
				}
	
				return defer;
	
			},
			/**
			 * 微信手q中加载下载器js
			 * @return {boolean}
			 */
			loadDownloaderAPI: function() {
				if (tvp.app.loadDownloaderDefer) {
					return tvp.app.loadDownloaderDefer;
				} 			
				var defer = $.Deferred();
				tvp.app.loadDownloaderDefer = defer;
				var url = "";
				if (this.pageType == 1) {
					url = tvp.defaultConfig.libpath + tvp.defaultConfig.pluginUrl.AppDownloadClickWechat;
				}
				if (this.pageType == 2) {
					url = tvp.defaultConfig.libpath + tvp.defaultConfig.pluginUrl.AppDownloadClickMqq;
				}
	
				if (!url) {
					defer.reject();
				}
	
				if ($.downloadClick_wechat || $.downloadClick_mqq) {
					defer.resolve();
				}else {
					$.getScript(url, function() {
						defer.resolve();
					});
					setTimeout(function() {
						defer.reject();
					}, 3000);
				}
	
				return defer;
			},
			/**
			 * 检测是否可以开启下载器
			 * @param  {Boolean} hasApp 是否安装了app
			 * @param  {[type]}  op     检测开启下载器需要的参数
			 * @param  {[type]}  params 调用下载器需要的参数
			 * @return defer
			 */
			checkCanDownloader: function(hasApp, op, params) {
				var defer = $.Deferred();
				var that = this;
				if ($.os.iphone || $.os.ipad || !op || hasApp == 1) {
					defer.resolve(0);
					return defer;
				}
	
				var enableWechatDownloader = false;
				var enableMqqDownloader = false;
	
				var isAndroid = /android/i.test(navigator.userAgent.toLowerCase());
				//下载地址和md5必须同时传入
				if (!isAndroid || hasApp == 1 || !op.downloader || (op.downloadUrl && !op.md5) || (!op.downloadUrl && op.md5)) {
					defer.resolve(0);
					return defer;
				}
				//如果传入了作用范围
				if ($.isArray(op.range)) {
					$.each(op.range, function(i, o) {
						if (o == 1) {
							enableWechatDownloader = true;
						}
						if (o == 2) {
							enableMqqDownloader = true;
						}
					});
				}
				//如果没有传入广播回调函数则作用范围不限制
				if (!op.downloaderCallback) {
					enableWechatDownloader = true;
					enableMqqDownloader = true;
				}
	
				if (($.browser.WeChat && enableWechatDownloader) || ($.browser.MQQClient && enableMqqDownloader)) {
	
					this.loadDownloaderAPI().done(function() {
						cb();
					}).fail(function() {
						defer.resolve(0);
					});
	
				} else {
					defer.resolve(0);
				}
	
				function cb() {
					if ($.downloadClick_wechat) {
						params && $.downloadClick_wechat(params);
					}
					if ($.downloadClick_mqq) {
						params && $.downloadClick_mqq(params);
					}
	
					defer.resolve(1);
				}
	
				return defer;
			},
			buildResult: function(num, config, ver) {
				var url = "";
				var pageType = this.pageType;
				var ios = $.os.iphone;
				var ipad = $.os.ipad;
				config.version = ver;
	
				//处理得到的打开地址,为新安装app的情况使用
				// var openUrl = PACKAGEINFO[config.appName].openUrl;
				// var liveOpenUrl = PACKAGEINFO.qqlive.liveOpenUrl;
	
				var openUrl = tvp.app.getOpenUrl(config);
				//var liveOpenUrl = openUrl;
				var self = this;
	
				// //如果传入vid直接返回打开app地址,否则返回地址模板
				// config.vid ? openUrl = openUrl.replace('${vid}', encodeURIComponent(config.vid)) : "";
				// //如果传入的直播id直接返回直播app地址
				// config.lid ? liveOpenUrl = liveOpenUrl.replace('${lid}', encodeURIComponent(config.lid)) : "";
				//已指定打开地址则覆盖
				//config.openUrl ? openUrl = $.filterXSS(config.openUrl) : "";
	
				if (ios && !config.openUrl) {
					if (pageType == 1) {
						openUrl += "&callback=weixin%3A%2F%2F&sender=%e5%be%ae%e4%bf%a1";
					}
					if (pageType == 2) {
						openUrl += "&callback=mqqapi%3A%2F%2F&sender=%E6%89%8B%E6%9C%BAQQ";
					}
					if (pageType == 3) {
						openUrl += "&callback=mqqbrowser%3A%2F%2F&sender=QQ%E6%B5%8F%E8%A7%88%E5%99%A8";
					}
				}
	
				if (num == 1) {
					//tvp.app.hasApp = 1;
					url = openUrl;
					// //直播情况更换直播app地址
					// config.lid ? url = liveOpenUrl : "";
				} 
				//如果是ios且是付费视频没安装app也直接走h5付费页 
				else if($.os.iphone && config.pay && config.cid){
					url = tvp.app.getPayUrl(config.cid);
				}
				else {
					url = self.getDownloadUrl(config.downloadUrl, config.appName);
				}
	
				return {
					hasApp: num,
					pageType: pageType,
					os: ios,
					version: ver,
					openUrl: openUrl,
					//liveOpenUrl: liveOpenUrl,
					liveOpenUrl: openUrl,
					url: url
				};
			}
		};
	
	})(tvp, tvp.$);
	/**
	 * @fileoverview 腾讯视频统一播放器默认配置
	 *
	 */
	
	/**
	 * 腾讯视频统一播放器参数值定义
	 * @namespace tvp.PLAYER_DEFINE
	 * @type {Object}
	 * @ignore
	 */
	tvp.PLAYER_DEFINE = {
		/**
		 * 直播
		 * @default 1
		 * @type {Number}
		 */
		LIVE : 1,
		/**
		 * 点播
		 * @default 2
		 */
		VOD : 2
	
	};
	
	/**
	 * 腾讯视频统一播放器默认配置
	 * @namespace tvp.defaultConfig
	 * @type {Object}
	 */
	tvp.defaultConfig = {
	
		// ========================= 公共配置开始 ======================
		//
		// /**
		// * 播放器容器宽度
		// * @type {Number}
		// */
		// modWidth: 0,
		// /**
		// * 播放器容器高度
		// * @type {Number}
		// */
		// modHeight: 0,
		/**
		 * 默认的视频镀锡i昂
		 * @type {tvp.VideoInfo}
		 */
		video : null,
		/**
		 * 默认宽度，单位像素
		 * @type {Number}
		 */
		width : 600,
		/**
		 * 默认高度，单位像素
		 * @type {Number}
		 */
		height : 450,
		/**
		 * 是否自动播放
		 * 2013年12月2日 更改默认属性为false，大多数场景都是不需要自动播放的
		 * @type {Boolean}
		 */
		autoplay : false,
	
		/**
		 * 是否静音
		 * @type {Boolean}
		 */
		mute : false,
	
		/**
		 * 默认音量
		 * @type {Number}
		 */
		volume : 50,
		/**
		 * 默认的DOM元素ID
		 * @type {String}
		 */
		modId : "mod_player",
	
		/**
		 * 播放器id，不指定的话系统会自动分配一个，一般不需要配置
		 * @type {String}
		 */
		playerid : "",
	
		/**
		 * 专辑id
		 * @type {String}
		 */
		coverId : "",
	
		/**
		 * 分类id
		 * @type {Number}
		 */
		typeId : 0,
	
		/**
		 * 默认loading图片
		 * @type {String}
		 */
		pic : "",
	
		/**
		 * 播放器类别
		 * @type {Number}
		 */
		type : tvp.PLAYER_DEFINE.VOD,
	
		/**
		 * 播放器类别
		 * @type {String}
		 */
		playerType : "auto",
	
		/**
		 * loading动画的swf地址
		 * @type {String}
		 */
		loadingswf : "",
	
		// *
		// * 是否是付费模式
		// * @type {Boolean}
	
		// isPay: false,
	
		/**
		 * 广告订单id
		 * @type {String}
		 */
		oid : "",
	
		/**
		 * 是否显示分享
		 * @type {String}
		 */
		share : true,
	
		// ========================= 公共配置结束 ======================
	
		isHtml5UseHLS : "auto",
		/**
		 * 是否显示5分钟限播
		 * @type {Boolean}
		 */
		isShowDurationLimit : true,
		/**
		 * HTML5播放器是否使用autobuffer属性
		 * @type {Boolean}
		 */
		isHtml5AutoBuffer : false,
		/**
		 * HTML5播放器是否使用Airplay功能，强烈建议开启
		 * @type {Boolean}
		 */
		isHtml5UseAirPlay : true,
	
		/**
		 * HTML5播放器是否一直显示控制栏
		 * @type {Boolean}
		 */
		isHtml5ControlAlwaysShow : false,
	
		/**
		 * HTML5播放器preload属性
		 * @type {String}
		 */
		html5Preload : "null",
		/**
		 * HTML5点播播放器UI组件
		 * @type {Array}
		 */
		html5VodUIFeature : ['controlbar', 'tips', 'title', 'meta', 'playpause', 'progress', 'timepanel',
		        // 暂时关闭清晰度
		        // 'definition',
		        'fullscreen',
		        "overlay",
		        "bigben",
		        "posterlayer",
		        "shadow",
		        "promotion",
		        "loadingAd"],
	
		/**
		 * HTML5直播播放器UI组件
		 * @type {Array}
		 */
		html5LiveUIFeature : ['controlbar', 'tips', 'playpause', 'fullscreen', "overlay", "posterlayer", "shadow"],
		/**
		 *  HTML5直播播放器前贴组件
		 * @type {Array}
		 */
		html5LiveFrontShow : ['liveDownloader'],
		/**
		 * HTML5UI组件功能异步加载JS配置，有些组件由于不是必须，而代码量又很大，所以采用按需加载
		 * 配置是JSON格式，key是组件名，value是异步加载的JS文件路径
		 * @type {Object}
		 */
		html5FeatureExtJS : {
		// "track": "/js/widgets/h5_track.js"
		},
	
		/**
		 * HTML5播放器UI需要关闭的功能，跟上述的配置相反，这里列出的功能就不会展现
		 * @type {Array}
		 */
		html5ForbiddenUIFeature : [],
	
		/**
		 * HTML5播放器是否使用自设计的控制栏
		 * @type {Boolean}
		 */
		isHtml5UseUI : true,
	
		/**
		 * HTML5播放器自定义UI的CSS文件地址
		 * @type {[type]}
		 */
		HTML5CSSName : "",
	
		/**
		 * HTML5播放开始的时候是否显示poster
		 * @type {Boolean}
		 */
		isHtml5ShowPosterOnStart : true,
		/**
		 * HTML5播放器播放完毕是否显示poster
		 * @type {Boolean}
		 */
		isHtml5ShowPosterOnEnd : false,
	
		/**
		 * HTML5播放器切换视频的时候是否要显示Poster
		 * @type {Boolean}
		 */
		isHtml5ShowPosterOnChange : true,
	
		/**
		 * iPhone在暂停的时候是否显示Poster层
		 * @type {Boolean}
		 */
		isiPhoneShowPosterOnPause : true,
	
		/**
		 * ios开启小窗播放
		 * @type {Boolean}
		 */
		isiPhoneShowPlaysinline : false,
	
		/**
		 * 暂停的时候是否显示播放按钮
		 * @type {Boolean}
		 */
		isHtml5ShowPlayBtnOnPause : true,
	
		/**
		 * 是否强制使用伪全屏
		 * @type {Boolean}
		 */
		isHtml5UseFakeFullScreen : true,
	
		/**
		 * ios系统播放器是否需要做偏移
		 * @type {Boolean}
		 */
		isIOSVideoOffset : true,
	
		/**
		 * 是否要在开始播放时展示Loading广告（非手机端都默认开启）
		 * @type Boolean
		 */
		isHtml5ShowLoadingAdOnStart : !tvp.$.os.phone,
	
		/**
		 * 是否要在切换视频播放时展示Loading广告（非手机端都默认开启）
		 * @type Boolean
		 */
		isHtml5ShowLoadingAdOnChange : !tvp.$.os.phone,
	
		/**
		 * 替换视频文件域名为指定的域名
		 * @type String
		 */
		specialVideoFileDomain : "",
	
		// ==========================================================================
	
		/**
		 * flash播放器的wmode
		 * @type {String}
		 */
		flashWmode : "direct",
	
		/**
		 * flash点播播放器地址
		 * @type {String}
		 */
		vodFlashUrl : "",
	
		/**
		 * flash点播播放器类型
		 * @type {String}
		 */
		vodFlashType : "TPout",
	
		/**
		 * flash点播播放器扩展flashvars参数
		 * @type {Object}
		 */
		vodFlashExtVars : {},
	
		/**
		 * 点播flash播放器listtype参数
		 * @type {Number}
		 */
		vodFlashListType : 2,
	
		/**
		 * flash点播播放器皮肤地址
		 * @type {String}
		 */
		vodFlashSkin : "",
	
		/**
		 * flash点播播放器是否出现设置按钮
		 * @type {Boolean}
		 */
		isVodFlashShowCfg : true,
	
		/**
		 * flash点播播放器播放结束出现结束推荐
		 * @type {Boolean}
		 */
		isVodFlashShowEnd : true,
	
		/**
		 * flash点播播放器是否出现搜索框
		 * @type {Boolean}
		 */
		isVodFlashShowSearchBar : true,
	
		/**
		 * flash点播播放器是否出现“下一个视频”按钮
		 * @type {Boolean}
		 */
		isVodFlashShowNextBtn : true,
	
		/**
		 * 直播播放器swf的url地址
		 * @type {String}
		 */
		liveFlashUrl : "",
	
		/**
		 * 直播播放器类型
		 * @type {String}
		 */
		liveFlashSwfType : "TencentPlayerLive",
	
		/**
		 * 直播播放器是否显示设置按钮
		 * @type {Boolean}
		 */
		isLiveFlashShowConfigBtn : true,
	
		/**
		 * 直播播放器是否显示全屏按钮
		 * @type {Boolean}
		 */
		isLiveflashShowFullBtn : true,
	
		/**
		 * 直播播放器是否显示配置菜单
		 * @type {Boolean}
		 */
		isLiveFlashShowCfg : true,
	
		/**
		 * 直播播放器右上角水印图片
		 * @type {String}
		 */
		liveFlashWatermark : "",
	
		/**
		 * 直播播放器皮肤类型，不传入则flash播放器内部会默认为live
		 * weidiantai:微电台，weidianshi:微电视，live:腾讯直播，inlive:公司内部直播
		 * @type {String}
		 */
		liveFlashAppType : "",
	
		/**
		 * 直播播放器扩展flashvars
		 * @type {Object}
		 */
		liveFlashExtVars : {},
	
		/**
		 * swf文件日期戳版本号
		 * @type String
		 */
		flashVersionTag : "20140714",
		// ============================== 控件配置 =================================
	
		/**
		 * 控件控制栏地址
		 * @type {String}
		 */
		ocxControlBar : "",
	
		/**
		 * 控件控制栏高度
		 * @type {Number}
		 */
		ocxControlHeight : 60,
	
		/**
		 * 控件皮肤
		 * @type {String}
		 */
		ocxSkin : "",
	
		/**
		 * 控件播放器暂停的时候是否在画面上显示暂停按钮
		 * @type {Boolean}
		 */
		isOcxShowPauseBtn : false,
	
		/**
		 * 控件是否隐藏控制栏
		 * @type {Boolean}
		 */
		isOcxHideControl : false,
	
		// ========================插件配置=============================
	
		/**
		 * 使用插件列表，如果配置在这里那么会在write之后自动调用这里列出的插件
		 * 当然，用户自己写的插件也可以不用列在这里，直接在外部调用player.[pluginname]即可
		 * 目前（2013-09-30）官方插件就一个下载app的底部banner
		 * @type {Array}
		 */
		plugins : {
			/**
			 * 是否显示下载App的Banner
			 * @type {Boolean}
			 */
			AppBanner : false,
			/**
			 * 是否在暂停/结束后显示下载App的Banner和微信推荐视频
			 * @type {Boolean}
			 */
			AppRecommend : false,
			/**
			 * [是否在暂停时在画面底部浮出appbanner]
			 * @type {Boolean}
			 */
			AppDownloadOnPause : false,
			/**
			 * [是否在暂停时在画面底部浮出appbanner.新依赖皮肤版]
			 * @type {Boolean}
			 */
			AppBannerOnPause : false,
			/**
			 * 是否显示关注banner
			 * @type {Boolean}
			 */
			AppFollow : false
		},
	
		/**
		 * 插件JS存放路径，key是插件名，value是插件的JS路径，跟下面的libpath组合成完成的URL地址
		 * 如果定义了这里的路径，那么会异步加载，否则会探测当前页面是否有对应的build+插件名的函数
		 * @type {Object}
		 */
		pluginUrl : {
			"AppBanner" : "js/plugins/appbanner.js?v=20141125",
			"AppFollow" : "js/plugins/appfollow.js?v=20141125",
			"AppRecommend" : "js/plugins/apprecommend.js?v=20141125",
			"AppDownloadOnPause" : "js/plugins/appdownloadonpause.js?v=20141125",
			"AppBannerOnPause" : "js/plugins/appbanneronpause.js?v=20141125",
			"AppDownloadClickWechat" : "js/plugins/appdownloadclickwechat.js?v=20141125",
			"AppDownloadClickMqq" : "js/plugins/appdownloadclickmqq.js?v=20141125"
		},
	
		/**
		 * css存放根目录
		 * @type {string}
		 */
		cssPath : "http://imgcache.gtimg.cn/tencentvideo_v1/vstyle/mobile/v2/style/",
		/**
		 * 插件css存放路径，key是插件名，value是插件的JS路径，跟上面的cssPath组合成完成的URL地址
		 * 插件的css地址都只从这里找
		 * @type {Object}
		 */
		pluginCssUrl : {
			"AppRecommend" : "player_plugins_apprecommend.css?v=20141013",
			"AppBanner" : "player_plugins_appdownloadsolo.css?v=20141013",
			"AppBannerOnPause" : "player_plugins_appdownloadonpause.css?v=20141013",
			"AppDownloadOnPause" : "player_plugins_appdownloadonpause.css?v=20141013"
		},
		/**
		 * 统一播放器框架的存放路径
		 * @type {String}
		 */
		libpath : "http://qzs.qq.com/tencentvideo_v1/tvp/"
	
	};
	;
	(function($) {
		var tmpl = (function(cache, $) {
			return function(str, data) {
				var fn = !/\s/.test(str) ? cache[str] = cache[str] || tmpl(document.getElementById(str).innerHTML) : function(data) {
						var i, variable = [$],
							value = [
								[]
							];
						for (i in data) {
							variable.push(i);
							value.push(data[i]);
						};
						return (new Function(variable, fn.$)).apply(data, value).join("");
					};
				fn.$ = fn.$ || $ + ".push('" + str.replace(/\\/g, "\\\\")
					.replace(/[\r\t\n]/g, " ")
					.split("<%")
					.join("\t")
					.replace(/((^|%>)[^\t]*)'/g, "$1\r")
					.replace(/\t=(.*?)%>/g, "',$1,'")
					.split("\t")
					.join("');")
					.split("%>")
					.join($ + ".push('")
					.split("\r")
					.join("\\'") + "');return " + $;
	
				return data ? fn(data) : fn;
			}
		})({}, '$' + (+new Date));
	
		$.tmpl = tmpl;
	})(tvp.$);
	
	;
	(function($) {
		if (typeof $.getScript == "undefined") {
			$.getScript = function(src, func) {
				var script = document.createElement('script'),
					head = document.getElementsByTagName("head")[0],
					READY_STATE_RE = /^(?:loaded|complete|undefined)$/;
				script.async = "async";
				script.src = src;
				if (func) {
					script.onload = script.onerror = script.onreadystatechange = function() {
						if (READY_STATE_RE.test(script.readyState)) {
							// Ensure only run once and handle memory leak in IE
							script.onload = script.onerror = script.onreadystatechange = null;
							if (!DEBUG) {
								head.removeChild(script);
							}
							// Dereference the script
							script = null;
							func();
						}
					}
				}
				head.appendChild(script);
			}
		}
	})(tvp.$);
	
	/**
	 * @type {Function}
	 * @namespace tvp.report
	 */
	
	tvp.report = (function() {
		var isFree = true;
		var reportObj = null;
		var urlList = [], timer;
	
		/**
		 * 上报后由于返回的不是图片会引起image的error事件，添加事件回调方法上报url队列中剩下的url
		 */
		function errorHandle() {
			if (urlList.length == 0) {
				isFree = true;
				reportObj = null;
				return;
			}
			clearTimeout(timer);
			create(urlList.splice(0, 1));
			isFree = false;
		}
	
		function create(url) {
			clearTimeout(timer);
			reportObj = document.createElement("img");
			reportObj.onerror = errorHandle;
			reportObj.src = url;
			setTimeout(errorHandle, 1000);
		}
	
		function reportUrl(url) {
			if (!url || !/^(?:ht|f)tp(?:s)?\:\/\/(?:[\w\-\.]+)\.\w+/i.test(url)) { // 过滤非法参数
				return;
			}
			if (reportObj == null) { // 第一次调用上报方法时先做初始化工作才上报
				create(url);
				isFree = false;
				return;
			}
			else if (isFree) { // 如果当前image对象空闲，则直接上报
				create(url);
				isFree = false;
				return;
			}
			else { // 否则进入队列
				urlList.push(url);
			}
		}
		return function(param) {
			if (tvp.$.isString(param)) {
				reportUrl(param);
				return;
			}
	
			if (tvp.$.type(param) == "object") {
				var paramMap = {
					deviceId : "int1",
					platformId : "int2",
					appId : "int3",
					speed : "int4",
					contentId : "str1",
					fileName : "str2"
				},
					defaultParam = {
						cmd : -1, // cmd
						url : window != top ? document.referrer : document.location.href, // 当前页面url
						ver : tvp.ver.replace(/\$/g, ""), // 当前版本号
						ua : navigator.userAgent, // userAgent
						int1 : tvp.common.getDeviceId(), // 设备id
						int2 : tvp.common.getPlatformId(), // 平台id
						int3 : 0, // APP id
						int4 : 0, // 预留给测速时间
						str1 : "", // 预留给内容id
						str2 : tvp.filename
						// 当前文件名
					}, key,
					url = "http://rcgi.video.qq.com/web_report?";
				// 查询字段映射关系
				for (key in paramMap) {
					if (key in param) {
						param[paramMap[key]] = param[key];
						delete param[key];
					}
				}
				param = tvp.$.extend(defaultParam, param);
				// for (key in param) {
				// r.push(key + "=" + encodeURIComponent("" + param[key]));
				// }
				url += tvp.$.param(param);
				reportUrl(url);
			}
		}
	})();
	
	/**
	 * 自动返回码4.0上报
	 */
	tvp.ajax = (function($) {
	
		/**
		 * 用对象路径取一个JSON对象中的子对象引用
		 * 
		 * @static
		 * @param {object}
		 *          obj 源对象
		 * @param {string}
		 *          path 对象获取路径
		 * @returns {object|string|number|function}
		 * 
		 * @example
		 * route(
		           { "a" : 
				       { "b" :
					       { "c" : "Hello World"
						   }
				       }
				   },
				   "a.b.c"
		       ); //返回值："Hello World"
		 */
		function route(obj, path) {
			obj = obj || {};
			path = String(path);
	
			var r = /([\d\w_]+)/g, m;
	
			r.lastIndex = 0;
	
			while ((m = r.exec(path)) !== null) {
				obj = obj[m[0]];
				if (obj === undefined || obj === null) {
					break;
				}
			}
	
			return obj;
		};
	
		/**
		 * [getUrlPath 4.0上报需拿到cgi的域名和不带域名和参数的地址]
		 * @param  {String} url [url地址]
		 * @return {Object}     [cgi域名及路径]
		 */
		function getUrlPath(url) {
			url = url.slice(0, url.indexOf('?'));
			url = url.split('/');
			return {
				host : url[2],
				path : '/' + url.slice(3).join('/')
			};
		}
		/**
		 * [cgiReport cgi成功失败上报]
		 * @param  {String} cgi  [cgi地址]
		 * @param  {Number} type [1正确2失败3逻辑失败]
		 * @param  {Number} code [返回码]
		 * @param  {Number} time [延迟ms]
		 */
	
		function cgiReport(cgi, type, code, time) {
			var url = "http://c.isdspeed.qq.com/code.cgi";
			var params = getUrlPath(cgi);
			tvp.report(url, {
				        domain : params.host,
				        cgi : params.path,
				        type : type,
				        code : code,
				        time : time
			        });
		}
	
		/**
		 * [ajax 通用ajax操作]
		 * @param  {Object} op [op.url:cgi地址,op.config:ajax配置,op.data:ajax请求参数]
		 * @param  {object} report [report.key:返回码名字,report.value:成功值]
		 * @return {Object}        [defer]
		 */
		function ajax(op, report) {
			if ($.type(op) != 'object') {
				return;
			}
			if (!op.url || typeof op.url != 'string') {
				return;
			}
			// 默认返回码名字suc成功值为0
			if (typeof report == 'object') {
				report = $.extend({
					        key : 'suc',
					        value : 0
				        }, report);
			}
	
			var defer = $.Deferred(),
				startTime = $.now(),
				delay = 0,
				params = $.extend({
					        dataType : 'jsonp'
				        }, op);
	
			$.ajax(params).done(function(rs) {
				        var code = (rs && typeof report == 'object') ? route(rs, report.key) : 0;
				        delay = $.now() - startTime;
	
				        if (rs && ((typeof code != 'undefined' && code == report.value))) {
					        cgiReport(op.url, 1, code, delay);
					        defer.resolve(rs, delay);
				        }
				        else {
					        cgiReport(op.url, 3, code, delay);
					        defer.resolve(rs, delay);
				        }
			        }).fail(function(error) {
				        delay = $.now() - startTime;
				        cgiReport(op.url, 2, 900, delay);
				        defer.reject(error, delay);
			        });
			return defer;
		}
	
		return ajax;
	})(tvp.$);
	
	/**
	 * 统一播放器错误上报
	 * @param {String} msg 错误信息
	 * @param {String} block 错误上报关键词，默认为tvperror
	 */
	tvp.reportErr = function(msg,block){
		block = block || 'tvperror';
		var url = 'http://rcgi.video.qq.com/report/jsbossrep?block=' + block + '&ret=-1&level=4&msg=';
		msg = [location.href,navigator.userAgent,tvp.filename,tvp.ver,msg].join('|');
		msg = encodeURIComponent(msg);
		url += msg;
		tvp.report(url);
	}
	/**
	 * @fileOverview 封装返回码统计
	 */
	
	/* @include "tvp.define.js" */
	/**
	 * 返回码统计上报
	 *
	 * @type {Object}
	 * @namespace tvp.retCode
	 */
	tvp.retCode = {
		snid: 0,
		/**
		 * 返回码上报类型枚举
		 *
		 * @type {Object}
		 */
		TYPE: {
			/**
			 * 成功
			 *
			 * @type Number
			 * @default 1
			 */
			SUC: 1,
			/**
			 * 失败
			 *
			 * @type Number
			 * @default 2
			 */
			ERR: 2
		},
		/**
		 * 配置项
		 *
		 * @type
		 */
		config: {
			/**
			 * 请求CGI的url
			 *
			 * @type String
			 * @default http://isdspeed.qq.com/cgi-bin/v.cgi
			 */
			cgi: "http://isdspeed.qq.com/cgi-bin/v.cgi",
			/**
			 * 采样率，100表示1%,1000表示0.1%...
			 *
			 * @type Number
			 * @default 1000
			 */
			sampling: 1
		},
		/**
		 * 共用的返回码
		 *
		 * @type
		 */
		commCode: {
			error: 11,
			MQzone_Err: 12
		},
		/**
		 * 上报数据
		 *
		 * @param {Number}
		 *          appid 分配的AppId
		 * @param {Number}
		 *          rettype 返回结果类型1表示成功，2表示失败
		 * @param {Number}
		 *          delay 延迟时间
		 * @param {Number}
		 *          errcode 错误码
		 */
		report: function(appid, rettype, delay, errcode) {
			if (!appid)
				return;
			if (isNaN(rettype) || rettype < 1)
				return;
			if (typeof delay == "undefined")
				return;
			var url = this.config.cgi;
			url += "?flag1=" + appid.toString() + "&flag2=" + rettype.toString() + "&1=" + tvp.retCode.config.sampling + "&2=" + delay;
			if (errcode) {
				url += "&flag3=" + errcode.toString();
			}
			tvp.report(url);
		}
	};
	
	
	/**
	 * @class tvp.RetCode
	 * @description 返回码监控对象
	 * @param {Number} appid 返回码监控的appid
	 */
	tvp.RetCode = function(appid) {
		/**
		 * appid
		 */
		this.appid = appid;
		/**
		 * 计时器
		 * @ignore
		 */
		this.timer = {
			begin: 0,
			end: 0
		}
		/**
		 * 当前对象ID
		 */
		this.SNID = tvp.retCode.snid;
		/**
		 * 是否已经上报
		 */
		this.isReported = false;
		tvp.retCode.snid++;
	}
	
	tvp.RetCode.prototype = {
		/**
		 * 开始上报统计
		 */
		begin: function() {
			this.timer.begin = new Date().valueOf();
		},
		/**
		 * 上报结束
		 */
		end: function() {
			this.timer.end = this.timer.end || new Date().valueOf();
		},
		/**
		 * 上报
		 * @param {Number} rettype 上报类别，成功是1，失败是2
		 * @param {Number} retcode 返回码
		 */
		report: function(rettype, retcode) {
			if (this.isReported)
				return;
			this.end();
			var delay = this.timer.end - this.timer.begin;
			tvp.retCode.report(this.appid, rettype, delay, retcode);
			this.isReported = true;
		},
		/**
		 * 上报成功
		 */
		reportSuc: function() {
			this.report(tvp.retCode.TYPE.SUC);
		},
		/**
		 * 上报错误
		 * @param {Number} errcode 错误码
		 */
		reportErr: function(errcode) {
			errcode = errcode || tvp.retCode.commCode.error;
			this.report(tvp.retCode.TYPE.ERR, errcode);
		}
	};
	/**
	 * @fileOverview 腾讯视频云播放器 tvp.VideoInfo 视频对象
	 */
	
	/*
	 * 这个类是定义视频信息的数据对象，该数据对象包含了点播和直播的数据接口
	 */
	/*
	 * @include "./tvp.define.js"
	 */
	
	
	;
	(function(tvp, $) {
	
		var defaultPrivData = {
			poster: "", //默认封面图
			prefix: 0, // 片头
			tail: 0, // 片尾
			tagStart: 0, // 看点开头
			tagEnd: 0, // 看点结尾
			duration: "",
			historyStart: 0, // 历史观看开始时间，这个参数设置了播放器会有提示“您上次观看到....“
			pay: 0, // 是否是付费
			coverId: "", // 专辑id（可选）
			title: "", // 标题
			isLookBack: 0, // 当前直播频道是否支持回看
			tstart: 0, // 历史观看时间，跟historyStart差不多，只是播放器不会有提示，一般用于回链播放
			CDNType: 0, // CDNType
			vFormat: "",
			LiveReTime: "",
			typeId: 0, //视频所属大分类Id
			format: $.os.ipad || $.os.MIPAD ? "mp4" : "auto", //默认的视频文件格式
			channelExtParam: {},
			pid: "", //pid，每播放一次换一次
			rid: "", //请求server的rid，每次请求server换一次
			bulletId : "", //指定当前视频的一条弹幕id
			bullet : false //当前视频是否有开启弹幕
		};
	
		/**
		 * 视频对象
		 *
		 * @class tvp.VideoInfo
		 */
		tvp.VideoInfo = function() {
			var _vid = "",
				_vidlist = "",
				_vidCnt = 0,
				_idx = 0,
				_origvid = "",
				_channelId = "",
				$me = this,
				privData = {},
				curPlayer = null,
				loadServerDefer = {},
				getFormatListDefer = null;
			$.extend(privData, defaultPrivData);
	
			//服务器的数据
			this.data = {};
			this.url = "";
			this.lastQueryVid = "";
			
			/**
			 * 首次执行获取mp4地址的方法的defer
			 */
			this.callGetMp4UrlDefer = $.Deferred();
	
			/**
			 * @private 获取第一个视频vid
			 */
	
			function getFirstVid(vid) {
				if (vid.indexOf("|") < 0) return vid;
				return vid.substring(0, vid.indexOf("|"));
			};
	
			/**
			 * @private 获取真实的视频vid，如果是看点，则只返回看点所在视频vid
			 */
	
			function getRealVid(vid) {
				if (vid.indexOf("_") < 0) return vid;
				return vid.split("_")[0];
			};
	
			/**
			 * @private 获取看点的idx索引，如果是真实的视频，则返回0
			 * @return {Number} 看点的索引
			 */
	
			function getIdx(vid) {
				if (vid.indexOf("_") < 0) return 0;
				return parseInt(vid.split("_")[1]);
			};
	
			/**
			 * @private 获取真实的视频vid的列表，多个视频用|符号隔开
			 * @return {string} 视频列表
			 */
	
			function getRealVidList(vidlist) {
				var arr = [];
				var origarr = vidlist.split("|");
				for (var i = 0; i < origarr.length; i++) {
					arr.push(getRealVid(origarr[i]));
				}
				return arr.join("|");
			};
			
			/**
			 * 绑定统一播放器的自定义事件
			 */
			function bindPlayerEvent(){
				if(curPlayer && curPlayer instanceof tvp.Player){
					//在h5播放器开始初始化前的事件，先发起异步请求获取mp4地址
					curPlayer.on(tvp.ACTION.onVodH5Init,function(){
						var defer;
						if((curPlayer.config.isHtml5UseHLS === "auto" && tvp.common.isUseHLS()) || curPlayer.config.isHtml5UseHLS){
							return ;
						}
						defer = $me.getMP4Url();
						$me.callGetMp4UrlDefer.resolve(defer);
					});
				}
			}
	
			$.each(privData, function(k, v) {
				new function() {
					var p = k.charAt(0).toUpperCase() + k.substr(1);
					$me["set" + p] = function(v) {
						privData[k] = v;
						return this;
					}
					$me["get" + p] = function() {
						return privData[k];
					}
				}
			});
			
			this.setCurPlayer = function(player){
				curPlayer = player;
				bindPlayerEvent();
			}
	
			/**
			 * 设置视频Vid
			 *
			 * @public tvp.VideoInfo
			 */
			this.setVid = function(vid) {
				if (!tvp.$.isString(vid)) {
					return;
				}
				this.clear();
				_origvid = vid;
				if (vid.indexOf("|") < 0) {
					var id = getRealVid(vid)
					_vid = id;
					_idx = getIdx(vid);
					_vidlist = id;
				} else {
					var arr = vid.split("|");
					_vid = getRealVid(arr[0]);
					_idx = getIdx(arr[0]);
					_vidlist = getRealVidList(vid);
				}
				_vid = $.filterXSS(_vid);
				_vidlist = $.filterXSS(_vidlist);
				return this;
			};
	
			/**
			 * 获取视频主vid
			 *
			 * @public
			 */
			this.getVid = function() {
				return _vid;
			};
	
			/**
			 * 获取视频列表
			 *
			 * @public
			 */
			this.getVidList = function() {
				return _vidlist;
			}
	
			/**
			 * 获取视频列表数组
			 * @return {Array} [description]
			 */
			this.getVidArray = function() {
				return _vidlist.split("|");
			}
	
			/**
			 * 获取视频看点的idx索引
			 *
			 * @public
			 */
			this.getIdx = function() {
				return _idx;
			}
	
			/**
			 * 获取总播放时长
			 *
			 * @public
			 * @return {number} 返回的总时长
			 */
			this.getDuration = function() {
				if (!privData.duration) {
					if ( !! this.data && !! this.data.vl && $.isArray(this.data.vl.vi) && this.data.vl.vi.length > 0 && this.data.vl.vi[0].td != 0) {
						return this.data.vl.vi[0].td;
					}
					return 0;
				}
	
				var arrDur = privData.duration.split("|");
				var sec = 0;
				for (var i = 0, len = arrDur.length; i < len; i++) {
					sec += parseInt(arrDur[i]);
				}
				return sec;
			};
	
			/**
			 * 获取文件大小
			 * @return {number} 文件大小bytes
			 */
			this.getFileSize = function() {
				if (!!this.data && !!this.data.vl && !!this.data.vl.vi && !!this.data.vl.vi[0] && !!this.data.vl.vi[0].fs) {
					return parseInt(this.data.vl.vi[0].fs,10);
				}
				return 0;
			}
	
			this.getTimelong = function() {
				return this.getDuration();
			}
	
			/**
			 * 获取视频结束点跟视频文件最后一帧的绝对值时间
			 */
			this.getEndOffset = function() {
				return this.getDuration() - this.getTail();
			}
	
			/**
			 * 设置直播频道id
			 */
			this.setChannelId = function(cnlid) {
				if (!tvp.$.isString(cnlid)) {
					return;
				}
				// this.clear();
				_channelId = cnlid;
				return this;
			}
	
			/**
			 * 获取直播频道id
			 */
			this.getChannelId = function(cnlid) {
				return _channelId;
			}
	
			this.getFullVid = function() {
				if (this.getIdx() == 0) {
					return getRealVid(this.getVid());
				}
				return (getRealVid(this.getVid()) + "_" + this.getIdx());
			};
	
			this.getTitle = function() {
				if (privData.title === "") {
					if (this.data) {
						if (this.data.playtype == "mp4" && this.data.vl && $.isArray(this.data.vl.vi) && this.data.vl.vi.length > 0) {
							privData.title = this.data.vl.vi[0].ti || "";
						} else if (this.data.playtype == "hls" && $.isArray(this.data.vi) && this.data.vi.length > 0) {
							privData.title = this.data.vi[0].title || "";
						}
					}
				}
				return privData.title;
			}
	
			/**
			 * 清除数据 还原状态
			 *
			 * @public
			 */
			this.clear = function() {
				_vid = "", _vidlist = "", _vidCnt = 0, _idx = 0, _channelId = "",
				getFormatListDefer = null, loadServerDefer = {};
				$.extend(privData, defaultPrivData);
				this.data = {};
				this.url = "";
			};
	
			/**
			 * 克隆，复制对象
			 */
			this.clone = function(obj) {
				obj.setVid(_origvid);
				obj.setChannelId(_channelId);
				for (var k in privData) {
					var n = k.charAt(0).toUpperCase() + k.substr(1);
					obj["set" + n](this["get" + n]());
				}
				$.extend(obj.data, this.data);
			}
	
			/**
			 * 获取缩略图地址
			 */
			this.getVideoSnap = function() {
				var img = [];
				img[0] = tvp.common.getVideoSnap(_vid, _idx);
				img[1] = img[0].replace("_160_90_3", "_1");
				img[2] = img[1].replace("_1.jpg", ".png");
				return img;
			};
	
			/**
			 * 获取MP4文件地址
			 */
			this.getMP4Url = function(v) {
				var vid = "",
					vidArr = this.getVidArray(),
					fullvid = "";
	
				if ($.isString(v)) {
					vid = v;
					if ($.inArray(v, vidArr) < 0) {
						var d = $.Deferred();
						d.reject();
						return d;
					}
				} else if (!isNaN(v)) {
					fullvid = vid = this.getVidArray()[v >= vidArr.length ? 0 : v];
				} else {
					vid = this.getVid();
					fullvid = this.getFullVid();
				}
	
				this.lastQueryVid = fullvid || vid;
				this.setRid($.createGUID());
	
				var defKey = vid + "_mp4_" + this.getFormat();
				if ($.type(loadServerDefer[defKey]) == "object" && $.isFunction(loadServerDefer[defKey].done) && loadServerDefer[defKey].state() == "resolved") {
					return loadServerDefer[defKey];
				}
				loadServerDefer[defKey] = $.Deferred();
				var t = this;
				tvp.h5Helper.loadVideoUrlByVid({
					vid: vid,
					isPay: this.getPay(),
					fmt: this.getFormat(),
					appId : curPlayer instanceof tvp.Player ? curPlayer.config.appid : 0,
					contentId : curPlayer instanceof tvp.Player ? curPlayer.config.contentId : ""
				}).done(function(videourl, sd) {
					t.url = videourl;
					t.data = sd;
					t.data.playtype = "mp4";
					if ( !! loadServerDefer[defKey]) loadServerDefer[defKey].resolve(videourl);
				}).fail(function(errcode, errcontent) {
					if ( !! loadServerDefer[defKey]) loadServerDefer[defKey].reject(errcode, $.isUndefined(errcontent) ? 0 : errcontent);
				});
				return loadServerDefer[defKey];
			};
	
			this.getHLS = function(v) {
				var vid = "",
					vidArr = this.getVidArray(),
					fullvid = "";
	
				if ($.isString(v)) {
					vid = v;
					if ($.inArray(v, vidArr) < 0) {
						var d = $.Deferred();
						d.reject();
						return d;
					}
				} else if (!isNaN(v)) {
					fullvid = vid = this.getVidArray()[v >= vidArr.length ? 0 : v];
				} else {
					vid = this.getVid();
					fullvid = this.getFullVid();
				}
	
				this.lastQueryVid = fullvid || vid;
				this.setRid($.createGUID());
	
				var defKey = vid + "_hls_" + this.getFormat();
				if ($.type(loadServerDefer[defKey]) == "object" && $.isFunction(loadServerDefer[defKey].done) && loadServerDefer[defKey].state() == "resolved") {
					return loadServerDefer[defKey];
				}
				loadServerDefer[defKey] = $.Deferred();
				var t = this;
				tvp.h5Helper.loadHLSUrlByVid({
					vid: vid,
					isPay: this.getPay(),
					fmt: this.getFormat(),
					appId : curPlayer instanceof tvp.Player ? curPlayer.config.appid : 0,
					contentId : curPlayer instanceof tvp.Player ? curPlayer.config.contentId : ""
				}).done(function(videourl, sd) {
					t.url = videourl;
					t.data = sd;
					t.data.playtype = "hls";
					if ( !! loadServerDefer[defKey]) loadServerDefer[defKey].resolve(videourl);
				}).fail(function(errcode, errcontent) {
					if ( !! loadServerDefer[defKey]) loadServerDefer[defKey].reject(errcode, $.isUndefined(errcontent) ? 0 : errcontent);
				});
				return loadServerDefer[defKey];
			};
	
			/**
			 * 获取正在播放的清晰度
			 * @return {[type]} [description]
			 */
			this.getPlayFormat = function() {
				if (!$.isPlainObject(this.data)) return this.getFormat();
				if ($.type(this.data.fl) == "object" && $.isArray(this.data.fl.fi)) {
					var fi = this.data.fl.fi;
					for (var i = 0; i < fi.length; i++) {
						if (fi[i].sl == 1) return fi[i].name;
					}
				}
				return this.getFormat();
			};
	
			/**
			 * 获取当前视频软字幕语言列表
			 * @return {[type]} [description]
			 */
			this.getSrtLangList = function() {
				if ($.type(this.data.sfl) == "object" && $.isArray(this.data.sfl.fi)) {
					$.each(this.data.sfl.fi, function(i, obj) {
						obj.desc = tvp.html5lang.getSrtName(obj.id);
					});
					return this.data.sfl.fi;
				}
				return [];
			};
	
			/**
			 * 获取指定软字幕的URL列表
			 * @param  {[type]} sflobj [description]
			 * @return {[type]}        [description]
			 */
			this.getSrtUrlList = function(sflobj) {
				if ($.isUndefined(sflobj)) {
					var arr = this.getSrtLangList();
					if (arr.length > 0) {
						sflobj = arr[0];
					} else {
						return $.Deferred().reject(-1);
					}
				}
	
				if ($.type(sflobj) != "object" && !isNaN(sflobj)) {
					for (var i = 0, len = this.data.sfl.fi.length; i < len; i++) {
						if (this.data.sfl.fi[i].id == sflobj) {
							sflobj = this.data.sfl.fi[i];
							break;
						}
					}
					if ($.type(sflobj) != "object") {
						return $.Deferred().reject(-2);
					}
				}
	
				var vid = this.getVid(),
					defKey = vid + "_srt_" + sflobj.id;
	
				if ($.type(loadServerDefer[defKey]) == "object" && $.isFunction(loadServerDefer[defKey].done) && loadServerDefer[defKey].state() == "resolved") {
					return loadServerDefer[defKey];
				}
	
				loadServerDefer[defKey] = $.Deferred();
	
				var t = this;
				tvp.h5Helper.loadSRT({
					"vid": vid,
					"sflid": sflobj.id,
					"pid": t.getPid()
				}).done(function(json) {
					var urls = [];
					if ($.type(json.ul) == "object" && $.isArray(json.ul.ui)) {
						$.each(json.ul.ui, function(i, v) {
							urls.push([v.url, "lang=" + sflobj.name].join("?"));
						});
					}
					loadServerDefer[defKey].resolve(urls);
				}).fail(function(errcode) {
					loadServerDefer[defKey].reject(errcode);
				});
	
				return loadServerDefer[defKey];
			}
	
			/**
			 * 获取当前视频支持的格式
			 * @return {Array} 当前视频支持的格式
			 */
			this.getFormatList = function() {
	
				// 这里的defer不像loadServerDefer作为一个对象容器，每个视频vid对应一个defer，原因是用|拼出来的多个视频列表连播，往往清晰度一致的
				if ($.type(getFormatListDefer) == "object" && $.isFunction(getFormatListDefer.done)) {
					return getFormatListDefer;
				}
				getFormatListDefer = $.Deferred();
				var t = this,
					canplaylist = ["mp4", "msd"],
					getFn = function() {
						var filist = [];
						if (!$.isPlainObject(t.data.fl) || !$.isArray(t.data.fl.fi)) return [];
						$.each(t.data.fl.fi, function(k, v) {
							if ($.inArray(v.name, canplaylist) != -1) {
								filist.push(v.name);
							}
						});
						return filist;
					};
	
				this.getMP4Url().done(function() {
					getFormatListDefer.resolve({
						"list": getFn()
					})
				}).fail(function() {
					getFormatListDefer.reject({
						"list": []
					});
				});
				return getFormatListDefer;
			};
	
	
			/**
			 * 当前视频文件是否是有硬字幕
			 * @return {Boolean} [description]
			 */
			this.hasHardSubtitle = function() {
				var format = video.getFormat();
				for (var i = 0, len = this.data.fl.fi.length; i < len; i++) {
					var fi = this.data.fl.fi[i];
					if (fi.name == format) {
						return !!fi.sb;
					}
				}
				return false;
			};
	
			/**
			 * 当前视频文件是否包含软字幕
			 * @return {Boolean} [description]
			 */
			this.hasSoftSubtitle = function() {
				return ($.type(this.data.sfl) == "object" && $.isArray(this.data.sfl.fi) && this.data.sfl.fi.length > 0);
			}
		};
	
	
		/**
		 * 定义视频播放类型——直播或者点播
		 *
		 * @namespace tvp.PLAYTYPE
		 * @type {Object}
		 */
		tvp.PLAYTYPE = {
			/**
			 * 直播
			 *
			 * @default 1
			 * @type String
			 */
			LIVE: "1",
			/**
			 * 点播
			 *
			 * @default 2
			 * @type String
			 */
			VOD: "2"
		}
	
	})(tvp, tvp.$);
	;(function($){
		tvp.speedlimit = {
			buildResult:function(vid){
				var haskey = false;
				var mqqHaskey = false;
				var defer = $.Deferred();
				if($.browser.MQQ && $.browser.version > 5.1){
					mqqHaskey = true;
				}
				
				if(mqqHaskey){
					this.mqqGetResult(vid).then(function(mqqrs){
						if(mqqrs){
							defer.resolve(mqqrs);
						}else{
							defer.resolve();
						}
					});
				}
	
				if(mqqHaskey){
					haskey = true;
				}
	
				if(!haskey){
					defer.resolve();
				}
	
				setTimeout(function(){
					defer.resolve();
				},3000);
				return defer;			
			},
			mqqGetResult:function(vid){
				var defer = $.Deferred();
	
				function _cb(){
					if(window.x5 && window.x5.getBrowserSignature){
						try{
							var time = parseInt(tvp.$.now()/1000,10);
				         	x5.getBrowserSignature('vid:'+vid+'['+time+']',function(rskey){
				         		if(rskey){
					         		defer.resolve({
					         			bver:$.browser.version,
					         			pkckey:rskey
					         		});
				         		}else{
				         			defer.resolve();
				         		}
				         	},function(){
				         		defer.resolve();
				         	}); 					
						}catch(e){
							defer.resolve();
						}
					}else{
						defer.resolve();
					}
	
					setTimeout(function(){
						defer.resolve();
					},300);
				};
	
				if(window.x5 && window.x5.getBrowserSignature){
					_cb();
				}else if(tvp.app){
					if(!tvp.app.loadMqqDefer){
						tvp.app.loadMqqDefer = tvp.app.loadMqqAPI();
					}
					tvp.app.loadMqqDefer.done(function(){
						_cb();
					});
					tvp.app.loadMqqDefer.fail(function(){
						defer.resolve();
					});										
				}else{
					defer.resolve();
				}
				return defer;
			}
		};
	})(tvp.$);
	var Qvsec = {};
	Qvsec.ha = function(clss) {
	                        var k = [],
	                        i = 0;
	                        for (; i < 64;) {
	                            k[i] = 0 | (Math.abs(Math.sin(++i)) * 4294967296)
	                        };
	                        function add(x, y) {
	                            return (((x >> 1) + (y >> 1)) << 1) + (x & 1) + (y & 1)
	                        };
	                        var calcSHA = function(str) {
	                            var b, c, d, j, x = [],
	                            str2 = unescape(encodeURI(str)),
	                            a = str2.length,
	                            h = [b = 1732584193, c = -271733879, ~b, ~c],
	                            i = 0;
	                            for (; i <= a;) x[i >> 2] |= (str2.charCodeAt(i) || 128) << 8 * (i++%4);
	                            x[str = (a + 8 >> 6) * clss + 14] = a * 8;
	                            i = 0;
	                            for (; i < str; i += clss) {
	                                a = h,
	                                j = 0;
	                                for (; j < 64;) {
	                                    a = [d = a[3], add(b = a[1], (d = add(add(a[0], [b & (c = a[2]) | ~b & d, d & b | ~d & c, b ^ c ^ d, c ^ (b | ~d)][a = j >> 4]), add(k[j], x[[j, 5 * j + 1, 3 * j + 5, 7 * j][a] % clss + i]))) << (a = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, clss, 23, 6, 10, 15, 21][4 * a + j++%4]) | d >>> 32 - a), b, c]
	                                };
	                                for (j = 4; j;) h[--j] = add(h[j], a[j])
	                            };
	                            str = '';
	                            for (; j < 32;) str += ((h[j >> 3] >> ((1 ^ j++&7) * 4)) & 15).toString(clss);
	                            return str;
	                        };
	                        return calcSHA
	                    } (16);
	
						
	Qvsec.stringToHex = function(s) {
	  var r = "";
	  var hexes = new Array ("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");
	  for (var i=0; i<s.length; i++) {r += hexes [s.charCodeAt(i) >> 4] + hexes [s.charCodeAt(i) & 0xf];}
	  return r;
	}
	
	Qvsec.hexToString = function(h) {
	  var r = "";
	  for (var i= (h.substr(0, 2)=="0x")?2:0; i<h.length; i+=2) {r += String.fromCharCode (parseInt (h.substr (i, 2), 16));}
	  return r;
	}
	
	Qvsec._Seed = "#$#@#*ad";
	
	Qvsec.tempcalc = function(a,b) {
		var r = "";
		for(var i = 0; i < a.length; i++)
			r += String.fromCharCode(a.charCodeAt(i) ^ b.charCodeAt(i%4));
		return r;
	}
	
	Qvsec.u1 = function(a,b) {
		var r = "";
		for(var i = b; i < a.length; i += 2)
			r += a.charAt(i);
		return r;
	}
	
	Qvsec._urlStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	
	Qvsec.urlenc = function (input, sts, ts) {
			var output = "";
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;
			while (i < input.length) {
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);
				if(i == 15)
				{
					output = output + 'A';
					output = output + sts;
					output = output + ts;
				}
				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;
				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}
				output = output +
				Qvsec._urlStr.charAt(enc1) + Qvsec._urlStr.charAt(enc2) +
				Qvsec._urlStr.charAt(enc3) + Qvsec._urlStr.charAt(enc4);
			}
			return output;
		}
	
	Qvsec.$xx = function(plt,vid,std,sts){
	    var ts = ''+Math.floor(new Date().valueOf()/1000);
		var sts = (''+sts).charAt(0);
	    var rf = '';
	    var ua = '';
	    var p = {plt:plt||'',vid:vid||'',std:std||'',sts:sts||'',ts:ts,rf:rf,ua:ua};
	    if(window.JSON) 
	        p = JSON.stringify(p)
	    else
	        p = (function(){
	            var arr = []
	            for(var prop in p){
	                arr.push('"'+prop+'":'+'"'+p[prop]+'"');
	            }
	            return '{'+arr.join(',')+'}'
	        })(p);
		
		var result = Qvsec.hexToString(Qvsec.ha(plt+vid+ts+Qvsec._Seed+rf+ua+sts.charAt(0)+std));
	    var u = Qvsec.urlenc(Qvsec.tempcalc(result,Qvsec._Seed), sts.charAt(0),ts);
	    var c = Qvsec.urlenc(Qvsec.tempcalc(result,'86FG@hdf'), sts.charAt(0),ts);
		var u1 = Qvsec.u1(u,0);
		var u2 = Qvsec.u1(u,1);
	    return {p:p,u:u,c:c,u1:u1,u2:u2,t:ts};
	};
	
	/**
	 * @fileOverview HTML5获取服务器视频文件信息通用接口
	 */
	
	;
	(function(tvp, $) {
		var globalCfg = {
			isHLS : false,
			isPay : false,
			vid : "",
			fmt : "auto",
			platform : 11001,
			host : window != top ? document.referrer : document.location.host
		},
			/**
			 * 替换视频文件域名为指定的域名
			 */
			specialVideoFileDomain = "";
	
		globalCfg.cgi = (function() {
			if (globalCfg.host === 'view.inews.qq.com') {
				var str = '';
				if ($.browser.WeChat) {
					str = 'nocache=1&';
				}
				return {
					getinfo : 'http://wxv.video.qq.com/getinfo?callback=?&',
					getkey : 'http://wxv.video.qq.com/getkey?callback=?&' + str
				};
			}
			else {
				return {
					getinfo : 'http://vv.video.qq.com/getinfo?callback=?&',
					getkey : 'http://vv.video.qq.com/getkey?callback=?&'
				};
			}
		})();
	
		globalCfg.retryCgi = (function() {
			if ($.browser.WeChat || $.browser.MQQClient) {
				return {
					getinfo : globalCfg.cgi.getinfo.replace(/(\/\/)(.+?)(\/|$)/, "$1bkpush.video.qq.com$3"),
					getkey : globalCfg.cgi.getkey.replace(/(\/\/)(.+?)(\/|$)/, "$1bkpush.video.qq.com$3")
				}
			}
			else {
				return {
					getinfo : globalCfg.cgi.getinfo.replace(/(\/\/)(.+?)(\/|$)/, "$1tt.video.qq.com$3"),
					getkey : globalCfg.cgi.getkey.replace(/(\/\/)(.+?)(\/|$)/, "$1tt.video.qq.com$3")
				}
			}
		})();
	
		/**
		 * 获取要增加到MP4文件的后缀参数
		 *
		 * @ignore
		 * @private
		 */
	
		function getMp4Key() {
			var flag1 = globalCfg.host === 'view.inews.qq.com';
			if ($.os.iphone || $.os.ipod) {
				return flag1 ? "v3110" : "v3010";
			}
	
			if ($.os.ipad) {
				return flag1 ? "v4110" : "v4010";
			}
			if ($.os.android) {
				// userAgent里说了这是pad，或者屏幕宽度大于600，说明这是Android Pad
				if ($.os.tablet || screen.width >= 600) {
					return "v6010";
				}
				return flag1 ? "v5110" : "v5010"
			}
			if ($.browser.IEMobile) {
				return "v7010";
			}
			return "v1010";
		}
	
		/**
		 * 获得请求getkey时的format参数
		 * @param  {type} fi [description]
		 * @return {type}    [description]
		 */
	
		function getKeyFormat(cfg, fi) {
			for (var i = 0, len = fi.length; i < len; i++) {
				if (fi[i].sl == 1) {
					return fi[i].id;
				}
			}
			return -1;
		}
	
		/**
		 * 实时监控数据上报
		 * @param {Object} params 要上报的数据
		 */
		function reportToBoss(params) {
			var _param = {
				cmd : 3532,
				speed : 0,
				appId : 0,
				contentId : "",
				vid : "",
				itype : 1, // 请求的cgi类型，1：getinfo,2:getkey,3:gethls
				val : 0, // cgi返回码
				val2 : 0, // 是否是重试
				str3 : "" // 请求的地址
			}
			params = $.extend(_param, params);
			tvp.report(params);
		}
	
		/**
		 * 拼接mp4文件地址
		 */
		function getMp4Url(json) {
			json = json || {};
			var videourl,
				hasAlias = false;
			if (json.alias && typeof json.fn == "string" && json.vid) {
				json.fn = json.fn.replace(json.vid, json.alias);
				hasAlias = true;
			}
			if (specialVideoFileDomain && typeof json.path == "string") {
				json.path = json.path.replace(/\/\/(.+?)(\/|#|$|\?)/, function() {
					        if (arguments.length > 1) {
						        return arguments[0].replace(arguments[1], specialVideoFileDomain);
					        }
					        return arguments[0];
				        });
			}
	
			if (json["path"].indexOf('?') > -1) {
				videourl = json["path"] + '&' + json["fn"] + "&vkey=" + json.vkey + "&br=" + json["br"] + "&platform=2&fmt=" + json.fmt + "&level=" + json.level + "&sdtfrom=" + getMp4Key();
			}
			else {
				videourl = json["path"] + json["fn"] + "?vkey=" + json.vkey + "&br=" + json["br"] + "&platform=2&fmt=" + json.fmt + "&level=" + json.level + "&sdtfrom=" + getMp4Key();
			}
	
			if ($.isString(json.sha) && json.sha.length > 0) {
				videourl += "&sha=" + json.sha;
			}
			if (hasAlias) {
				videourl += "&vidalias=1";
			}
			return videourl;
		}
	
		function makeReportFn(params) {
			return function(_params) {
				reportToBoss($.extend(params, _params));
			}
		}
	
		/**
		 * 为请求的cgi增加hash参数
		 * @param {String} url 请求的url
		 */
		function appendHashParams(url) {
			var platform, vid, sdtfrom,
				tmpStr = '',
				sts = 1,
				hashObj = {};
			if (typeof Qvsec == 'object' && typeof Qvsec.$xx == 'function' && typeof url == 'string') {
				platform = $.getUrlParam('platform', url);
				vid = $.getUrlParam('vids', url);
				sdtfrom = getMp4Key();
				try {
					hashObj = Qvsec.$xx(platform, vid, sdtfrom, sts);
				}
				catch (e) {
					if (typeof tvp.reportErr == 'function' && e && e.message) {
						tvp.reportErr(e.message);
					}
				}
				if (hashObj) {
					// tmpStr = '_qv_rnd=' + hashObj.u;
					tmpStr = tmpStr + '&_qv_rmt=' + hashObj.u1;
					tmpStr = tmpStr + '&_qv_rmt2=' + hashObj.u2;
					tmpStr = tmpStr + '&sdtfrom=' + sdtfrom;
					url = url + (url.indexOf('?') == -1 ? '?' : '&') + tmpStr;
					$.cookie.set('qv_als', hashObj.c);
				}
			}
			return url;
		}
		tvp.h5Helper = {
			/**
			 * 为了限速此处要先得到一些参数
			 * @param  {Object} cfg 配置
			 * @return defer
			 */
			loadVideoUrlByVid : function(cfg) {
				var defer = '';
				if (tvp.speedlimit) {
					defer = $.Deferred();
					tvp.speedlimit.buildResult().done(function(rs) {
					 	var realDefer = tvp.h5Helper.loadVideoUrlByVid_base(cfg, rs);
						realDefer.done(function(a, b) {
							defer.resolve(a, b);
						});
						realDefer.fail(function(a, b) {
							defer.reject(a, b);
						});
					});
				}
				else {
					defer = tvp.h5Helper.loadVideoUrlByVid_base(cfg);
				}
	
				return defer;
			},
			/**
			 * 读取视频MP4文件
			 * @param  {Object} cfg 配置
			 * @return {$.Deferred}    $.Deferred对象
			 */
			loadVideoUrlByVid_base : function(cfg, rs) {
				var s = {},
					infoData = {},
					defer = $.Deferred();
				$.extend($.extend(s, globalCfg), cfg);
				var retcode_getinfo = new tvp.RetCode(100126),
					isRetry = false,
					getinfocgi = globalCfg.cgi.getinfo,
					startTime = $.now(),
					speed = 0,
					url = "",
					reportToBossFn = $.noop,
					getkeycgi = globalCfg.cgi.getkey;
				var isWxAuth = false, urlParams;
				var baseParams = {};
				// 微信鉴权
				if(cfg && !cfg.noAuth){
					urlParams = tvp.common.getParams(location.href);
					var isIframePlayer = location.hostname === 'v.qq.com' 
						&& location.pathname === '/iframe/player.html';
					if(isIframePlayer && urlParams
						&& urlParams.cKey 
						&& urlParams.encryptVer 
						&& urlParams.platform){
						isWxAuth = true;
					}
				}
				// 微信鉴权失败走不鉴权的逻辑，defer续期
				if(cfg.defer){
					defer = cfg.defer;
				}
				if (cfg.retryDefer && $.isFunction(cfg.retryDefer.reject)) {
					isRetry = true;
					defer = cfg.retryDefer;
					getinfocgi = globalCfg.retryCgi.getinfo;
					getkeycgi = globalCfg.retryCgi.getkey;
				}
				if (cfg.loadingAdCgi) {// 如果当前请求的是loading广告
					getinfocgi = cfg.loadingAdCgi;
				}
				baseParams = {
					vids : s.vid,
					platform : s.platform,
					charge : s.isPay ? 1 : 0,
					otype : "json",
					defaultfmt : s.fmt,
					sb : 1,
					nocache : ($.browser.MQQClient || $.browser.WeChat) ? 1 : 0,
					_rnd : new Date().valueOf()
				}
				// 添加鉴权参数
				if(isWxAuth && urlParams){
					$.extend(baseParams, {
						platform: urlParams.platform,
						cKey: urlParams.cKey,
						encryptVer: urlParams.encryptVer
					});
					if(urlParams.platform.toString()==='61001'
						&& window.parent !== window
						&& window.parent.location
						&& window.parent.location.href
						){
						baseParams.wxrefer = window.parent.location.href;
					}
				}
				url = getinfocgi + $.param(baseParams);
				// 此处加上限速的参数
				if (rs && $.type(rs) === 'object') {
					url += '&' + $.param(rs);
				}
				url = appendHashParams(url);
				
				reportToBossFn = makeReportFn({
					itype : 1,
					val2 : isRetry ? 1 : 0,
					str3 : url,
					vid : s.vid,
					appId : s.appId,
					contentId : s.contentId
				});
				retcode_getinfo.begin();
				reportToBossFn();
				var getInfoCb = function(infojson){
					var iRetCode = 0,
					// 返回码
					exVal = undefined, vi;
					// getinfo返回的结果详细说明见
					// http://tapd.oa.com/v3/shiping_dev/wikis/view/getinfo
					// 如果返回结果不是预期的合法数据
					speed = $.now() - startTime;
					if (!infojson || !infojson.s) {
						iRetCode = 50;
					}
					else if (infojson.s != "o") {
						iRetCode = infojson.em || 50;
						exVal = infojson.exem;
					}
					else if (!infojson.vl || !infojson.vl.vi || !$.isArray(infojson.vl.vi) || infojson.vl.cnt == 0) {
						iRetCode = 68;
					}
					else {
						// TODO:多个视频vids需要循环做判断，现在这里只判断了一个视频
						vi = infojson.vl.vi[0];
					}
					// 视频文件不可以播放，或者视频文件不允许访问，或者根本就没有播放地址，就告知62错误，表示视频状态不合法
					// TODO:区分视频付费状态码
					if (iRetCode == 0 && (vi.fst != 5 || !$.isPlainObject(vi.ul) || !$.isArray(vi.ul.ui) || vi.ul.ui.length == 0)) {
						iRetCode = 62; // 视频状态不合法
					}
	
					// 视频状态不对
					else if (iRetCode == 0 && vi.st != 2) {
						if (vi.st != 8) {
							iRetCode = 62; // 视频状态不合法
						}
						else {
							iRetCode = 83;
							exVal = vi.ch;
						}
					}
					if (iRetCode != 0) {
						reportToBossFn({
							val : iRetCode,
							speed : speed
						});
						retcode_getinfo.reportErr(iRetCode);
						defer.reject(iRetCode, exVal);
						return;
					}
					retcode_getinfo.reportSuc();
					reportToBossFn({
						val : 0,
						speed : speed
					});
					// 如果是广告就不用再拉取vkey也不用拼接播放地址了
					if (cfg.loadingAdCgi) {
						defer.resolve(vi.ul.ui[0].url, {
						vl : infojson.vl,
						fl : infojson.fl,
						sfl : infojson.sfl,
						exem : infojson.exem,
						preview : infojson.preview
						});
						return;
					}
					if (vi.fvkey) {// getinfo 已经把key带上了就不用再去请求getkey了。
						exVal = getMp4Url({
							path : vi.ul.ui[0].url,
							fn : vi.fn,
							vkey : vi.fvkey,
							br : vi.br,
							platform : 2,
							fmt : s.fmt,
							level : vi.level,
							sdtfrom : getMp4Key(),
							sha : vi.fsha,
							vid : s.vid,
							alias : vi.alias
						});
						defer.resolve(exVal, {
							vl : infojson.vl,
							fl : infojson.fl,
							sfl : infojson.sfl,
							exem : infojson.exem,
							preview : infojson.preview
						});
						return;
					}
					getVkey();
				};
				var getVkey = function(){
					var ui = vi.ul.ui[0], retcode_getkey;
					infoData["br"] = vi.br;
					infoData["path"] = ui.url;
					infoData["fn"] = vi.fn;
					infoData["fiid"] = getKeyFormat(s, infojson.fl.fi);
					infoData["vt"] = ui.vt;
					retcode_getkey = new tvp.RetCode(100127);
					retcode_getkey.begin();
					startTime = $.now();
					url = getkeycgi + $.param({
						"otype" : "json",
						"vid" : s.vid,
						"format" : infoData.fiid,
						"filename" : infoData.fn,
						"platform" : s.platform,
						"vt" : infoData.vt,
						"charge" : s.isPay ? 1 : 0,
						"_rnd" : new Date().valueOf()
					});
					url = appendHashParams(url);
					reportToBossFn = makeReportFn({
						itype : 2,
						val2 : isRetry ? 1 : 0,
						str3 : url,
						vid : s.vid,
						appId : s.appId,
						contentId : s.contentId
					});
					reportToBossFn();
					$.ajax({
						url : url,
						dataType : "jsonp"
					}).done(function(keyjson) {
						var videourl = "",
						charge = -2;
						iRetCode = 0;
						speed = $.now() - startTime;
						// 如果返回结果不是预期的合法数据
						if (!keyjson || !keyjson.s) {
							iRetCode = 50;
						}
						else if (keyjson.s != "o") {
							iRetCode = keyjson.em || 50;
						}
						if (iRetCode != 0) {
							retcode_getkey.reportErr(iRetCode);
							reportToBossFn({
								val : iRetCode,
								speed : speed
							});
							defer.reject(iRetCode);
							return;
						}
						videourl = getMp4Url({
							path : infoData.path,
							fn : infoData.fn,
							vkey : keyjson.key,
							br : infoData.br,
							platform : 2,
							fmt : s.fmt,
							level : keyjson.level,
							sdtfrom : getMp4Key(),
							sha : keyjson.sha,
							vid : s.vid,
							alias : vi.alias
						});
						retcode_getkey.reportSuc();
						reportToBossFn({
							val : 0,
							speed : speed
						});
						defer.resolve(videourl, {
							"vl" : infojson.vl,
							"fl" : infojson.fl,
							"sfl" : infojson.sfl,
							"exem" : infojson.exem,
							"preview" : infojson.preview
						});
					}).fail(function() {
						retcode_getkey.reportErr();
						reportToBossFn({
							val : 500,
							speed : $.now() - startTime
						});
						if (!isRetry) {
							cfg.retryDefer = defer;
							tvp.h5Helper.loadVideoUrlByVid(cfg);
						}
						else {
							defer.reject(500, 2);
						}
					});
				};
				$.ajax({
					url : url,
					dataType : "jsonp"
				}).done(function(infojson) {
					if(!cfg.noAuth
						&& (infojson && (infojson.em!=0 && infojson.s != "o"))){
						cfg.noAuth = true;
						cfg.defer = defer;
						tvp.h5Helper.loadVideoUrlByVid(cfg);
						return;
					}
					getInfoCb(infojson);
				}).fail(function() {
					retcode_getinfo.reportErr();
					reportToBossFn({
						val : 500,
						speed : $.now() - startTime
					});
					if (!isRetry) {
						cfg.noAuth = true;
						cfg.retryDefer = defer;
						tvp.h5Helper.loadVideoUrlByVid(cfg);
					}
					else {
						defer.reject(500, 1);
					}
				});
				return defer;
			},
			/**
			 * 读取高清MP4地址
			 */
			loadHDVideoUrlByVid : function(cfg) {
				cfg.fmt = "mp4";
				tvp.h5Helper.loadVideoUrlByVid(cfg);
			},
	
			/**
			 * 根据vid读取HLS的路径
			 * @param  {[type]} cfg [description]
			 * @return {[type]}     [description]
			 */
			loadHLSUrlByVid : function(cfg) {
				var s = {},
					defer = $.Deferred();
				$.extend($.extend(s, globalCfg), cfg);
	
				var retcode = new tvp.RetCode(100128),
					url = "http://vv.video.qq.com/gethls?callback=?&" + $.param({
						        "vid" : s.vid,
						        "charge" : s.isPay ? 1 : 0,
						        "otype" : "json",
						        "platform" : s.platform,
						        "_rnd" : new Date().valueOf()
					        }),
					reportToBossFn = makeReportFn({
						        itype : 3,
						        str3 : url,
						        vid : s.vid,
						        appId : s.appId,
						        contentId : s.contentId
					        }),
					startTime = $.now();
				url = appendHashParams(url);
				reportToBossFn();
				retcode.begin();
				$.ajax({
					        "url" : url,
					        "dataType" : "jsonp"
				        }).done(function(json) {
					        // 如果返回结果不是预期的合法数据
					        if (!json || !json.s) {
						        retcode.reportErr(50);
						        reportToBossFn({
							                speed : $.now() - startTime,
							                val : 50
						                });
						        defer.reject(50);
						        return;
					        }
					        else if (json.s != "o") {
						        retcode.reportErr(json.em || 50);
						        reportToBossFn({
							                speed : $.now() - startTime,
							                val : json.em || 50
						                });
						        defer.reject(json.em || 50);
						        return;
					        }
					        else if (!json.vd || !json.vd.vi || !tvp.$.isArray(json.vd.vi)) {
						        retcode.reportErr(68);
						        reportToBossFn({
							                speed : $.now() - startTime,
							                val : 68
						                });
						        defer.reject(68);
						        return;
					        }
	
					        var videourl = [],
						        charge = -2;
					        for (var i = 0; i < json.vd.vi.length; i++) {
						        charge = json.vd.vi[i].ch;
	
						        if (json.vd.vi[i].st != 2)
							        continue;
	
						        var url = json.vd.vi[i].url.toLowerCase();
						        if (url.indexOf(".mp4") < 0 && url.indexOf(".m3u8") < 0)
							        continue;
	
						        if (!!json.vd.vi[i].url) {
							        var d = json.vd.vi[i];
							        videourl.push(d.url);
							        // try {
							        // videodata.duration = parseInt(d.dur);
							        // videodata.vt = d.vt;
							        // videodata.vurl = d.url;
							        // videodata.bt = curVideo.getTimelong() ||
							        // videodata.duration;
							        // } catch (e) {}
							        break;
						        }
					        }
	
					        if (videourl.length == 0) {
						        retcode.reportErr(68);
						        reportToBossFn({
							                speed : $.now() - startTime,
							                val : 68
						                });
						        defer.reject(68, charge);
						        return;
					        }
					        reportToBossFn({
						                speed : $.now() - startTime,
						                val : 0
					                });
					        retcode.reportSuc();
					        defer.resolve(videourl[0], json.vd);
	
				        }).fail(function() {
					        retcode.reportErr();
					        reportToBossFn({
						                speed : $.now() - startTime,
						                val : 500
					                });
					        defer.reject(500, 3);
				        });
				return defer;
			},
			/**
			 * 读取手机200K码率的视频文件MP4地址
			 * @param  {Object} cfg 配置
			 * @return {[type]}     [description]
			 */
			load3GVideoUrl : function(cfg) {
				cfg.fmt = "msd";
				tvp.h5Helper.loadVideoUrlByVid(cfg);
			},
			/**
			 * 读取CGI判断当前vid是否要求使用HLS
			 * @param  {[type]} cfg [description]
			 * @return {[type]}     [description]
			 */
			loadIsUseHLS : function(cfg) {
				var s = {},
					infoData = {},
					defer = $.Deferred();
				$.extend($.extend(s, globalCfg), cfg);
	
				var retcode = new tvp.RetCode(100125);
				retcode.begin();
				// CGI说明 http://tapd.oa.com/v3/shiping_dev/wikis/view/getdtype
				$.ajax({
					        url : "http://vv.video.qq.com/getdtype?callback=?&" + $.param({
						                "vids" : s.vid,
						                "platform" : s.platform,
						                "otype" : "json",
						                "_rnd" : new Date().valueOf()
					                }),
					        dataType : "jsonp"
				        }).done(function(json) {
					        var dltype = 1;
					        if ($.type(json) != "object") {
						        retcode.reportErr();
						        defer.reject(500, 4)
						        return;
					        }
					        if (json.s != "o" || !$.isArray(json.dl) || json.dl.length == 0) {
						        retcode.reportErr(json.em);
						        defer.reject(json.em || 50);
						        return;
					        }
					        for (var i = 0, len = json.dl.length; i < len; i++) {
						        if (json.dl[i].vid === cfg.vid) {
							        dltype = json.dl[i].dltype;
						        }
					        }
					        retcode.reportSuc();
					        defer.resolve(dltype, json);
				        }).fail(function() {
					        retcode.reportErr();
					        defer.reject(500, 4);
				        });
				return defer;
			},
	
			/**
			 * 读取软字幕，CGI接口详情访问http://tapd.oa.com/v3/shiping_dev/wikis/view/getsurl
			 * @return {[type]} [description]
			 */
			loadSRT : function(cfg) {
				var s = {},
					infoData = {},
					defer = $.Deferred();
				$.extend($.extend(s, globalCfg), cfg);
	
				$.ajax({
					        url : "http://vv.video.qq.com/getsurl?" + $.param({
						                "vid" : s.vid,
						                "format" : s.sflid,
						                "platform" : s.platform,
						                "pid" : s.pid,
						                "otype" : "json",
						                "_rnd" : new Date().valueOf()
					                }),
					        dataType : "jsonp"
				        }).done(function(json) {
					        // 数据源错误
					        if ($.type(json) != "object") {
						        defer.reject(500);
						        return;
					        }
	
					        if (json.s != "o") {
						        defer.reject(isNaN(json.em) ? 500 : json.em, json.msg || "");
						        return;
					        }
					        defer.resolve(json);
				        }).fail(function() {
					        defer.reject(500);
				        });
				return defer;
			},
			/**
			 * 设置特殊文件域名
			 * @param {String} sDomain
			 */
			setSpecialVideoFileDomain : function(sDomain) {
				if (typeof sDomain == "string" && /^(\S+[\.])?qq\.com/.test(location.host)) {// 只有qq.com域及其子域可以设置
					specialVideoFileDomain = sDomain;
				}
			}
		}
	})(tvp, tvp.$);
	/**
	 * @fileOverview 腾讯视频云播放器 播放器基类
	 */
	
	/*
	 * @include "./tvp.define.js"
	 * @include "./tvp.jquery.js"
	 * @include "./tvp.common.js"
	 */
	
	;
	(function(tvp, $) {
		/**
		 * 播放器基类
		 *
		 * @class tvp.BasePlayer
		 * @param {number}
		 *          vWidth 宽度
		 * @param {number}
		 *          vHeight 高度
		 */
		tvp.BasePlayer = function() {
			var fnMap = {};//回调存储对象
			this.modId = "",
			this.sessionId = "", //当前回话id，每次创建播放器都有自己的sessionid，主要用于一些统计上报，区分每次输出播放器的多次上报
			this.$mod = null, //显示整个统一播放器输出内容的容器，$查询结果
			this.videomod = null, //仅播放器的容器
			this.playerid = "", // 当前实例
			this.curVideo = null, // 视频对象
			//this.curVid = "", //当前播放的视频vid
			this.instance = null, //当前创建的实例
			this.dataset = {}, //数据集,用于当前播放器内部的一些全局变量存储，
			/**
			 * 对外提供的播放事件
			 */
			this.eventList = [
				"inited",
				"play",
				"playing",
				"ended",
				"allended",
				"pause",
				"resume",
				"timeupdate",
				"getnext",
				"error",
				"stop",
				"fullscreen",
				"change",
				"write",
				"flashpopup",
				"getnextenable",
				"msg",
				"h5loadingadstart",
				"h5loadingadend"
			];
			/**
			 * addParam可以接受的参数
			 */
			this.config = {};
			/**
			 * 劫持tvp.Player对象的公共方法列表，外壳播放器调用这些方法实际上调用的实际new出来的播放器实例
			 */
			this.hijackFun = [
				"getPlayer",
				"getCurVideo",
				"showPlayer",
				"hidePlayer",
				"play",
				"pause",
				"getPlaytime",
				"setPlaytime",
				"getPlayerType",
				"resize"
			];
	
			this.prototype = {};
	
			(function(me) { // 对外提供的公开方法
				var arr = ["init", "addParam", "write", "setPlayerReady"];
				arr = arr.concat(me.hijackFun);
				for (var i = 0, len = arr.length; i < len; i++) {
					me.prototype[arr[i]] = tvp.$.noop; // 设置为空函数
				}
			})(this);
			/**
			 * 向播放器传递config配置参数
			 *
			 * @public
			 */
			this.addParam = function(k, v) {
				this.config[k] = v;
			}
			
			/**
			 * 挂载自定义事件回调到统一播放器实例上
			 * @param {String} name
			 * @param {Function} fn
			 */
			this.on = function(name,fn){
				if(name && $.isFunction(fn)){
					fnMap[name] = $.isArray(fnMap[name]) ? fnMap[name] : [];
					fnMap[name].push(fn);
				}
			}
			
			/**
			 * 触发自定义事件回调
			 * @param {String} name
			 */
			this.trigger = function(name){
				var args,idx,len;
				if(name && $.isArray(fnMap[name])){
					for(idx = 0,len = fnMap[name].length;idx < len;idx++){
						if($.isFunction(fnMap[name][idx])){
							args = Array.prototype.slice.call(arguments,1);
							fnMap[name][idx].apply(null,args);
						}
					}
				}
			},
			
			/**
			 * 删除自定义事件回调
			 * @param {String} name
			 * @param {Function} fn
			 */
			this.off = function(name,fn){
				var idx;
				if(name && $.isArray(fnMap[name])){
					if(fn){
						idx = $.inArray(fn,fnMap[name]);
						if(idx >= 0){
							fnMap[name][idx] = undefined;
						}
					}
					else{
						fnMap[name] = undefined;
					}
				}
			}
		}
	
		tvp.BasePlayer.prototype = {
			/**
			 * 设置当前播放视频对象
			 */
			setCurVideo: function(videoinfo) {
				// if (this.curVideo === null) {
				// 	this.curVideo = new tvp.VideoInfo();
				// }
				// if (videoinfo instanceof tvp.VideoInfo) {
				// 	videoinfo.clone(this.curVideo);
				// }
				this.curVideo = videoinfo;
			},
			getPlayer: function() {
				return null;
			},
			/**
			 * 获取当前传入的视频对象
			 *
			 * @ignore
			 */
			getCurVideo: function() {
				return this.curVideo;
			},
	
			/**
			 * 获取当前播放的视频vid，如果有多个视频，则返回第一个视频vid（主vid）
			 *
			 * @public
			 */
			getCurVid: function() {
				return (this.curVideo instanceof tvp.VideoInfo) ? this.curVideo.getVid() : "";
			},
			/**
			 * 获取当前播放的视频列表
			 *
			 * @public
			 */
			getCurVidList: function() {
				return (this.curVideo instanceof tvp.VideoInfo) ? this.curVideo.getVidList() : "";
			},
	
			/**
			 * 初始化
			 * @param  {[Object]} config 配置项
			 */
			init: function(config) {
	
				$.extend(this.config, config);
	
				// this.config.modWidth = this.config.modWidth || this.config.width;
				// this.config.modHeight = this.config.modHeight || this.config.height;
	
				for (var i = 0, len = this.eventList.length; i < len; i++) {
					var evtName = "on" + this.eventList[i];
					this[evtName] = $.isFunction(this.config[evtName]) ? this.config[evtName] : tvp.$.noop;
				}
	
				this.setCurVideo(this.config.video);
				this.write(this.config.modId);
			},
			/**
			 * 输出播放器
			 * @param  {[string]} id DOM结构id
			 */
			write: function(id) {
				$("#" + id).html("here is player of base");
			},
			/**
			 * 日志接口
			 * @param  {string} msg 日志正文
			 */
			log: function(msg) {
				if (window.console) {
					window.console.log(msg);
				}
			},
	
			/**
			 * 获得事件回调函数
			 * @param  {[type]} eventName [description]
			 * @return {[type]}           [description]
			 */
			getCBEvent: function(eventName) {
				var fn = undefined;
				//看看外壳对象是否有定义自定义的事件回调
				//这一般是创建完播放器以后player.onwrite=function(){}传入
				if (this.instance && $.isFunction(this.instance[eventName]) && this.instance[eventName] != tvp.$.noop) {
					fn = this.instance[eventName];
				}
				//如果当前对象定义了自定义的对应事件回调，并且不是默认的空函数，则优先执行
				//一般是由player.create({onwrite:function(){code here}})初始化时传入
				else if ($.isFunction(this[eventName]) && this[eventName] != tvp.$.noop) {
					fn = this[eventName];
				}
				return fn;
			},
			/**
			 * 调用事件回调
			 * @param  {[type]} eventName [description]
			 * @return {[type]}          [description]
			 */
			callCBEvent: function(eventName) {
				var fn = this.getCBEvent(eventName);
				if ($.isFunction(fn)) {
					var args = Array.prototype.slice.call(arguments, 1);
					return fn.apply(this, args);
				}
				return undefined;
			},
			/**
			 * 重新设置播放器尺寸
			 * @param  {[type]} width  [description]
			 * @param  {[type]} height [description]
			 * @return {[type]}        [description]
			 */
			resize: function(width, height) {
				var playerobj = this.getPlayer();
				if (!playerobj) return;
				playerobj.style.width = $.formatSize(width);
				playerobj.style.height = $.formatSize(height);
			},
			/**
			 * 显示播放器
			 */
			showPlayer: function() {
				var p = this.getPlayer();
				if (!p) return;
				p.style.position = "relative";
				p.style.left = "0px";
				p.style.top = "0px";
				//for qq浏览器
				if($.browser.MQQ || $.browser.UC){
					p.style.height = parseInt(this.config.height)+'px';
				}
			},
			/**
			 * 隐藏播放器
			 * @return {[type]} [description]
			 */
			hidePlayer: function() {
				var p = this.getPlayer();
				if (!p) return;
				p.style.position = "absolute"
				p.style.left = "-200%";
				//for qq浏览器
				if($.browser.MQQ || $.browser.UC){
					p.style.height = '1px';
				}
				tvp.log('clientWidth:' + p.clientWidth);
			},
			
			/**
			 * 执行flash播放器提供的方法
			 * @param {String} 要执行的方法名
			 * @return {Mix}
			 */
			execFlashMethod : function(fnName){
				var playerobj = this.getPlayer(),
					argArr = [],ret;
				if (!playerobj || !playerobj[fnName]){
					return;
				}
				argArr = [].slice.call(arguments,1);
				try{
					ret = playerobj[fnName].apply(playerobj,argArr);
					return ret;
				}catch(e){
					
				}
			}
		}
	
	})(tvp, tvp.$);
	/**
	 * @fileOverview 提供QQLiveWeb播放器控件的Js支持——底层库
	 */
	
	tvp = tvp || {};
	/**
	 * 定义QQLive对象，封装腾讯视频播放器操作的辅助函数集合
	 *
	 * @type {Object}
	 * @namespace QQLive
	 */
	var QQLive = QQLive || {
		/**
		 * JS库版本号
		 *
		 * @type String
		 */
		ver: "$Rev: 27101 $",
		/**
		 * 当前的SSO地址
		 *
		 * @type String
		 */
		curSSO: "",
		/**
		 * 最后一次修改时间
		 *
		 * @type String
		 */
		lastmodify: "$Date: 2013-03-06 19:47:09 +0800 (周三, 2013-03-06) $"
	};
	
	var QQLiveSetup = QQLive;
	
	/**
	 * 打印js日志
	 *
	 * @param {String}
	 *          msg
	 */
	QQLive.log = tvp.log;
	QQLive.debug = function(msg) {
		var funName = "";
		if (msg.indexOf("[") < 0 && !! arguments && !! arguments.callee && !! arguments.callee.caller) {
			var caller = arguments.callee.caller;
			funName = QQLive.debug.getFunName(caller)
		}
		msg = funName ? ("[" + funName + "]:" + msg) : msg;
	
		if (tvp.log.isDebug === -1) {
			tvp.log.isDebug = tvp.$.getUrlParam("debug") == "true" ? 1 : 0;
		}
		if ( !! tvp.log.isDebug) {
			// 杯具啊！在chrome、firefox这些浏览器里，内核播放控件其实是内嵌的IE控件执行
			// 独立浏览器进程，日志无法打在控制台，只能透传给外壳抛出时间，然后外壳再显示日志
			// 详见qqliveobject.js 的 onMsgCall 方法，注册的DRVPG_EVT_DEBUGLOG事件
			if (typeof __TenVideo_OCX_CTRL_PAGE__ != "undefined") { // 这变量定义在哪里？在控制页面的HTML里定义的
				QQLive.driverPage.sendMsg(QQLive.DEFINE.MSG.DRVPG_EVT_DEBUGLOG, encodeURIComponent(msg));
			} else {
				tvp.log(msg);
			}
		}
	}
	
	QQLive.debug.getFunName = function(func) {
		if (typeof func == 'function' || typeof func == 'object') {
			var name = ('' + func).match(/function\s*([\w\$]*)\s*\(/);
		}
		return name && name[1];
	}
	
	/**
	 * 封装配置项
	 *
	 * @type {Object}
	 * @namespace QQLive.config
	 */
	QQLive.config = {
	
		/**
		 * 老控件支持的最小版本号
		 *
		 * @default 8.22.5275.0
		 * @type String
		 */
		OLD_MIN_VER: "8.22.5275.0",
		/**
		 * IE支持Web播放的最小版本号
		 *
		 * @type String
		 */
		IE_MIN_VER: "8.45.6526.0",
	
		/**
		 * Firefox支持Web播放的最小版本号
		 *
		 * @type String
		 */
		FF_MIN_VER: "8.45.6526.0",
	
		/**
		 * Chrome支持的Web播放器最小版本号
		 *
		 * @type String
		 */
		CHROME_MIN_VER: "8.45.6526.0",
	
		/**
		 * 支持蹲起客户端的最小版本号
		 *
		 * @type String
		 */
		STARTUP_MIN_VER: "8.14.4895.0",
	
		/**
		 * IE版本flash最小版本号
		 *
		 * @type String
		 */
		IE_FLASH_MIN_VER: "9.0.124.0",
		/**
		 * Firefox下flash最小版本号
		 *
		 * @type String
		 */
		FF_FLASH_MIN_VER: "10.0",
	
		/**
		 * Flash组件的CAB地址
		 *
		 * @type String
		 */
		FLASH_CAB: "http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,124,0",
	
		/**
		 * 播放器下载网页地址
		 *
		 * @type String
		 */
		MEDIAPLAYER_DOWNLOAD_URL: "http://dl_dir.qq.com/qqtv/QQLive8.46.6680.0.exe",
	
		/**
		 * QQLive下载组件id
		 *
		 * @type String
		 */
		PROGID_QQLIVE_INSTALLER: "QQLiveInstaller.InstallHelper.1",
	
		/**
		 * LiveAPI 组件ID
		 *
		 * @default QQLive.Application
		 * @type String
		 */
		PROGID_QQLIVE_LIVEAPI: "QQLive.Application",
	
		/**
		 * MMInstaller控件的classid
		 *
		 * @default 1DABF8D5-8430-4985-9B7F-A30E53D709B3
		 * @type String
		 */
		MMINSTALL_CLSID: "1DABF8D5-8430-4985-9B7F-A30E53D709B3",
	
		/**
		 * MMIntaller控件的最小版本号
		 *
		 * @default 8,14,4895,0
		 * @type String
		 */
		MMINSTALL_VER: "8,14,4895,0",
	
		/**
		 * 老播放器的CLASSID
		 *
		 * @default 11F2A418-94B2-4E16-9B0C-B00C0435F903
		 * @type String
		 */
		OLD_IE_CLSID: "11F2A418-94B2-4E16-9B0C-B00C0435F903",
	
		/**
		 *
		 * @type String
		 */
		OLD_FF_CLSID: "D9EBCF5D-3F8F-4B6A-89BA-70577BE73C62",
		/**
		 * 外层控件Classid
		 *
		 * @default f7e55bdf-9528-46ba-b550-777859627591
		 * @type String
		 */
		SEHLL_CLSID: "f7e55bdf-9528-46ba-b550-777859627591",
		/**
		 * 内层播放器ClassId
		 *
		 * @default 5EF7B131-C278-4034-BC88-2CE28B128681
		 * @type String
		 */
		OCX_CLSID: "5EF7B131-C278-4034-BC88-2CE28B128681",
	
		/**
		 * LiveAPI的ClassId
		 *
		 * @default 4A8FD414-1EBF-4EBD-A158-0D09B005A17F
		 * @type String
		 */
		LIVEAPI_CLSID: "4A8FD414-1EBF-4EBD-A158-0D09B005A17F",
	
		/**
		 * 内层控制页面地址
		 *
		 * @default http://imgcache.qq.com/liveportal_v1/toolpages/qqlive_ocx.html
		 * @type String
		 */
		OCX_URL: "http://imgcache.qq.com/tencentvideo_v1/js/tvp/ocx_ctrl_page.html?max_age=0",
	
		/**
		 * 控制栏flash文件地址
		 *
		 * @default http://imgcache.qq.com/liveportal_v1/swf/vodCtrl.swf
		 * @type String
		 */
		CTRLSWF_URL: "http://imgcache.qq.com/liveportal_v1/swf/player/vodCtrl.swf",
	
		/**
		 * 点播控制栏flash文件地址
		 *
		 * @type String
		 */
		CTRLSWF_VOD_URL: "http://imgcache.qq.com/liveportal_v1/swf/player/vodCtrl_drm.swf",
	
		/**
		 * 网站部使用的白色皮肤
		 *
		 * @default String http://imgcache.qq.com/liveportal_v1/swf/vodCtrl_w.swf
		 * @type String
		 */
		CTRLSWF_W_URL: "http://imgcache.qq.com/liveportal_v1/swf/player/vodCtrl_w.swf",
	
		/**
		 * 播放前的swf文件
		 *
		 * @default http://imgcache.qq.com/liveportal_v1/swf/player/qqlive_logo.swf
		 * @type String
		 */
		PREVIEW_URL: "http://imgcache.qq.com/liveportal_v1/swf/player/qqlive_logo.swf",
	
		/**
		 * 播放缓冲中
		 *
		 * @default http://imgcache.qq.com/liveportal_v1/swf/player/loadstart.swf
		 * @type String
		 */
		LOADING_URL: "http://imgcache.qq.com/liveportal_v1/swf/player/loadstart.swf",
	
		/**
		 * 广告播放器SWF地址
		 *
		 * @type String
		 */
		AD_SWF_URL: "http://imgcache.qq.com/liveportal_v1/swf/player/moneyplayer.swf",
	
		/**
		 * OCX控件被禁用时的帮助指引文档URL
		 *
		 * @type String
		 */
		OCX_DISABLED_MANUAL: "http://v.qq.com/help/film_1.html#15"
	};
	
	/**
	 * @namespace QQLive.Param
	 * @type {Object}
	 */
	QQLive.param = {
		/**
		 * 播放页面属性
		 *
		 * @type
		 */
		playpage: {
			mousewheel: "mousewheel",
			/**
			 * 是否兼容老接口
			 *
			 * @type String
			 */
			oldmode: "OldMode"
		},
		/**
		 * 外壳需要的属性
		 *
		 * @type {Object}
		 */
		shell: {
			ocxurl: "OcxUrl",
			hidescripterr: "HideScriptErr"
		},
		/**
		 * 内层播放器需要的属性
		 *
		 * @type {Object}
		 */
		ocx: {
			mute: "Mute",
			volume: "Volume",
			fullscreen: "FullScreen",
			appendpausebtn: "AppendPauseBtn",
			programpageurl: "ProgramPageUrl"
		},
		/**
		 * 控制页面需要的属性
		 *
		 * @type {Object}
		 */
		driver: {
			autoplay: "autoPlay",
			iscontinued: "isContinued",
			url: "url",
			type: "type",
			adv: "adv",
			oid: "oid"
		},
		driverurl: {
			ctrlbar: "ctrlbar",
			ctrlheight: "ctrlh",
			previewurl: "previewUrl",
			loadingurl: "loadingUrl",
			previewpic: "previewPic",
			hidectrl: "hideCtrl",
			debug: "debug"
		},
		/**
		 * 根据参数获取转换后的boolean值
		 *
		 * @param {}
		 *          v param参数
		 * @return {Boolean}
		 */
		getParamBool: function(v) {
			if (v === undefined) {
				return false;
			}
			if (typeof v == "string") {
				v = v.toLowerCase();
				return (v == "true" || v == "1");
			}
			return !!v;
		},
		/**
		 * 根据id获取网页的&lt;object&gt;或者&lt;embed&gt;对象
		 *
		 * @param {String}
		 *          id
		 * @return {ElementObject}
		 */
		getElementObjectById: function(id) {
			return !!window.ActiveXObject ? document.getElementById(id) : document.embeds[id];
		}
	
	};
	/**
	 * 封装版本号的操作逻辑
	 *
	 * @type {Object}
	 * @namespace QQLive.version
	 */
	QQLive.version = (function() {
		var _isHasQQLivePlayer = -1,
			_ishasOldVersion = -1,
			_ishasOcx = -1;
		_version = {};
	
		function changeVerToString(nVer) {
			if (QQLive.version.checkVerFormatValid(nVer)) {
				return nVer;
			}
			if (/\d+/i.test(nVer)) {
				var nMain = parseInt(nVer / 10000 / 100, 10);
				var nSub = parseInt(nVer / 10000, 10) - nMain * 100;
				var nReleaseNO = parseInt(nVer, 10) - (nMain * 100 * 10000 + nSub * 10000);
				strVer = nMain + "." + nSub + "." + nReleaseNO;
				return strVer;
			}
			return nVer;
		}
		return {
			/**
			 * 比较版本
			 *
			 * @param {String}
			 *          strVer1
			 * @param {String}
			 *          strVer2
			 * @return {Number} 比较结果 1，-1，0
			 */
			compare: function(strVer1, strVer2) {
				strVer1 = changeVerToString(strVer1);
				strVer2 = changeVerToString(strVer2);
	
				strVer1 = strVer1.replace(/,/g, '.');
				strVer2 = strVer2.replace(/,/g, '.');
				var vArray1 = strVer1.split('.');
				var vArray2 = strVer2.split('.');
				for (var i = 0; i < 4; i++) {
					var nVer1 = Number(vArray1[i]);
					var nVer2 = Number(vArray2[i]);
					if (nVer1 > nVer2) {
						return 1;
					} else if (nVer1 < nVer2) {
						return -1;
					}
				}
				return 0;
			},
			/**
			 * 获取用户当前安装的腾讯视频播放器版本
			 *
			 * @return {String}
			 */
			get: function() {
				return tvp.version.getOcx();
			},
			/**
			 * 检查用户当前版本号是否满足指定的版本号，大于等于时返回true，小于返回false
			 *
			 * @param {String}
			 *          minVer 最小版本号 格式为8.12.3333.0 可省略，如果省略，则默认根据浏览器类别取QQLive.config.IE_MIN_VER 或者 QQLive.config.FF_MIN_VER
			 * @return {Boolean}
			 */
			check: function(minVer) {
				minVer = minVer || QQLive.version.getSupportMinVersion();
				if (!QQLive.version.checkVerFormatValid(minVer)) {
					return false;
				}
				var strVer;
				var nVer = QQLive.version.get();
				if (/^\d+$/.test(nVer)) {
					strVer = changeVerToString(nVer);
				} else {
					strVer = nVer + "";
				}
				if (QQLive.version.compare(strVer, minVer) < 0) {
					return false;
				} else {
					return true;
				}
			},
			/**
			 * 判断版本号是否是0
			 */
			isZero: function(ver) {
				ver = ver || QQLive.version.get();
				if (/^\d+$/.test(ver)) {
					if (ver == 0)
						return true;
				}
				return QQLive.version.compare(ver, "0.0.0.0") == 0;
			},
			/**
			 * 检查版本格式是否符合要求
			 *
			 * @param {String}
			 *          version 版本号
			 */
			checkVerFormatValid: function(version) {
				return (/^(\d+\.){2}\d+(\.\d+)?$/.test(version));
			},
			/**
			 * 是否安装了Ocx控件
			 */
			hasQQLiveOcx: function() {
				if (_ishasOcx != -1)
					return _ishasOcx == 1;
				var v = QQLive.version.check();
				_ishasOcx = !! v ? 1 : 0;
				return _ishasOcx;
			},
			/**
			 * 是否安装了老版本的播放器
			 */
			hasOldVersion: function() {
				if (_ishasOldVersion != -1)
					return _ishasOldVersion == 1;
				var v = QQLive.version.get(QQLive.config.OLD_IE_CLSID, true);
				if (!v)
					return false;
				_ishasOldVersion = QQLive.version.compare(v, QQLive.config.OLD_MIN_VER) > 0 ? 1 : 0;
				return !!_ishasOldVersion;
			},
			/**
			 * 是否安装了腾讯视频播放器
			 */
			hasQQLivePlayer: function() {
				if (_isHasQQLivePlayer != -1)
					return _isHasQQLivePlayer == 1;
				var v = QQLive.version.get(QQLive.config.LIVEAPI_CLSID);
				if (!v)
					return false;
				_isHasQQLivePlayer = QQLive.version.compare(v, "0.0.0.0") > 0 ? 1 : 0;
				return !!_isHasQQLivePlayer;
			},
			/**
			 * 获取当前浏览器支持的控件最小版本号
			 */
			getSupportMinVersion: function() {
				if ( !! tvp.$.browser.ie) {
					return QQLive.config.IE_MIN_VER;
				}
				if ( !! tvp.$.browser.firefox) {
					return QQLive.config.FF_MIN_VER;
				}
				if ( !! tvp.$.browser.webkit) {
					return QQLive.config.CHROME_MIN_VER;
				}
				return "0.0.0.0";
			}
		}
	})();
	
	QQLive.userAgent = QQLive.browser;
	
	/**
	 * 封装对安装控件的操作
	 *
	 * @namespace QQLive.installer
	 * @type {Object}
	 */
	QQLive.installer = {
		/**
		 * 定时器
		 *
		 * @ignore
		 * @type
		 */
		timer: null,
		/**
		 * 下载控件对象
		 *
		 * @type
		 */
		installerObj: null,
		/**
		 * 得到MMInstaller输出到页面的HTML
		 */
		getInstallerHtml: function() {
			var str = "";
			str += "<div id=\"qqlive_mminstaller_div\"><OBJECT classid=\"clsid:" + QQLive.config.MMINSTALL_CLSID + "\" codebase=\"http:\/\/dl_dir.qq.com\/qqtv\/MMInstaller.cab#version=" + QQLive.config.MMINSTALL_VER + "\" ID=\"QQLiveInstaller\" width=\"0px\" height=\"0px\">";
			str += "	<embed name=\"FF_MM_Install\" id=\"FF_MM_Install\" type=\"application\/tecent-qqlive-plugin\" width=\"0px\" height=\"0px\"><\/embed>";
			str += "<\/OBJECT></div>";
			return str;
		},
		/**
		 * 输出MMInstaller的Object控件
		 *
		 * @param {String}
		 *          containerId 容器Id
		 */
		showInstallerObject: function(containerId) {
			tvp.$.getByID(containerId).innerHTML = QQLive.installer.getInstallerHtml();
		},
		/**
		 * 安装控件是否已经安装
		 *
		 * @return {Boolean}
		 */
		isMMInstalled: function() {
			if ( !! tvp.$.browser.ie) {
				try {
					var oDlder = new ActiveXObject(QQLive.config.PROGID_QQLIVE_INSTALLER);
					if (typeof oDlder.GetVersionByClsid != "undefined") {
						return true;
					}
					try {
						oDlder.Destroy();
						oDlder = null;
						delete oDlder;
					} catch (e) {}
					return false;
				} catch (e) {
					return false;
				}
			} else if (tvp.$.browser.isNotIESupport()) {
				var installobj = document.embeds["FF_MM_Install"];
				try {
					installobj.CreateAX("MMInstall.dll");
					if (typeof installobj.GetVersionByClsid != "undefined") {
						return true;
					}
					try {
						installobj.Destroy();
						installobj = null;
						delete installobj;
					} catch (e) {}
					return true;
				} catch (e) {
					return false;
				}
			}
			return false;
		},
		/**
		 * 检查firefox是否在html中加入embed
		 *
		 * @return {}
		 */
		checkFFHasMMEmbed: function() {
			return !!tvp.$.getByID("FF_MM_Install");
		},
	
		/**
		 * 获取创建的Object对象
		 *
		 * @param {String}
		 *          IEObjName IE下的Object名字
		 * @param {String}
		 *          FFObjName FF下通过CreateAX创建的名字
		 */
		getActiveXObj: function(IEObjName, FFObjName) {
			var obj = null;
			if ( !! FFObjName && (tvp.$.browser.isNotIESupport())) {
				obj = document.embeds["FF_MM_Install"];
				if (!obj) {
					var _d = document.createElement("div");
					_d.innerHTML = QQLive.installer.getInstallerHtml();
					document.getElementsByTagName("body")[0].appendChild(_d);
					obj = document.embeds["FF_MM_Install"];
				}
				try {
					obj.CreateAX(FFObjName);
				} catch (e) {}
			} else if ( !! IEObjName && !! tvp.$.browser.ie) {
				try {
					obj = new ActiveXObject(IEObjName);
				} catch (e) {}
			}
			return obj;
		},
		hide: function() {
			var inst = tvp.$.getByID("QQLiveInstaller");
			if ( !! inst)
				inst.style.display = "none";
		}
	};
	
	/**
	 * 封装对flash的操作
	 *
	 * @namespace QQLive.flash
	 * @type {Object}
	 */
	QQLive.flash = {
		/**
		 * 获取flash的完整版本号
		 *
		 * @return {}
		 */
		getFullVersion: function() {
			return tvp.version.getFlash();
		},
		/**
		 * 获取主版本号
		 *
		 * @return {}
		 */
		getMainVer: function() {
			return tvp.version.getFlashMain();
		},
		/**
		 * Flash判断是否符合QQLive的版本要求
		 *
		 * @return {}
		 */
		isFlashVerVaild: function() {
			var isFlashValid = false;
			if ( !! tvp.$.browser.ie) {
				isFlashValid = QQLive.version.compare(QQLive.flash.getFullVersion(), QQLive.config.IE_FLASH_MIN_VER) == -1 ? false : true;
			} else {
				isFlashValid = QQLive.version.compare(QQLive.flash.getFullVersion(), QQLive.config.FF_FLASH_MIN_VER) == -1 ? false : true;
			}
			return isFlashValid;
		}
	};
	
	/**
	 * 封装对播放器的操作
	 *
	 * @type {Object}
	 * @namespace QQLive.player
	 */
	QQLive.player = {
		/**
		 * 拉起客户端并保持蹲在状态栏<br>
		 * 只有在Flash版本符合<a href="QQLive.config.html">QQLive要求</a>并且客户端版本达到<a href="QQLive.config.html#.STARTUP_MIN_VER"">指定版本号</a>才会拉起
		 */
		startup: function() {
			if (tvp.$.browser.isCanOcx() == false)
				return;
			if (QQLive.flash.isFlashVerVaild() == false)
				return;
			if (QQLive.version.check(QQLive.config.STARTUP_MIN_VER) == false)
				return;
			window.location.href = "qqlive://system_startup/";
		},
		/**
		 * 拉起客户端
		 */
		openClient: function(p1, p2) {
			if (!p1)
				return;
			if (!QQLive.version.hasQQLivePlayer())
				return;
			var sso = "qqlive://sso/";
			if (!p2) { // vbarid or projectid or sso
				var val = p1;
				if (/^\d+$/i.test(val)) {
					sso += "projectid=" + val;
				} else {
					if (val.toLowerCase().indexOf("qqlive://sso/") >= 0) {
						sso = val;
					} else if (/^[a-z0-9]{15}$/i.test(val)) {
						sso += "vbarid=" + val;
					} else {
						return;
					}
				}
			}
			if ( !! p1 && !! p2) { // vbarid,videoid
				sso += "vbarid=" + p1 + "&videoid=" + p2;
			}
			var obj = QQLive.installer.getActiveXObj(QQLive.config.PROGID_QQLIVE_LIVEAPI, "");
			if ( !! obj) {
				try {
					obj.OpenQQLive(sso);
					return;
				} catch (e) {}
			}
			window.location.href = sso;
		}
	}
	
	/**
	 * 内层控制页面通用逻辑
	 *
	 * @ignore
	 * @namespace QQLive.driverPage
	 * @type {Object}
	 */
	QQLive.driverPage = {
		/**
		 * 内层控制页面向shell发送消息
		 *
		 * @param {Number}
		 *          id 消息id
		 * @param {String}
		 *          v 消息内容
		 */
		sendMsg: function(id, v) {
			v = v || "";
			window.navigate("app:OnMsg&nID=" + id + "&vContent=" + v);
		},
		/**
		 * 控制页面环境准备完毕,通知外层开始向其发送数据
		 */
		ready: function() {
			window.navigate("app:PageLoaded");
		}
	};
	
	/**
	 * 事件处理
	 *
	 * @namespace QQLive.event
	 * @ignore
	 * @type {Object}
	 */
	QQLive.event = {
		rptImg: null,
		/**
		 * 事件绑定
		 *
		 * @param {Object}
		 *          事件主体对象 obj
		 * @param {Function}
		 *          函数 fn
		 * @return {}
		 */
		bind: function(obj, fn) {
			var args = Array.prototype.slice.call(arguments, 2);
			return function() {
				var _obj = obj || this,
					_args = args.concat(Array.prototype.slice.call(arguments, 0));
				if (typeof(fn) == "string") {
					if (_obj[fn]) {
						return _obj[fn].apply(_obj, _args);
					}
				} else {
					return fn.apply(_obj, _args);
				}
			}
		},
		/**
		 * 关闭ctrl+鼠标滚轮操作
		 */
		closeMousewheel: function() {
			document.onmousewheel = function(e) {
				e = e || event;
				if (e.ctrlKey)
					return false;
			}
		},
	
		/**
		 * 上报tcss指定按钮统计
		 */
		reportTCSSHot: function(hottag, cookieFlag) {
	
			var isRpt = false;
			if (typeof cookieFlag == "undefined") {
				isRpt = true;
			} else {
				var c = tvp.$.cookie.get("lv_ocx_rpt");
				if ( !! c) {
					c = parseInt(c);
				} else {
					c = 0;
				}
				isRpt = !(c & cookieFlag);
			}
			if (isRpt) {
				if (typeof pgvSendClick == "function") {
					pgvSendClick({
						hottag: "OCX.SETUP." + hottag,
						virtualURL: "/virtual/ocx.html",
						virtualDomain: "v.qq.com"
					});
				} else {
					QQLive.event.rptImg = new Image();
					QQLive.event.rptImg.src = "http://pinghot.qq.com/pingd?dm=v.qq.com.hot&url=/virtual/ocx.html&tt=" + escape(document.title) + "&hottag=OCX.SETUP." + hottag + "&hotx=9999&hoty=9999&rand=" + Math.round(Math.random() * 100000);
				}
				tvp.$.cookie.set("lv_ocx_rpt", (c | cookieFlag), document.location.hostname || document.location.hostname);
			}
		}
	}
	/**
	 * @fileOverview QQLive轻量Web播放器 - 播放器变量枚举
	*/
	
	/**
	 * 播放器变量枚举
	 * 
	 * @namespace QQLive.DEFINE
	 * @type {Object}
	 */
	var QQLive = QQLive || {};
	
	QQLive.DEFINE = {
		/**
		 * 播放器状态
		 * 
		 * @memberOf QQLive.DEFINE
		 * @namespace QQLive.DEFINE.STATUS
		 * @type {Object}
		 */
		STATUS : {
			/**
			 * 未初始化
			 * 
			 * @type Number
			 */
			NOT_INITED : -1,
	
			/**
			 * 初始化完毕
			 * 
			 * @type Number
			 */
			INIT : 0,
	
			/**
			 * 视频准备就绪，可以播放
			 * 
			 * @type Number
			 */
			READY : 4,
			/**
			 * 正在播放
			 * 
			 * @type Number
			 */
			PLAYING : 7,
			/**
			 * 停止
			 * 
			 * @type Number
			 */
			STOP : 1,
	
			/**
			 * 读取节目状态
			 * 
			 * @type Number
			 */
			LOADING : 2,
	
			/**
			 * 暂停
			 * 
			 * @type Number
			 */
			PAUSE : 6,
	
			/**
			 * 缓冲状态
			 * 
			 * @type Number
			 */
			Buffering : 8,
	
			/**
			 * 暂停时的缓冲状态
			 * 
			 * @type Number
			 */
			Paused_Buffering : 9,
			/**
			 * 正常结束
			 * 
			 * @type Number
			 */
			END : 91
		},
		/**
		 * 播放器事件
		 * 
		 * @namespace QQLive.DEFINE.EVENT
		 * @type {Object}
		 */
		EVENT : {
			/**
			 * 开始
			 * 
			 * @type String
			 */
			LOADSTART : "loadstart",
	
			/**
			 * 正在读取视频文件
			 * 
			 * @type String
			 */
			LOADING : "loading",
			/**
			 * 播放
			 * 
			 * @type String
			 */
			PLAY : "playing",
			/**
			 * 停止
			 * 
			 * @type String
			 */
			STOP : "stop",
			/**
			 * 暂停
			 * 
			 * @type String
			 */
			PAUSE : "pause",
			/**
			 *
			 * 恢复播放
			 */
			RESUME : "resume",
			/**
			 * 播放下一个
			 * 
			 * @type String
			 */
			PLAYNEXT : "playnext",
			/**
			 * 播放前一个
			 * 
			 * @type String
			 */
			PLAYPREV : "playprev",
			/**
			 * 静音
			 * 
			 * @type String
			 */
			MUTE : "mute",
			/**
			 * 全屏
			 * 
			 * @type String
			 */
			FULLSCREEN : "fullscreen",
	
			/**
			 * 视频准备就绪，可以播放
			 * 
			 * @type String
			 */
			VIDEOREADY : "videoready",
			/**
			 * 
			 * @type String
			 */
			PROGESS : "progress",
	
			/**
			 * 节目正常结束
			 * 
			 * @type String
			 */
			END : "ended",
	
			/**
			 * 获取到视频清晰度个数
			 * 
			 * @type String
			 */
			GET_VIDEO_FORMAT_CNT : "getVideoFormatCnt",
	
			/**
			 * 获取当前视频当前是什么清晰度
			 * 
			 * @type String
			 */
			GET_VIDEO_CUR_FORAMT : "getVideoCurFormat",
	
			/**
			 * 视频清晰度发生切换
			 * 
			 * @type String
			 */
			VIDEO_FORMAT_SWITCHED : "videoFormatSwitched",
	
			/**
			 * 播放的视频发生变化
			 * 
			 * @type String
			 */
			VIDEOCHANGE : "videochange",
	
			/**
			 * 音量发生变化
			 * 
			 * @type String
			 */
			VOLUMECHANGE : "volumechange",
			/**
			 * 鼠标移动
			 * 
			 * @type String
			 */
			MOUSEMOVE : "mousemove",
	
			/**
			 * 鼠标双击
			 * 
			 * @type String
			 */
			DBCLICK : "dbclick",
	
			/**
			 * 播放视频类型发生变化(直播换点播，点播换直播)
			 * 
			 * @type String
			 */
			TYPECHANGE : "typechange",
	
			/**
			 * 获取到DRM试看的时长
			 * 
			 * @type String
			 */
			GET_DRM_PREVDURATION : "getDrmDuration",
	
			/**
			 * 获取到DRM试看的原因
			 * 
			 * @type String
			 */
			GET_DRM_PREV_REASON : "getDrmPrevReason",
	
			// ==============================
	
			/**
			 * 检查完MMInstaller
			 * 
			 * @type String
			 */
			CHECK_MMINSTALLER : "CheckMMInstall",
			/**
			 * 检查完Flash版本
			 * 
			 * @type String
			 */
			CHECK_FLASH : "CheckFlash",
			/**
			 * 检查完版本
			 * 
			 * @type String
			 */
			CHECK_VERSION : "CheckVersion",
			/**
			 * 显示完播放器
			 * 
			 * @type String
			 */
			SHOW_PLAYER : "ShowPlayer",
	
			/**
			 * 控制页面准备完毕
			 * 
			 * @type String
			 */
			DIRVER_PAGE_INITED : "DirverPageInited",
	
			/**
			 * 播放器一切准备完毕，进入播放或者就绪状态
			 * 
			 * @type String
			 */
			OCX_READY : "inited",
	
			/**
			 * 播放页指引flash加载完毕
			 * 
			 * @type String
			 */
			GUIDE_FLASH_INITED : "GuideFlashInited",
	
			/**
			 * 更新当前播放的SSO地址
			 * 
			 * @type String
			 */
			UPDATE_SSO : "UpdateSSO",
	
			/**
			 * 控制栏暂停按钮发生单击
			 * 
			 * @type String
			 */
			PAUSE_BTN_CLICK : "PauseBtnClick",
	
			/**
			 * 控制栏全屏按钮发生单击
			 * 
			 * @type String
			 */
			FULLSCREEN_BTN_CLICK : "FullScreenBtnClick",
			/**
			 * 可以播放上一个节目
			 * 
			 * @type String
			 */
			CAN_PREV : "CanPrev",
			/**
			 * 可以播放下一个节目
			 * 
			 * @type String
			 */
			CAN_NEXT : "CanNext",
	
			/**
			 * OCX初始化失败
			 * 
			 * @default OcxInitFailed
			 * @type String
			 */
			OCX_INIT_FAILED : "OcxInitFailed",
	
			/**
			 * 控制页面脚本发生错误
			 * 
			 * @type String
			 */
			SCRIPT_ERROR : "ScriptError",
			/**
			 * 其他的一些信号信息
			 * 
			 * @type String
			 */
			OTHER_MSG : "msg",
	
			/**
			 * 控件被禁用
			 * 
			 * @type String
			 */
			OCX_DISABLED : "ocxdisabeld",
	
			/**
			 * DRM控件错误
			 * 
			 * @type String
			 */
			DRM_ERROR : "drmerror"
		},
		/**
		 * 播放器透传的事件ID
		 * 
		 * @namespace QQLive.DEFINE.MSG
		 * @type {Object}
		 */
		MSG : {
			/**
			 * 放器处于播放状态了
			 * 
			 * @default 1
			 * @type Number
			 */
			OCX_EVT_ONMSG_PLAYING : 1,
	
			/**
			 * 播放器处于暂停状态了
			 * 
			 * @default 2
			 * @type Number
			 */
			OCX_EVT_ONMSG_PAUSED : 2,
	
			/**
			 * 播放器处于停止状态了
			 * 
			 * @default 3
			 * @type Number
			 */
			OCX_EVT_ONMSG_STOPED : 3,
	
			/**
			 * 可以播放前，数据缓冲到可以播放之前的进度
			 * 
			 * @default 4
			 * @type Number
			 */
			OCX_EVT_PREPLAY_LOADING : 4,
			/**
			 * 用户已经触发播放，进入播放程序
			 * 
			 * @default 7
			 * @type Number
			 */
			OCX_EVT_ONMSG_LOADSTART : 7,
	
			/**
			 * 用户在视频窗口上移动鼠标
			 * 
			 * @default 9
			 * @type Number
			 */
			OCX_EVT_ONMSG_MOUSEMOVE : 9,
	
			/**
			 * 鼠标左键按下
			 * 
			 * @default 12
			 * @type Number
			 */
			OCX_EVT_ONMSG_LBUTTONDOWN : 12,
	
			/**
			 * 视频播放区域发生双击鼠标事件
			 * 
			 * @default 14
			 * @type Number
			 */
			OCX_EVT_ONMSG_LBUTTONDBLCLK : 14,
	
			/**
			 * 视频Start播放（点播、直播均有）
			 * 
			 * @default 15
			 * @type Number
			 */
			OCX_EVT_ONMSG_START : 15,
	
			/**
			 * 声音up
			 * 
			 * @default 23
			 * @type Number
			 */
			OCX_EVT_ONMSG_VOLUME_UP : 23,
	
			/**
			 * 声音down
			 * 
			 * @default 24
			 * @type Number
			 */
			OCX_EVT_ONMSG_VOLUME_DOWN : 24,
	
			/**
			 * 设置静音或者非静音
			 * 
			 * @default 25
			 * @type Number
			 */
			OCX_EVT_ONMSG_MUTE : 25,
	
			/**
			 * 可以播放器下一个
			 * 
			 * @default 26
			 * @type Number
			 */
			OCX_EVT_ONMSG_CANPRE : 26,
	
			/**
			 * 可以播放上一个
			 * 
			 * @default 27
			 * @type Number
			 */
			OCX_EVT_ONMSG_CANNEXT : 27,
	
			/**
			 * 二次缓冲恢复播放状态
			 * 
			 * @default 30
			 * @type Number
			 */
			OCX_EVT_ONMSG_BUF_RESUME_PLAY : 30,
	
			/**
			 * 暂停恢复播放状态
			 * 
			 * @default 31
			 * @type Number
			 */
			OCX_EVT_ONMSG_PAUSE_RESUME_PLAY : 31,
	
			/**
			 * 点击视频播放/暂停
			 * 
			 * @default 32
			 * @type Number
			 */
			OCX_EVT_ONMSG_PLAY_PAUSE_CLICK : 32,
	
			/**
			 * 清晰度个数
			 * 
			 * @default 49
			 * @type Number
			 */
			OCX_EVT_ONMSG_VIDEO_FORMAT_COUNT : 49,
	
			/**
			 * 当前视频的清晰度索引
			 * 
			 * @default 50
			 * @type Number
			 */
			OCX_EVT_ONMSG_CUR_VIDEO_FORMAT_IDX : 50,
	
			/**
			 * 清晰度发生切换
			 * 
			 * @type Number
			 * @default 51
			 */
			OCX_EVT_ONMSG_VIDEO_FORMAT_SWITCHED : 51,
	
			/**
			 * 右键菜单
			 * 
			 * @default 100
			 * @type Number
			 */
			OCX_EVT_ONMSG_COMMAND : 100,
	
			// =============== 页面自定义错误码 Start 500-999 是跟客户端约定好页面可以自己加的消息 ===========
			/**
			 * 控制页面 flash加载完毕
			 * 
			 * @default 501
			 * @type Number
			 */
			DRVPG_EVT_FLASH_INITED : 501,
	
			/**
			 * 控制页面所有组件准备完毕，进入播放状态
			 * 
			 * @default 502
			 * @type Number
			 */
			DRVPG_EVT_ALL_INITED : 502,
	
			/**
			 * 播放器页面指引flash加载完毕
			 * 
			 * @default 503
			 * @type Number
			 */
			LIVE_PAGE_EVENT_GUIDEFLSAH_INITED : 503,
	
			/**
			 * 更新当前播放的SSO地址
			 * 
			 * @default 504
			 * @type Number
			 */
			DRVPG_EVT_UPDATESSO : 504,
	
			/**
			 * 通过控制栏的暂停按钮点击事件激活暂停
			 * 
			 * @default 505
			 * @type Number
			 */
			CTRLBAR_EVT_PAUSECLICK : 505,
	
			/**
			 * 通过控制栏全屏按钮点击事件激活全屏
			 * 
			 * @default 506
			 * @type Number
			 */
			CTRLBAR_EVT_FULLSCREENCLICK : 506,
	
			/**
			 * 全屏状态发生切换的事件
			 * 
			 * @default 507
			 * @type Number
			 */
			OCX_EVT_FULLSCREEN_SWITCH : 507,
	
			/**
			 * 播放器OCX初始化失败（以尝试调用OCX的StartTask方法为测试点）
			 * 
			 * @default 508
			 * @type Number
			 */
			DRVPG_EVT_OCX_INIT_FAILED : 508, // DRVPG 表示DriverPage意思，控制页面
	
			/**
			 * 播放器控制页面出现脚本错误
			 * 
			 * @default 509
			 * @type Number
			 */
			DRVPG_EVT_JS_ERROR : 509,
	
			/**
			 * 透传日志
			 * 
			 * @type Number
			 */
			DRVPG_EVT_DEBUGLOG : 510,
	
			/**
			 * 停止按钮被按下
			 * 
			 * @type Number
			 */
			CTRLBAR_EVT_STOPCLICK : 511,
	
			/**
			 * LiveOcx内核控件在IE中被禁用了
			 * 
			 * @type Number
			 */
			OCX_DISABLED : 512,
	
			/**
			 * LiveOcx控件预览DRM到头
			 * 
			 * @type Number
			 */
			OCX_DRM_PREV_END : 513,
	
			// ====================
			// 514错误去哪里了？哈哈，没有514错误，因为要暴露给用户看，514不吉利，放弃这个错误码
			// ====================
	
			/**
			 * LiveOcx控件获取DRM信息超时
			 * 
			 * @type Number
			 */
			OCX_DRM_GET_TIMEOUT : 515,
	
			/**
			 * 
			 * 初始化控件,用于上报
			 */
			NEW_OCX : 516,
			/**
			 * 页面应该使用控件，用于上报
			 * 
			 * @type Number
			 */
			USE_OCX : 517,
	
			/**
			 * 显示控件安装提示
			 * 
			 * @type Number
			 */
			SHOW_INSTALLER_TIPS : 518,
	
			/**
			 * 获取到当前播放器播放的时间点
			 * @type {Number}
			 */
			GET_VIDEO_CUR_TIME: 519,
			/**
			 * 页面未找到flash播放器，无法初始化控制栏
			 * @type {Number}
			 */
			NO_FLASH_PLAYER : 520,
			/**
			 * 通过控制栏的暂停按钮点击事件激活播放
			 * @type Number
			 */
			CTRLBAR_EVT_RESUMECLICK : 521,
			// =============================== 页面自定义错误码 End ============================
	
			/**
			 * 播放器控件报错，至于报什么错，就从该MSG的参数中获取
			 * 
			 * @type Number
			 */
			OCX_EVT_ERROR : 1002,
	
			/**
			 * 节目播放完自然结束了
			 * 
			 * @default 1003
			 * @type Number
			 */
			OCX_EVT_ONMSG_FLV_PROGRAM_END : 1003,
	
			/**
			 * 当获得播放总时间
			 * 
			 * @default 1005
			 * @type Number
			 */
			OCX_EVT_ONMSG_FLV_TOTAL_TIME : 1005,
	
			/**
			 * 需要获取QQ号码
			 * 
			 * @type Number
			 */
			OCX_EVT_GET_QQ : 1104,
	
			/**
			 * DRM试看原因
			 * 
			 * @type Number
			 */
			OCX_EVT_PREVIEW_REASON : 1102,
	
			/**
			 * DRM试看时长
			 * 
			 * @type Number
			 */
			OCX_EVT_PREVIEW_DURATION : 1103,
	
			/**
			 * DRM返回结果，有失败也有成功，根据事件参数content来判断
			 * 
			 * @type Number
			 */
			OCX_EVT_DRM_AUTHORIZE_RESULT : 1106,
	
			/**
			 * DRM流程开始
			 * 
			 * @type Number
			 */
			OCX_EVT_DRM_BEGIN : 1107
	
		},
		/**
		 * 右键菜单命令字
		 * 
		 * @namespace QQLive.DEFINE.COMMANDID
		 * @type {Object}
		 */
		COMMANDID : {
			/**
			 * 右键菜单播放&暂停
			 * 
			 * @type Number
			 */
			IDM_RBUTTON_PLAY_PAUSE : 11251,
			/**
			 * 右键菜单上一个
			 * 
			 * @type Number
			 */
			IDM_RBUTTON_PRE : 11253,
			/**
			 * 右键菜单下一个
			 * 
			 * @type Number
			 */
			IDM_RBUTTON_NEXT : 11254,
			/**
			 * 右键菜单全屏
			 * 
			 * @type Number
			 */
			HOT_KEY_FULLSCREEN : 11302
		},
		/**
		 * PROGRESS 事件ID
		 * 
		 * @namespace QQLive.DEFINE.PROGRESS_EVENT
		 * @type
		 */
		PROGRESS_EVENT : {
			/**
			 * 点播的全程下载缓冲进度
			 * 
			 * @type Number
			 */
			FLV_LOADING : 2,
			/**
			 * 点播的当前播放时间和总播放时间
			 * 
			 * @type Number
			 */
			FLV_HEAD_TOTAL_TIME : 3
		},
		KEYCODE : {
			HOTKEYF_SHIFT : 0x01,
			HOTKEYF_CONTROL : 0x02,
			HOTKEYF_ALT : 0x04,
			HOTKEYF_EXT : 0x08,
	
			VK_RETURN : 0x0D,
			VK_ESCAPE : 0x1B,
			VK_SPACE : 0x20,
			VK_LEFT : 0x25,
			VK_UP : 0x26,
			VK_RIGHT : 0x27,
			VK_DOWN : 0x28
		},
		/**
		 * 视频源类别
		 * 
		 * @type {Object}
		 */
		VIDEOTYPE : {
			/**
			 * 未知类别
			 * 
			 * @type Number
			 */
			UNKNOWN : 0,
			/**
			 * 直播
			 * 
			 * @default 1
			 * @type Number
			 */
			LIVE : 1,
			/**
			 * 点播
			 * 
			 * @type Number
			 */
			VOD : 8
		},
		AD_EVENT : {
			ERROR : "Error",
			DATALOADED : "DataLoaded",
			DOWNLOADED : "Downloaded",
			PLAYEND : "PlayEnd"
		}
	}
	
	/**
	 * @fileOverview 腾讯视频云播放器 封装直播的辅助函数
	 */
	
	/*
	 * @include "./tvp.define.js"
	 * @include "./tvp.common.js"
	 */
	
	;
	(function(tvp, $) {
	
		/**
		 * 封装直播的辅助函数
		 *
		 * @namespace tvp.livehub
		 * @type
		 */
		tvp.livehub = {
			/**
			 * 是否开启flash p2p
			 * @ignore
			 * @type Boolean
			 */
			g_flashp2p: false,
			/**
			 * iretcode
			 * @type
			 */
			iretcode: 0,
			/**
			 * 当前直播频道信息
			 *
			 * @type
			 */
			g_curCnlInfo: {},
	
			//直播步骤上报
			stepReport: function(step, params) {
				var op = {
					cmd: 3545,
					//步骤编号
					val: step
				};
				if ($.type(params) == 'object') {
					op = $.extend(op,{
						speed: params.delay,
						//cgi返回码
						int5: params.code,
						vid: params.lid
					});
	
					if (params.config) {
						op = $.extend(op, {
							contentId: params.config.contentId,
							appId: params.config.appid
						});
					}
				}
				tvp.report(op);
			},
	
			/**
			 * 异步请求CGI判断当前是否应该使用Flash来播放直播
			 *
			 * @class tvp.livehub.FlashChecker
			 */
			FlashChecker: function(cfg) {
				var $me = this;
				this.cnlId = "";
				this.extParam = {};
				this.onError = $.noop;
				this.onCanFlash = $.noop;
				this.onCanHTML5 = $.noop;
				this.onCanOCX = $.noop;
				this.onComplete = $.noop;
				this.onGetCnlId = $.noop;
	
				var $report = function(step,params){
					params = params || {};
					params.config = cfg;
					tvp.livehub.stepReport(step,params);
				}
				/**
				 * 当ajax请求成功
				 */
				this.onSuccess = function(json) {
					// 请求成功
					if (json && json.iretcode == 0) {
						tvp.livehub.iretcode = json.iretcode;
						tvp.livehub.g_flashp2p = json.flashp2p ? true : false;
						tvp.debug("get channel info:flashid=" + json.flashid + ",p2pid=" + json.p2pid + ",flashp2p=" + json.flashp2p);
						//根据返回结果覆盖直播id
						$me.cnlId = ("" + json.flashid || json.p2pid) || "";
						//重设
						$me.onGetCnlId("" + $me.cnlId, false);
						tvp.livehub.getCurChannelInfo($me.cnlId, $me.extParam);
						if (json.flashid) {
							//选择用flash播放
							$report(5);
							// 可以使用flash播放的回调
							$me.onCanFlash($me.cnlId);
						} else if ( !! $.os.windows && json.p2pid) {
							//选择用ocx播放
							$report(6);
							$me.onCanOCX($me.cnlId);
						} else {
							//啥都没法播
							$report(7, {
								code: json.iretcode
							});
							$me.onError(json.iretcode);
						}
					} else {
						//服务器返回失败结果
						$report(8, {
							code: json.iretcode
						});
						$me.onError(500);
					}
				}
	
				/**
				 * 发起请求
				 */
				this.send = function() {
					//直播send开始
					$report(1);
					//如果判断可以用h5播放(然后判断是否可播放hls,不能就提示)就不发送请求来判断是用flash还是p2p了
					if (tvp.common.isUseHtml5()) {
						//直接走hls播放
						$report(2);
						$me.onCanHTML5($me.cnlId);
						$me.onComplete();
						return;
					}
					var now = $.now();
					$.ajax({
						url: "http://info.zb.qq.com",
						data: {
							cmd: 1,
							cnlid: $me.cnlId || ""
						},
						dataType:'jsonp'
					}).done(function(json, delay) {
						delay = $.now() - now;
						//发送请求成功
						$report(3, {
							delay: delay
						});
						$me.onSuccess(json);
						$me.onComplete();
					}).fail(function(error,delay){
						delay = $.now() - now;
						//发送请求失败
						$report(4, {
							delay: delay
						});
						$me.onError();
						$me.onComplete();
					});
				}
			},
	
			/**
			 * 异步获取当前直播频道信息
			 *
			 * @param {}
			 *          cnlId
			 */
			getCurChannelInfo: function(cnlId, extParam) {
				var curInfo = tvp.livehub.g_curCnlInfo;
				if (extParam && $.type(extParam) == 'object') {
					//var curtime =  extParam.currenttime.substr(11,16);
					curInfo.cnlId = extParam.cnlId;
					extParam.channelname && (curInfo.cnlName = extParam.channelname);
					extParam.currentname && extParam.currenttime && (curInfo.prmInfo = extParam.currenttime + "|" + extParam.currentname);
				} else {
					curInfo = {};
				}
				// $.ajax({
				// 	type: "get",
				// 	url: "http://sns.video.qq.com/fcgi-bin/dlib/dataout_pc?otype=json&auto_id=191",
				// 	data: {
				// 		cid: cnlId
				// 	},
				// 	dataType: "jsonp",
				// 	success: function(json) {
				// 		if ( !! json && !$.isUndefined(json["channel"])) {
				// 			var channel = json["channel"];
				// 			tvp.livehub.g_curCnlInfo.cnlId = cnlId;
				// 			tvp.livehub.g_curCnlInfo.cnlName = channel["cname"];
				// 			tvp.livehub.g_curCnlInfo.prmInfo = channel["cur_ptime"] + "|" + channel["cur_pname"]
				// 		} else {
				// 			tvp.livehub.g_curCnlInfo = {};
				// 		}
				// 	}
				// });
			}
	
		}
	
	})(tvp, tvp.$);
	/**
	 * @fileOverview 腾讯视频云播放器 播放器接口
	 *
	 */
	
	/**
	 *      一句话概括统一播放器2.0：
	 *
	 *   高端大气上档次，低调奢华有内涵
	 *   奔放洋气有深度，简约时尚国际范
	 *
	 */
	
	;
	(function(tvp, $) {
		var lastTime = $.now();
		/**
		 * 上报播放器加载时的几个关键步骤，用于成功率统计
		 * @param  {number} step      步骤id
		 * @param  {string} sessionId 回话id
		 * @param  {object} extdata   扩展数据
		 */
		function reportInitStep(step, sessionId, extdata) {
			var curTime = $.now(),
				speed = curTime - lastTime,
				d = {
					cmd : 3529,
					val : step,
					str4 : sessionId,
					speed : speed < 0 ? ($.now() - curTime) : speed
				};
			lastTime = curTime;
			if ($.type(extdata) == "object") {
				$.extend(d, extdata);
			}
			tvp.report(d);
		}
	
		/**
		 * 加载内核,防止重复加载
		 * @return {[type]} [description]
		 */
		function loadModule(playerClass, getFileReport) {
			var deferName = playerClass + 'Defer';
			if (tvp[deferName]) {
				return tvp[deferName];
			}
			var defer = $.Deferred();
			tvp[deferName] = defer;
			var jsurl = FILEPATH;
			var jsfile = playerClass.toLowerCase();
			if (playerClass == "OcxPlayer" && typeof QQLive != "undefined" && typeof QQLive.DEFINE != "undefined") {
				jsfile = "ocxplayerlite";
			}
			var url = jsurl + "module/" + jsfile + ".js?max_age=86400&v=20140827";
	
			if (typeof tvp[playerClass] === "function") {
				defer.resolve();
			}
			else {
				var retcode = new tvp.RetCode(100123),
					startTime = $.now();
				retcode.begin();
				getFileReport(1);
				$.getScript(url, function() {
					        var speed = $.now() - startTime;
					        if (typeof tvp[playerClass] !== "function") { // 加载失败
						        retcode.reportErr(11);
						        getFileReport(2, 11, speed);
						        throw new Error(errMsg[1]);
					        }
					        getFileReport(2, 0, speed);
					        retcode.reportSuc();
					        defer.resolve();
				        });
			}
	
			return defer;
		}
	
		/**
		 * 检测是否需要加载默认的样式文件
		 * @return {[type]} [description]
		 */
		function checkIsNeedLoadCss(playerClass) {
			return $.type(playerClass) == 'string' && /html5|mp4/i.test(playerClass);
		}
		
		//如果有设置debug参数则加载调试文件
		if($.getUrlParam('__tvpdebug__',window != top ? top.location.href : '') == 'true'){
			$.getScript('http://weinre.qq.com/target/target-script.js#__tvpdebug__');
		}
	
		/**
		 * 创建播放器
		 * @param  {[type]} config [description]
		 * @param {tvp.Player} player 统一播放器对象
		 * @return {[type]}        [description]
		 */
		var create = function(config, player) {
			var defer = $.Deferred(),
				cfg = {},
				liveDefer = {},
				// 注意 ，这里是个对象，因为每个频道都要重新判断当前平台的播放情况
				playerClass = "FlashPlayer",
				errMsg = ["未指明播放器内核", "您当前使用的统一播放器JS文件不包含指定的播放器内核", "video未初始化"],
				playerArray = ["FlashPlayer", "FlashLivePlayer", "MP4Link", "OcxPlayer"],
				playerArrayUI = ["Html5Player", "Html5Live"],
				isUseVodHtml5 = false,
				// 是否使用h5点播播放器
				playerArrayTiny = ["Html5Tiny", "Html5LiveTiny"];
	
			playerArray = playerArray.concat(playerArrayUI);
			playerArray = playerArray.concat(playerArrayTiny);
	
			$.extend(cfg, config);
	
			// 兼容之前一个bug
			if (!$.isUndefined(config.isHTML5UseUI)) {
				cfg.isHtml5UseUI = config.isHTML5UseUI;
			}
	
			if (!config.video instanceof tvp.VideoInfo) {
				throw new Error(errMsg[2]);
				return;
			}
			config.video.setCurPlayer(player);
	
			function checkVodPlayer() {
				var vodDefer = $.Deferred();
				switch (cfg.playerType) {
					case "flash" : {
						playerClass = "FlashPlayer";
						break;
					}
					case "html5" : {
						useWhichVodHtml5();
						break;
					}
					case "ocx" : {
						playerClass = "OcxPlayer";
						break;
					}
					case "mp4" : {
						playerClass = "MP4Link";
						break;
					}
					default : {
						useDefaultVodPlayer();
						break;
					}
				}
				vodDefer.resolve();
				return vodDefer;
			}
	
			function useDefaultVodPlayer() {
				if (tvp.common.isEnforceMP4()) { // 有些浏览器强制走MP4
					playerClass = "MP4Link";
					return;
				}
	
				if (tvp.common.isUseHtml5()) { // 能用HTML5的就用HTML5
					useWhichVodHtml5();
				}
				// Android4.0+的系统还不支持HTML5，搞毛啊，直接走MP4Link方式吧
				// android 不支持的话直接走mp4了,change by jarvanxing,2014-05-09
				else if ($.os.android) {
					playerClass = "MP4Link";
				}
				else {
					playerClass = "FlashPlayer";
				}
			}
	
			function checkLivePlayer(video) {
				if (!!video.getChannelId()) {
					var cnlid = video.getChannelId();
	
					if ($.type(liveDefer[cnlid]) == "object" && $.isFunction(liveDefer[cnlid].done)) {
						return liveDefer[cnlid];
					}
	
					liveDefer[cnlid] = $.Deferred();
	
					var checker = new tvp.livehub.FlashChecker(cfg),
						isSuc = !!1;
					checker.cnlId = video.getChannelId();
					checker.extParam = video.getChannelExtParam();
	
					// 拿到了真实的频道id
					checker.onGetCnlId = function(cnlid, isLookBack) {
						video.setChannelId(cnlid);
						video.setIsLookBack(!!isLookBack);
					}
					// 可以使用flash播放
					checker.onCanFlash = function(cnlid) {
						playerClass = "FlashLivePlayer";
					}
					// 用HTML5播放
					checker.onCanHTML5 = function() {
						useWhichLiveHtml5();
					}
					// 只能用控件
					checker.onCanOCX = function() {
						playerClass = "OcxPlayer";
					}
					// 获取ajax错误
					checker.onError = function(errcode) {
						useDefaultLivePlayer();
						isSuc = false;
					}
	
					checker.onComplete = function() {
						useConfigLivePlayer();
						if (isSuc)
							liveDefer[cnlid].resolve();
						else
							liveDefer[cnlid].reject();
					}
					// 发送请求
					checker.send();
					return liveDefer[cnlid]
				}
			}
	
			create.checkLivePlayer = checkLivePlayer;
	
			function useDefaultLivePlayer() {
				if (tvp.common.isLiveUseHTML5()) {
					useWhichLiveHtml5();
				}
				else if (!!$.os.android) {
					playerClass = "FlashLivePlayer";
				}
				else {
					playerClass = "OcxPlayer";
				}
			}
	
			function useConfigLivePlayer() {
				switch (cfg.playerType) {
					case "flash" : {
						playerClass = "FlashLive";
						break;
					}
					case "html5" : {
						useWhichLiveHtml5();
						break;
					}
					case "flashLive" : {
						playerClass = "FlashLivePlayer";
						break;
					}
					case "ocx" : {
						playerClass = "OcxPlayer";
						break;
					}
				}
			}
	
			function useWhichVodHtml5() {
				isUseVodHtml5 = true;
				if (cfg.isHtml5UseUI) {
					playerClass = "Html5Player";
				}
				else {
					playerClass = "Html5Tiny";
				}
			}
	
			function useWhichLiveHtml5() {
				if (cfg.isHtml5UseUI) {
					playerClass = "Html5Live";
				}
				else {
					playerClass = "Html5LiveTiny";
				}
			}
	
			/**
			 * 检测css文件是否已加载
			 * @private
			 * @param {String} 样式文件地址
			 */
			function checkCssIsLoaded(url) {
				var loaded = false,
					els = document.getElementsByTagName('link') || [],
					idx = 0,
					len = els.length;
				while (idx < len) {
					loaded = els[idx] && els[idx].href && (els[idx].href.indexOf(url) == 0 || els[idx].href.indexOf('player_inews.css') != -1);
					if (loaded) {
						break;
					}
					idx++;
				}
				return loaded;
			}
	
			function _invoke() {
				var timer = null,
					isinvoke = false;
	
				function __invoke() {
					if (!!isinvoke)
						return;
					isinvoke = true;
	
					var t = new tvp[playerClass]();
					t.init(config);
					defer.resolve(t, playerClass);
				}
				var classIdx = $.inArray(playerClass, playerArrayUI),
					cssUrl = cfg.cssPath + (config.HTML5CSSName || 'player.css');
				if (((classIdx > -1 && $.isString(config.HTML5CSSName) && config.HTML5CSSName.length > 0) || checkIsNeedLoadCss(playerClass)) && !checkCssIsLoaded(cssUrl)) {
					timer = setTimeout(function() {
						        config.isHtml5UseUI = false;
						        playerClass = playerArrayTiny[classIdx];
						        __invoke();
					        }, 5e3);
					$.loadCss(cssUrl).done(function() {
						        clearTimeout(timer);
						        timer = null;
						        __invoke();
					        });
				}
				else {
					__invoke();
				}
			}
	
			$.when(config.type == tvp.PLAYER_DEFINE.VOD ? checkVodPlayer() : checkLivePlayer(config.video)).then(function() {
				        var url = "",
					        getFileReport = function(step, status, speed) {
						        tvp.report({
							                cmd : 3531,
							                val : step,
							                val2 : status || 0,
							                str3 : url,
							                speed : speed || 0,
							                contentId : config.contentId || "",
							                appId : config.appid || 0
						                });
					        }
				        if (!playerClass) {
					        throw new Error(errMsg[0]);
					        return;
				        }
	
				        if ($.inArray(playerClass, playerArray) < 0) {
					        throw new Error(errMsg[1]);
					        return;
				        }
				        if (config.type == tvp.PLAYER_DEFINE.VOD && isUseVodHtml5) {
					        player.trigger(tvp.ACTION.onVodH5Init);
				        }
				        if (typeof tvp[playerClass] !== "function") {
					        loadModule(playerClass, getFileReport).done(function() {
						                _invoke.call(player);
					                });
				        }
				        else {
					        _invoke.call(player);
				        }
			        });
	
			return defer;
		};
	
		/**
		 * 老addparam接口的参数映射
		 * @type {Object}
		 */
		var oldParamMap = {
			"player" : "playerType",
			"showcfg" : ["isVodFlashShowCfg", "isLiveFlashShowCfg"],
			"searchbar" : ["isVodFlashShowSearchBar"],
			"showend" : ["isVodFlashShowEnd"],
			"tpid" : ["typeId"],
			"cid" : ["coverId"],
			"flashshownext" : ["isVodFlashShowNextBtn"],
			"loadingswf" : "loadingswf",
			"wmode" : "flashWmode",
			"flashskin" : ["vodFlashSkin"],
			"extvars" : ["vodFlashExtVars"],
			"swftype" : ["vodFlashType"],
			"swfurl" : ["vodFlashUrl", "liveFlashUrl"]
		};
	
		/**
		 * 腾讯视频统一播放器对象
		 *
		 * @class tvp.Player
		 * @param {number} vWidth 播放器宽度 单位像k素
		 * @param {number} vHeight 播放器高度 单位像素
		 *
		 */
		tvp.Player = function(vWidth, vHeight) {
			this.sessionId = $.createGUID();
			reportInitStep(1, this.sessionId);
			this.instance = null, this.config = {}, this._oldcfg = {};
			$.extend(this.config, tvp.defaultConfig);
			this.setting("width", vWidth);
			this.setting("height", vHeight);
		};
		tvp.Player.fn = tvp.Player.prototype = new tvp.BasePlayer();
	
		$.extend(tvp.Player.fn, {
			/**
			 * 独立设置配置信息
			 * @param  {[type]} k [description]
			 * @param  {[type]} v [description]
			 * @return {[type]}   [description]
			 */
			setting : function(k, v) {
				this.config[k] = v;
			},
	
			/**
			 * 输出播放器
			 * @param  {[type]} id [description]
			 * @return {[type]}    [description]
			 */
			output : function(id) {
				this.setting("modId", id);
				this.create(this.config);
			},
	
			/**
			 * 创建播放器
			 * @param  {Object} config 配置文件
			 */
			create : function(config) {
				var t = this;
				$.extend(t.config, config);
	
				reportInitStep(2, this.sessionId, {
					        contentId : t.config.contentId || "",
					        appId : t.config.appid || 0
				        });
	
				create(t.config, t).done(function(f, playerClass) { // 这个done用来放一些播放器创建的逻辑
					        try {
						        reportInitStep(3, t.sessionId, {
							                vid : f.curVideo.getFullVid() || f.curVideo.getChannelId(),
							                str3 : f.getPlayerType(),
							                contentId : t.config.contentId || "",
							                appId : t.config.appid || 0
						                });
					        }
					        catch (err) {
					        };
					        // instance指向真实的new出来的播放器内核对象
					        t.instance = f;
					        // instance的instance又是外部的new出来的tvp.Player对象，也就是说你可以不断的.instance反复得到内核和外壳
					        t.instance.instance = t;
					        for (var p in t.instance) {
						        if (p == "instance")
							        continue; // instance是很重要的对象，不能透传
						        if (p.substr(0, 2) == "on" && $.isFunction(t[p]) && t[p] != tvp.$.noop)
							        continue;
						        t[p] = t.instance[p];
					        }
					        // init完毕会自动调用write，所以这里针对各种播放器统一执行onwrite事件
					        // 如果提到各个播放器的write函数里分别执行onwrite，可能会导致因为没有执行到上面几行代码
					        // 引起最外层new出来的player对象没有内部播放器的接口
					        f.callCBEvent("onwrite");
	
					        // 直播的话每次切换视频的都需要从服务端获取id映射以及设备支持情况
					        if (t.config.type == tvp.PLAYER_DEFINE.LIVE) {
						        t.play = function(v) {
							        if ($.isString(v)) {
								        t.config.video.setChannelId(v);
								        v = t.config.video;
							        }
							        else if (v instanceof tvp.VideoInfo) {
								        $.when(create.checkLivePlayer(v)).then(function() {
									                if (t.instance instanceof tvp[playerClass]) {
										                t.instance.play(v);
									                }
									                else {
										                config.video = v;
										                create(config);
									                }
								                });
							        }
						        }
					        }
					        tvp.Player.instance[t.playerid] = t;
				        }).always(function() { // 这里专门放置一些执行插件运行的,使用always，不管是否正常显示播放器都执行插件
					        function invoke(k, cfg) {
						        try {
							        var evtName = "build" + k;
							        if ($.isFunction(t[evtName])) {
								        t[evtName].call(t, cfg);
								        return true;
							        }
							        else {
								        return false;
							        }
						        }
						        catch (err) {
						        }
					        }
	
					        // $.each(["LoadAnalyse"], function(i, v) {
					        // invoke(v);
					        // });
	
					        $.each(t.config.plugins, function(k, v) {
						                if (!!v && k in t.config.pluginUrl) {
							                var _cfg = $.isPlainObject(v) ? v : {};
							                if (!invoke(k, _cfg)) {
								                var url = t.config.libpath + t.config.pluginUrl[k];
								                if ($.isString(url) && $.trim(url) != "") {
									                $.getScript(url, function() {
										                        invoke(k, _cfg);
									                        })
								                }
							                }
						                }
					                });
	
					        // 当前页面使用了jQuery，并引用了包含zepto库的播放器，就发个警告提示可以用更轻量的版本
					        if (window.console && typeof $.isFunction(console.warn) && _isUseInnerZepto) {
						        var libArr = {
							        "jQuery" : "jq",
							        "Zepto" : "zepto",
							        "jq" : "jqmobi"
						        };
						        for (var p in libArr) {
							        if (typeof window[p] === "function") {
								        if (p === 'jQuery' && typeof jQuery.Deferred != "function")
									        break;
								        console.warn("\n" + tvp.name + "提示：\n您当前页面使用了" + p + "\n建议您引用" + tvp.name + " for " + p + "专用版，更轻更快更精简\nJS地址:" + FILEPATH + "tvp.player_v2_" + libArr[p] + ".js\n\n");
							        }
						        }
					        }
	
				        });
			},
	
			// ==============================兼容老接口 start============================
			/**
			 * 设置参数
			 * @deprecated
			 * @param {string} k key
			 * @param {string} v value
			 */
			addParam : function(k, v) {
				tvp.report({
					        cmd : 3546,
					        val : 1
				        });
				if (k == "config" && $.type(v) == "object") {
					$.extend(this.config, v);
				}
				else {
					this._oldcfg[k] = v;
				}
			},
			/**
			 * 设置当前视频播放对象
			 * @deprecated
			 * @param  {tvp.VideoInfo} v tvp.VideoInfo的对象实例
			 */
			setCurVideo : function(v) {
				tvp.report({
					        cmd : 3546,
					        val : 2
				        });
				this.config["video"] = v;
				if (v && v instanceof tvp.VideoInfo) {
					v.setCurPlayer(this);
				}
			},
	
			/**
			 * 输出播放器
			 * @deprecated
			 * @param  {String} id Dom元素ID
			 */
			write : function(id) {
				tvp.report({
					        cmd : 3546,
					        val : 3
				        });
				this.config.modId = id;
	
				var type = this._oldcfg["type"] == 1 ? 1 : 2,
					t = this;
	
				$.each(this._oldcfg, function(k, v) {
					        if (k in oldParamMap) {
						        if ($.isArray(oldParamMap[k])) {
							        if (type == 2) { // 点播
								        t.config[oldParamMap[k][0]] = v;
							        }
							        else if (type == 1 && oldParamMap[k].length >= 2) {
								        t.config[oldParamMap[k][1]] = v;
							        }
						        }
						        else if ($.isString(oldParamMap[k])) {
							        t.config[oldParamMap[k]] = v;
						        }
					        }
					        else if (k in tvp.defaultConfig) {
						        t.config[k] = v;
					        }
				        });
				delete this._oldcfg;
				this.create(this.config);
			}
	
			    // ==============================兼容老接口
			    // end============================
	
		    });
	
		// extend create to tvp namespace
		tvp.create = create;
	
	})(tvp, tvp.$);
	
	tvp.Player.instance = {};
;

/**
 * 当前JS文件名
 * @type {String}
 */
tvp.filename = "tvp.player_v2.js"; //呵呵，这个为啥是通配符？在grunt里wrap的时候修改的，因为打包的多个JS版本每个JS的值都不一样，用于统计每个JS版本的引用次数


//seajs & requirejs 
if (typeof define === 'function') {
	define("tvp", [], function() {
		return tvp;
	});
};



global.tvp = tvp;
if (typeof QQLive != "undefined") {
	global.QQLive = QQLive;
}

})(this);