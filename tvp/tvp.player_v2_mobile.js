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
	 * @fileoverview 腾讯视频统一播放器H5内核 语言包
	 */
	
	;
	(function(tvp, $) {
		/**
		 * 腾讯视频统一播放器H5内核语言包
		 * @type {Object}
		 */
		tvp.html5lang = {
			/**
			 * 错误码定义
			 * @type {Object}
			 * wiki:http://tapd.oa.com/tvideo/prong/stories/view/1010031991056002352 --pantherruan
			 */
			errMsg : {
				"default" : "抱歉,暂不支持播放",
				"0" : "当前视频文件无法播放", // 触发video.onerror事件
				"68" : 'CGI系统错误,请刷新页面重试', // cgi返回数据不合法
				// 以下都是ajax读取CGI从服务器返回的错误
				"-1" : 'cgi参数错误/cgi向服务器发包错误,请刷新页面重试',
				"-2" : 'cgi从服务器接包错误,请刷新页面重试',
				"-3" : 'cgi从服务器解包错误,请刷新页面重试',
				"-4" : 'cgi连接服务器网络错误,请刷新页面重试',
				"-6" : 'cgi连接服务超时,请刷新页面重试',
				"-7" : 'cgi访问服务未知错误,请刷新页面重试',
				"50" : 'CGI系统错误,请刷新页面重试',
				"52" : '访问视频付费信息失败，请刷新页面重试',
				"64" : '校验视频付费信息失败，请刷新页面重试',
	
				"51" : 'vid个数超出范围',
				"61" : 'vid不合法',
				"62" : '视频状态不合法',
				"63" : '清晰度格式不合法',
				"65" : '速度格式不合法',
				"67" : '视频格式不存在',
				"69" : 'format列表为空',
				"71" : '未找到HLS CDN',
				"73" : '生成文件名失败',
				"74" : '分片号不合法',
				"76" : '获取m3u8文件名失败',
				"77" : '生成HLS key失败',
				"80" : {
					"0" : '因版权限制,请到腾讯视频观看',
					"1" : "根据您当前的IP地址，该地区暂不提供播放",
					"2" : '因版权限制，暂不支持播放',
					callback : function($content, errcode, data) {
						if (parseInt(errcode) == 0 && tvp.app && data && data.vid) {
							var tpl = tvp.html5skin.errorDownloader;
							tvp.app.check(data).done(function(rs) {
								        if (rs.url) {
									        var $box = $content.find('.tvp_player_error_content');
									        var content = $content.find('.text').html();
									        content = content.substr(0, content.indexOf('('));
									        if (tpl) {
										        content = tpl.replace('${errorMsg}', content);
										        content = content.replace('${url}', rs.url);
									        }
									        else {
										        content = '<a href="' + rs.url + '">' + content + '</a>';
									        }
									        $box.length && $box.html(content);
								        }
							        });
						}
					}
				},
				"81" : 'referer限制',
				"82" : 'qzone权限限制',
				// 根据cgi返回结果判断
				"83" : {
					"main" : "视频付费限制",
					"-2" : "您可能未登录或登录超时",
					"-1" : "视频状态非法"
				},
				"84" : '访问IP是黑名单',
				"85" : {
					"main" : 'CGI访问key不正确',
					'-1' : 'key长度失败',
					'-2' : 'magicnum校验失败',
					'-3' : '时间校验失败',
					'-4' : 'platform校验失败',
					'-5' : 'clientVer校验失败',
					'-6' : 'encryptVer校验失败'
				},
				"86" : 'CGI访问频率限制',
				// 访问cgi进入fail
				"500" : {
					"main" : "获取服务器数据失败",
					"1" : "getinfo failed",
					"2" : "getkey failed"
				}
			},
			/**
			 * 根据指定的错误码，返回错误描述
			 * @param  {Number} errCode 指定的错误码
			 * @return {String}         错误描述
			 */
			getErrMsg : function(errCode, errContent) {
				if (isNaN(errCode))
					return "";
				if (errCode in tvp.html5lang.errMsg) {
					var val = tvp.html5lang.errMsg[errCode];
					if ($.isString(val))
						return val;
					if ($.isPlainObject(val)) {
						var res = [val["main"], val["main"] ? "," : "", errContent in val ? (val[errContent]) : ""].join("");
						return res || tvp.html5lang.errMsg["default"];
					}
				}
				return tvp.html5lang.errMsg["default"];
			},
			/**
			 * 清晰度文案定义
			 * @type {Object}
			 */
			definition : {
				"mp4" : "高清",
				"msd" : "流畅"
			},
	
			/**
			 * 字幕描述
			 * @type {Object}
			 */
			srtLang : {
				"50001" : {
					"srclang" : "zh-cn",
					"desc" : "简体中文"
				},
				"50002" : {
					"srclang" : "zh-cn",
					"desc" : "简体中文"
				},
				"50003" : {
					"srclang" : "zh-tw",
					"desc" : "繁体中文"
				},
				"50004" : {
					"srclang" : "en",
					"desc" : "英文"
				},
				"50005" : {
					"srclang" : "zh-cn,en",
					"desc" : "简体中文&英文"
				},
				"50006" : {
					"srclang" : "zh-tw,en",
					"desc" : "繁体中文&英文"
				}
			},
			/**
			 * 限播
			 */
			durationLimit : {
				msg : '5分钟看的不够爽？腾讯视频有高清完整版，等你来看~',
				padMsg : '本节目只提供5分钟预览。腾讯视频客户端可以观看高清完整版，等你喔~',
				download : '下载APP',
				padPlay : '立即播放',
				play : '继续播放',
				replay : '重新播放',
				open : '去看完整版'
			},
			/**
			 * 直播下载按钮
			 */
			liveDownloader : {
				downloadText : '下载腾讯视频，观看视频直播',
				openText : '打开腾讯视频，观看视频直播'
			},
			/**
			 * 获取清晰度的名称
			 * @param  {String} key format英文名，对应getinfo的fmt参数
			 * @return {type}    清晰度名称
			 */
			getDefiName : function(key) {
				return key in tvp.html5lang.definition ? tvp.html5lang.definition[key] : "";
			},
			/**
			 * 根据字幕id描述获取字幕描述
			 * @param  {[type]} id [description]
			 * @return {[type]}    [description]
			 */
			getSrtName : function(id) {
				return (id in tvp.html5lang.srtLang) ? tvp.html5lang.srtLang[id].desc : "";
			}
		}
	
	})(tvp, tvp.$);
	tvp.html5skin = {
		/**
		 * 默认出错样式
		 */
		defaultError: (function() {
			return [
				'<div class="tvp_container">',
				'	<div class="tvp_player_error" id="$ERROR-TIPS-INNER$">',
				'       <div class="tvp_player_error_row">',
				'		<div class="tvp_player_error_content">',
				'			<p class="text">$ERROR-MSG$ $ERROR-DETAIL$</p>',
				'		</div>',
				'       </div>',
				'	</div>',
				'</div>'].join("");
		})(),
		/**
		 * 错误提示下载app
		 */
		errorDownloader:(function() {
			return [
				'<div class="tvp_player_goto_app">',
				'	<a href="${url}" class="tvp_download_app_inner">',
				'       <i class="tpv_icon_download"></i>',
				'		<span class="tvp_icon_text">${errorMsg}</span>',
				'	</a>',
				'</div>'].join("");
		})(),
		/**
		 * 限播样式
		 */
		durationLimit: (function() {
			return [
				'<div style="display:none" class="tvp_limit_tips" data-role="durationLimit">',
				'   <div class="tvp_limit_tips_inner">',
				'		<div class="tvp_tips_content">',
				'			<p class="tvp_tips_text">${msg}</p>',
				'		</div>',
				'		<div class="tvp_btn_line">',
				'			<span data-role="durationLimit-play" class="tvp_btn tvp_btn_try">${play}</span>',
				'			<span  data-role="durationLimit-replay" class="tvp_btn tvp_btn_try">${replay}</span>',
				'			<a data-action="applink" ${iframe} href="${url}" data-url="" data-role="durationLimit-download" class="tvp_btn tvp_btn_download">${download}</a>',
				'			<a data-action="applink" href="" data-url="" data-role="durationLimit-open" class="tvp_btn tvp_btn_download">${open}</a>',
				'		</div>',
				'	</div>',
				'</div>'].join("");
		})(),
		/**
		 * 直播下载样式
		 */
		liveDownloader: (function() {
			return [
				'<div  data-role="liveDownloader" style="z-index:10;display:none"  class="tvp_live_download_app">',
					'<a data-action="applink" href="${url}" data-url="${liveOpenUrl}" ${iframe} data-role="liveDownloader-btn" class="tvp_download_app_inner">',
						'<i class="tpv_icon_download"></i>',
						'<span data-role="liveDownloader-text" class="tvp_icon_text">${downloadText}</span>',
					'</a>',
				'</div>'].join("");
		})(),
		/**
		 * 关注星星样式
		 */
		follow : (function(){
			return '<a class="tvp_follow" data-role="appfollow_followbtn" data-follow="follow">\
							<span class="tvp_icon_follow"></span>\
							<span class="tvp_icon_text" data-role="appfollow_followtext">关注</span>\
						</a>\
						<div class="tvp_follow_hint">\
							<div class="tvp_hint_title">关注成功！</div>\
							<div class="tvp_hint_desc" data-role="bannerText">{FOLLOWTEXT}</div>\
						</div>'
		})()
					
	}
	;
	(function(tvp, $) {
	
		if(tvp.BaseHtml5){
			return;
		}
		/**
		 * 统一播放器HTML5内核基类
		 * @class tvp.BaseHtml5
		 * @extends tvp.BasePlayer
		 */
		tvp.BaseHtml5 = function() {
			this.protectedFn = {},
			this.h5EvtAdapter = {},
			this.eventList = this.eventList.concat(["html5error"]),
			this.html5AttrList = {
				/**
				 * 自动播放
				 */
				"autoplay": "autoplay",
				/**
				 * 支持AirPlay
				 */
				"x-webkit-airplay": "isHtml5UseAirPlay",
				"webkit-playsinline":"isiPhoneShowPlaysinline"
			};
			this.$videomod = null;
		};
	
		tvp.BaseHtml5.fn = tvp.BaseHtml5.prototype = new tvp.BasePlayer();
	
		$.extend(tvp.BaseHtml5.fn, {
			/**
			 * 获取当前的video标签对象
			 * @override
			 * @public
			 */
			getPlayer: function() {
				return this.videoTag;
			},
			/**
			 * 获得当前播放器内核类别
			 * @return {type} 当前播放器内核类别
			 */
			getPlayerType: function() {
				return "html5";
			},
			/**
			 * 生成Video标签的HTML代码
			 * @public
			 */
			createVideoHtml: function() {
				this.playerid = this.config.playerid;
				if (!this.playerid) {
					this.playerid = "tenvideo_video_player_" + (tvp.BaseHtml5.maxId++);
				}
				var str = ['<video id="', this.playerid, '" width="100%" height="100%" '].join(""),
					$me = this;
	
				if (this.config.isHtml5UseUI) {
					//本身ios不允许div浮层罩在video标签上方，否则只能看到浮层但无法点击
					//在iPad上可以禁止control属性，这样就可以点击了。
					//但这招对iPhone无效，应该是iPhone播放特性使然
					//解决的方案是先把播放器移到屏幕外比如-200%的地方，播放的时候iphone会自动将视频全屏播放，默认特性
					//如果外部参数指定使用小窗则认为当前是支持小窗的，就不做偏移
					if (($.os.iphone || $.os.ipod) && !! this.config.isIOSVideoOffset && !this.config.isiPhoneShowPlaysinline) {
						str += 'style="position:absolute;top:-200%;left:-200%"';
					}
				}
				
				//解决android手机第一次加载页面时闪现灰色背景的问题
				if(this.config.isHtml5UseUI && this.config.isHtml5ShowPosterOnStart && $.os.android){
					if(!$.browser.UC){
						str += 'style="position:absolute;top:-200%;"';
					}
					else {
						str += 'style="position:absolute;left:-200%;"';
					}
					setTimeout(function(){
						if($me.videoTag && $me.$video.size() == 1){
							var isReset = false;
							$me.$video.one("playing",function(){
								if(isReset){
									return ;
								}
								isReset = true;
								$me.videoTag.style.cssText = "";
							}).one("tvp:h5ui:playbtn:click",function(){
								if(isReset){
									return ;
								}
								isReset = true;
								$me.videoTag.style.cssText = "";
							});
						}
					},100);
				}
	
				for (var p in this.html5AttrList) {
					str += " ";
					var cfgKey = this.html5AttrList[p],
						cfgVal = "";
					if (cfgKey == "") {
						cfgVal = "";
					} else {
						if (!(cfgKey in this.config)) continue; //给的配置在全局配置项里根本就没有对应的属性值，鬼知道该输出啥，跳过
						cfgVal = this.config[cfgKey];
					}
					if (cfgVal === false || cfgVal == "disabled" || cfgVal === 0) continue;
					if(p == "autoplay" && this.config.isHtml5ShowLoadingAdOnStart){//如果设置了要播放loading广告就不要自动播放
						continue;
					}
					str += p;
					if (p == "autoplay" && cfgVal == true) {
						str += '="autoplay"'
						continue;
					};
					if (cfgVal != "") {
						str += ['=', cfgVal].join("");
					}
	
				}
	
				//ios并且没有指定使用小窗就禁用了自定义控制栏就开启原生控制栏
				if(!this.isUseControl && $.os.iphone && !this.config.isiPhoneShowPlaysinline){
					var _html5ForbiddenUIFeature = this.config.html5ForbiddenUIFeature.join('-');
					if(_html5ForbiddenUIFeature.indexOf('controlbar') > -1){
						this.isUseControl = true;
					}
				}
	
				if (this.isUseControl) {
					str += " controls ";
				}
	
				var poster = this.curVideo.getPoster();
				if ($.isString(poster) && poster.length > 0 && $.inArray("posterlayer", this.config.html5VodUIFeature) == -1) {
					str += " poster='" + poster + "'";
				}
				//不带皮肤时如果设置了pic参数 则暂时通过poster属性来显示封面
				if(!poster && this.config.pic && !this.config.isHtml5UseUI){
					str += " poster='" + this.config.pic + "'";
				}
				str += "></video>";
				return str;
			},
	
			write: function(modId) {
				var el = null;
				if ($.type(modId) == "object" && modId.nodeType == 1) {
					el = modId;
					this.$mod = $(modId);
					this.modId = this.$mod.attr("id") || "";
				} else {
					el = tvp.$.getByID(modId);
					this.modId = modId, this.$mod = $("#" + modId);
				}
				if (!el) return;
				var htmlBuf = this.createVideoHtml(),
					videoModId = "mod_" + this.playerid;
				el.innerHTML = '<div id="' + videoModId + '">' + htmlBuf + '</div>';
				this.videomod = $.getByID(videoModId);
				this.$videomod = $(this.videomod);
				this.$videomod.width($.formatSize(this.config.width)).height($.formatSize(this.config.height));
	
				this.videoTag = $.getByID(this.playerid);
				this.$video = $(this.videoTag);
	
				this.registerMonitor();
				this.bindEventAdapt();
				this.checkPlayerSize();
			},
			/**
			 * 处理某些指明了需要人工矫正尺寸的情况
			 * @return {[type]} [description]
			 */
			checkPlayerSize:function(){
	
				var me = this;
				//mp4link时没有$videomod，要设置$elements
				var $box = this.$videomod?this.$videomod:this.$elements;				
	
				if(!this.config.isCheckPlayerSize){
					return;
				}
	
				if(!$box){
					return;
				}
				_resize();
	
				window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function(){
					_resize();
				}, false);
					
				function _resize(){
					//全屏时不处理
					if(me.isFullScreen){
						return;
					}
					setTimeout(function(){
						var width = me.config.width,
							height = me.config.height,
							w = parseInt($box.width(),10),
							h = parseInt($box.height(),10);
						if(height.toString().indexOf('%')>-1){
							return;
						}
						if(h>w){
							h = parseInt(w*9/16,10);
							w = width;
							me.resize(w,h);
						}							
					},100);			
				}
			},
			/**
			 * 重新设置播放器尺寸
			 * @param  {[type]} width  [description]
			 * @param  {[type]} height [description]
			 * @return {[type]}        [description]
			 */
			resize: function(width, height) {
				this.config.width = width;
				this.config.height = height;
				//mp4link时没有$videomod，要设置$elements
				var $box = this.$videomod?this.$videomod:this.$elements;
				if($box){
					$box.width($.formatSize(width)).height($.formatSize(height));
					$box.trigger('tvp:resize');
				}
			},
			/**
			 * 显示播放器播放出错
			 * @param  {Number} errcode 错误码
			 * @param  {Number} errcontent 错误码详细错误内容
			 * @param  {string} errMsg  错误描述
			 */
			showError: function(errcode, errcontent, errMsg) {
	
				var t = this;
	
				/*
					延迟不可去掉，因为页面刷新的时候由于网络传输会被各种abort导致错误
					如果不延迟会导致刷新的时候立即显示错误，体验不好，容易引起误解
				*/
				setTimeout(function() {
					
					var fn = t.getCBEvent("showError");
					if ($.isFunction(fn) && fn != t.showError) {
						fn.call(t, errcode, errcontent, errMsg);
					} else if ($.isFunction(t.config["showError"])) {
						t.config["showError"].call(t, errcode, errcontent, errMsg);
					} else {
						var str = tvp.html5skin.defaultError,
							tipsId = t.playerid + "_errtips_inner",
							errCodeTxt = "错误码:" + errcode,
							errContentTxt = errcontent || errcontent == 0 ? '_'+errcontent : "";
	
						if(tvp.html5lang.errMsg[errcode] && tvp.html5lang.errMsg[errcode].nocode){
							errContentTxt = ""; 
						}
	
						str = str.replace("$ERROR-TIPS-INNER$", tipsId)
							.replace("$ERROR-MSG$", errMsg || tvp.html5lang.getErrMsg(errcode, errcontent))
							.replace("$ERROR-DETAIL$","(" +errCodeTxt + errContentTxt+ ")");
						var $videomod = $(t.videomod),
							$tips = $(str).appendTo($videomod).show();
						//$tips.css("width", t.config.modWidth).css("height", t.config.modHeight).show();
						$videomod.html("");
						$tips.appendTo($videomod);
	
						try {
							//执行回调处理
							if(tvp.html5lang.errMsg[errcode] && tvp.html5lang.errMsg[errcode].callback){
								tvp.html5lang.errMsg[errcode].callback($tips,errcontent,{
									vid:t.curVideo.getVid()
								});
							}
						}catch(e){
	
						}
					}
				}, 250);
	
				//相应onerror事件
				this.callCBEvent("onerror", errcode, errcontent);
	
			},
			/**
			 * 是否使用了自定义的HTML5播放器的某个特性
			 * @param  {type}    fName [description]
			 * @return {Boolean}       [description]
			 */
			isUseH5UIFeature: function(fName) {
				return $.inArray(fName, this.config.html5VodUIFeature) >= 0;
			},
			/**
			 * 是否禁止了自定义的HTML5播放器的某个特性
			 * @param  {[type]}  fName [description]
			 * @return {Boolean}       [description]
			 */
			isForbiddenH5UIFeature: function(fName) {
				return $.inArray(fName, this.config.html5ForbiddenUIFeature) >= 0;
			},
			/**
			 * 调用本地的保护方法
			 * @ignor
			 * @param  {type} fnName 调用本地的保护方法
			 * @return {type}        调用本地的保护方法
			 */
			callProtectFn: function(fnName) {
				if ($.isFunction(this.protectedFn[fnName])) {
					this.protectedFn[fnName].call(this);
				}
			},
			/**
			 * 注册数据上报监听
			 */
			registerMonitor: function() {
				if ($.isFunction(this["buildmonitor"])) {
					this["buildmonitor"].call(this);
				}
			},
			/**
			 * 绑定事件处理
			 */
			bindEventAdapt: function() {
				var evts = [
					"-empty",
					"-abort",
					"-loadstart",
					"-can-play",
					"-can-play-through",
					"-loaded-data",
					"-loaded-metadata",
					"-abort",
					"-error",
					"-pause",
					"-paused",
					"-waiting",
					"-stalled",
					"-suspend",
					"-play",
					"-volume-change",
					"-playing",
					"-seeked",
					"-seeking",
					"-duration-change",
					"-progress",
					"-rate-change",
					"-timeupdate",
					"-ended"
				];
				var t = this;
				$.each(evts, function(i, k) {
					var evtName = "on" + $.camelCase(k),
						fn = t.h5EvtAdapter[evtName];
					if (DEBUG || $.isFunction(fn)) {
						t.$video.on(k.replace(/-/g, ""), function(e) {
							// if (DEBUG) {
							// 	tvp.log(e.type);
							// 	if (e.type == "durationchange") {
							// 		tvp.log("duration = " + e.target.duration);
							// 	}
							// }
							var fn = t.h5EvtAdapter[evtName];
							$.isFunction(fn) && (fn.call(t, this, e));
							// $.isFunction(t[evtName]) && (t[evtName](e));
						});
					}
				});
			}
		});
	
		tvp.BaseHtml5.maxId = 0;
	
	})(tvp, tvp.$);
	/**
	 * @fileOverview 腾讯视频云播放器 HTML5播放器
	 *
	 */
	
	/*
	 * @include "../tvp.define.js"
	 * @include "../../extend/zepto.js"
	 * @include "../tvp.common.js"
	 * @include "../tvp.baseplayer.js"
	 */
	
	;
	(function(tvp, $) {
	
		if(tvp.Html5Tiny){
			return;
		}
		var _isInited = false,
			curVid = "",
			pauseCheckTimer = null,
			isAdrPlayTrack = false,
			_adfirsttu = false;
	
		/**
		 * 判断当前设备是否需要不断的去调用load和play去重试播放
		 * @return {Boolean} [description]
		 */
		function isNeedAdrTrick() {	
			return $.os.android && !isAdrPlayTrack && !$.os.HTC && !$.os.VIVO && $.os.version >= '4.0' && !($.browser.AndriodBrowser && $.browser.version < '30') && navigator.userAgent.indexOf('ZTE U930') != 0;
		}
	
		/**
		 * 不断重试调用load和play，因为有些安卓设备会卡在某个网络状态
		 * @param  {[type]} video [description]
		 * @return {[type]}       [description]
		 */
		function adrInvalidPauseCheck(video,t) {
			var currt = video.currentTime;
			var cnt = 0;
			var flag = false;
			var cbTimer = null;
			isAdrPlayTrack = true;
	
			//video.pause();
			video.play();
	
			video.addEventListener("playing", function() {
				clearTimeout(cbTimer);
				cbTimer = setTimeout(cb, 320); //currentTime响应时间在300毫秒
			}, false);
	
			var _reloadReport = function(count,extra){
				var params = {
					cmd:3547,
					val:count
				};
				if(t && t.config){
					params.contentId = t.config.contentId;
					params.appId = t.config.appid || t.config.appId;
				}
				extra = extra || {};
				params = $.extend(params,extra);
				tvp.report(params);
			}
	
			var hasReport = false;
			var hasReportCanPlay = false;
			var timeStep = 10000;
			var cb = function() {
				tvp.debug("cb");
				if (video.currentTime == currt && !flag) {
					cnt++;
					video.play();
					if (cnt % 10 == 0 && video.currentTime == currt) { //为什么需要再判断一次，因为可能上面play了以后已经可以正常播放了
						video.load();
						video.play();
						if(!hasReport){
							_reloadReport(cnt);
							hasReport = true;
						}
						cbTimer = setTimeout(cb, timeStep);
					}
				} else {
					flag = true;
					//reload后可以播了
					if(hasReport && !hasReportCanPlay){
						_reloadReport(cnt,{
							int5:1
						});
						hasReportCanPlay = true;
					}
				}
			}
	//		cbTimer = setTimeout(cb, timeStep);
		};
	
		/**
		 * @class tvp.Html5TinyPlayer
		 * @param {number}
		 *          vWidth 宽度，单位像素
		 * @param {number}
		 *          vHeight 高度，单位像素
		 * @extends tvp.BasePlayer
		 */
		function Html5TinyPlayer(vWidth, vHeight) {
			var h5EvtAdapter = {},
				$me = this;
			this.videoTag = null, // <video>标签对象
			this.$video = null, // 播放器 $对象
			this.config.width = tvp.$.filterXSS(vWidth),
			this.config.height = tvp.$.filterXSS(vHeight),
			this.protectedFn = {},
			this.isUseControl = true,
	
			$.extend(this.h5EvtAdapter, {
				"onEnded": function() {
					if(this.isPlayingLoadingAd()){
						return ;
					}
					this.$video.trigger("tvp:player:ended");
					this.callCBEvent("onended", curVid);
					var nextVid = "",
						vidArr = this.curVideo.getVidList().split("|"),
						vidIndexOf = $.inArray(curVid, vidArr);
					//修复curVid根本不在vidArr里的情况,modifyed by jarvanxing 2014-06-05
					if (vidIndexOf > - 1 && vidIndexOf < (vidArr.length - 1)) {
						nextVid = vidArr[vidIndexOf + 1];
					}
					if (nextVid != "") { //同时传入了多个视频id，那么就一个一个播放
						this.play(nextVid);
						return;
					}
					this.callCBEvent("onallended");
					this.$video.trigger("tvp:player:allended"); //触发自定义的全部播放完毕事件
	
					if (this.config.isHtml5ShowPosterOnEnd) {
						this.setPoster();
					}
	
					//结束显示限播提示
					if(this.config.isShowDurationLimit && this.DurationLimitInstance){
						this.DurationLimitInstance.show(1);
					}
	
					var nextVideoInfo = this.callCBEvent("ongetnext", curVid, this.curVideo);
					if ( !! nextVideoInfo && nextVideoInfo instanceof tvp.VideoInfo) {
						this.play(nextVideoInfo);
					}
				},
				"onError": function(ts, e) {
					tvp.report({
						cmd: 3525,
						appId : this.config.appid,
						contentId : this.config.contentId,
						vid: this.curVideo.lastQueryVid,
						str4: navigator.userAgent
					});
					if (e.target.currentSrc.indexOf(".m3u8") > 0 /* && this.config.isHtml5UseHLS === "auto"*/ ) {
						tvp.debug("play hls error,reload play mp4...");
						this.play(this.curVideo.lastQueryVid, this.config.autoplay, false);
						return;
					}
					var errContent = -1;
					if ( !! e.target && e.target.error) {
						errContent = e.target.error.code;
					}
					if (errContent != 4) {
						return;
					}
					this.showError(0, errContent);
				},
				"onPlaying" : function() {
					this.callCBEvent("onplaying", curVid, this.curVideo);			
					//只有点击限播浮层上的播放按钮才可以播放
					if(this.isShowingDurationLimit()){
						this.pause();
					}								
				},
				"onTimeupdate" : function(){
					this.callCBEvent("ontimeupdate", curVid, this.$video);
				},
				"onPause" : function(){
					//解决android系统全屏后返回暂停出原生皮肤的问题
					if($.os.android && this.config.isHtml5UseUI){
						this.$video.addClass('tvp_video_with_skin');
					}				
					this.callCBEvent("onpause", curVid, this.$video);
				}
			});
	
	
			// $.extend(this.protectedFn, {
			// 	onwrite: function() {
			// 		//修正安卓微信里点击视频不播放的问题
			// 		//微信里许多安卓手机点击没反应，必须要点击全屏才可以播放
			// 		//所以我这里做了个修改，点击以后强制全屏
			// 		var timer = null;
			// 		if ($.os.android && $.browser.WeChat) {
			// 			$me.$video.on("click", function() {
			// 				tvp.debug("click");
			// 				try {
			// 					if (!document.webkitIsFullScreen) {
			// 						this.webkitEnterFullscreen();
			// 					}
			// 					tvp.debug("this.paused=" + this.paused)
			// 					if (this.paused) {
			// 						timer = setTimeout(function() { //不用timeout的话没法全屏后立即播放，导致还需要再点击播放才行
			// 							tvp.debug("settimeout play");
			// 							$me.videoTag.play();
			// 						}, 100);
	
			// 					} else {
			// 						this.pause();
			// 					}
			// 				} catch (err) {};
			// 			});
			// 			document.addEventListener("webkitfullscreenchange", function() {
			// 				tvp.debug("webkitfullscreenchange:" + document.webkitIsFullScreen);
			// 				if (!document.webkitIsFullScreen) {
			// 					clearTimeout(timer);
			// 					tvp.debug("set pause");
			// 					setTimeout(function() {
			// 						$me.videoTag.pause()
			// 					}, 32);
			// 				}
			// 			});
	
			// 		}
			// 	}
			// });
	
		};
	
		Html5TinyPlayer.fn = Html5TinyPlayer.prototype = new tvp.BaseHtml5();
	
		$.extend(Html5TinyPlayer.prototype, {
			/**
			 * 注册各种插件
			 */
			registerPlugins: function() {
				var t = this,
					//官方插件，不容亵渎，必须使用！
					authorityPluginsList = [];
				$.each(authorityPluginsList, function(i, v) {
					try {
						var evtName = "build" + v;
						if ($.isFunction(t[evtName])) {
							t[evtName](t);
						}
					} catch (err) {
						tvp.debug("[registerPlugins]:" + err.message);
					}
				});
			},
	
			/**
			 * 输出播放器
			 * @override
			 * 
			 * @public
			 */
			write: function(modId) {
				tvp.BaseHtml5.prototype.write.call(this, modId);
				if(this.config.specialVideoFileDomain && tvp.h5Helper && $.isFunction(tvp.h5Helper.setSpecialVideoFileDomain)){
					tvp.h5Helper.setSpecialVideoFileDomain(this.config.specialVideoFileDomain);
				}
				this.registerPlugins();
				this.callProtectFn("onwrite");
				this.play(this.curVideo, this.config.autoplay);
	
				var t = this;
	
				this.$video.one("timeupdate", function() {
					if (isNeedAdrTrick()) {
						adrInvalidPauseCheck(t.videoTag,t);
					}
				});
	
				if ($.os.android && $.browser.WeChat) {
					this.$video.one("click", function() {
						this.load();
					});
				}
			}
		});
	
	
		$.extend(Html5TinyPlayer.prototype, {
			pause: function() {
				this.videoTag.pause();
			},
			/**
			 * 获取当前播放的视频vid，如果有多个视频，则返回第一个视频vid（主vid）
			 * @override
			 * @public
			 */
			getCurVid: function() {
				if (curVid == "") return (this.curVideo instanceof tvp.VideoInfo) ? this.curVideo.getVid() : "";
				return curVid;
			},
	
			/**
			 * 播放指定的视频
			 */
			play: function(v, isAutoPlay, isUseHLS) {
				var t = this,
					isVidChange = false;
				if ($.isUndefined(isAutoPlay)) isAutoPlay = true;
				if ($.isUndefined(isUseHLS)) isUseHLS = this.config.isHtml5UseHLS;
				if ($.isUndefined(v)) {
					t.videoTag.pause();
					t.videoTag.load();
					t.videoTag.play();
					return;
				}
	
				if (v instanceof tvp.VideoInfo) {
					isVidChange = (v.getVid() != curVid && curVid != "");
					t.setCurVideo(v);
					if (isVidChange) {
						t.callCBEvent("onchange", t.curVideo.getFullVid());
						//触发自定义事件，告知各种插件组件当前播放器要准备播放视频了
						this.$video.trigger("tvp:player:videochange");
						//iphone有个怪异的问题，换视频，要先暂停再播放，才能从0位置开始播
						if ($.os.iphone) {
							try {
								t.videoTag.pause();
								t.videoTag.play();
							} catch (err) {};
						}
					}
					v.setPid($.createGUID()); //每播放一次换一次
					curVid = t.curVideo.getFullVid();
				}
	
				if (t.config.isHtml5ShowPosterOnChange) {
					t.setPoster();
				}
	
				t.isGetingInfo = true; //当前是否正在获取数据
				try {
					t.videoTag.pause();
				} catch (err) {}
	
				//从一个独立的CGI判断是否要走HLS
				//逻辑步骤:
				//1. 如果外部没设置为auto，走2，否则走3
				//2.1 走内部逻辑，先判断当前设备是否支持HLS
				//2.2 如果支持HLS，则访问CGI判断当前vid是否用HLS
				//2.3 如果不支持HLS，则走MP4
				//3. 如果设置了参数，则遵循外部参数 
				var _isUseHLS = false;
				if (isUseHLS === "auto") {
					if (tvp.common.isUseHLS()) {
						tvp.h5Helper.loadIsUseHLS({
							vid: curVid
						}).done(function(dltype) {
							_isUseHLS = (dltype == 3);
						}).fail(function() {
							_isUseHLS = false;
						}).always(function() {
							_play.call(t, _isUseHLS);
						})
					} else {
						_isUseHLS = false;
						_play.call(t, _isUseHLS);
					}
				} else {
					_isUseHLS = isUseHLS;
					_play.call(t, _isUseHLS);
				}
	
				function _play(isUseHls) {
					isUseHls = !! isUseHls; //强制转换为boolean
					t.$video.trigger("tvp:video:ajaxstart", v instanceof tvp.VideoInfo ? v.getVid() : v, isUseHls);
					var fn = isUseHls ? t.curVideo.getHLS : t.curVideo.getMP4Url,
						  loadingAdDefer = $.Deferred(),
						  videoUrl,defer;
					if(!isUseHls && t.curVideo.callGetMp4UrlDefer){
						t.curVideo.callGetMp4UrlDefer.done(function(_defer){
							if(_defer && $.isFunction(_defer.done)){
								defer = _defer;
								t.curVideo.callGetMp4UrlDefer = null;
							}
						});
					}
					if(!defer){
						defer = fn.call(t.curVideo, v);
					}
					if(!tvp.Html5UI || !$.isFunction(tvp.Html5UI.fn.buildloadingAd) || !t.config.isHtml5UseUI || (!t.config.isHtml5ShowLoadingAdOnStart && !t.config.isHtml5ShowLoadingAdOnChange)){
						loadingAdDefer.resolve();
					}
					else{
						t.$video.one("tvp:loadingad:ended",function(){
							loadingAdDefer.resolve();
						});
					}
					defer.done(function(videourl){
						videoUrl = videourl;
						t.$video.trigger("tvp:video:ajaxsuc", videourl);
						//显示限播提示
						if(t.config.isShowDurationLimit){
							tvp.html5DurationLimit.create(t);
						}
					});
					$.when(defer,loadingAdDefer).done(function(videourl) {
						videourl = videourl || videoUrl;
						if($.os.android && $.browser.wechat){
							videourl+='&nocache=1&time='+new Date().getTime();
						}					
						t.isGetingInfo = false;
						t.videoTag.preload = navigator.platform.indexOf("Win") > -1 ? "none" : "auto";
						if (!($.browser.WeChat) && "setAttribute" in t.videoTag) {
							t.videoTag.setAttribute("src", videourl);
						} else {
							t.videoTag.src = videourl;
						}
						t.$video.trigger("tvp:video:src"); //触发自定义事件，video的src设置
	
						if (!_isInited) {
							_isInited = true;
							t.callCBEvent("oninited");
						}	
	
						//触发onplay事件
						t.callCBEvent("onplay", t.curVideo.lastQueryVid, t.curVideo);
						if (isAutoPlay) {
							t.videoTag.load();
							t.videoTag.play();
						}
	
						//播放看点视频
						var offset = t.curVideo.getTagStart() || t.curVideo.getHistoryStart() || 0;
						if (offset > 0) {
							t.seek(offset);
						}
	
					}).fail(function(errcode, errcontent) {
						//如果使用了hls，且hls失败，则再次拉取MP4文件
						if (isUseHls) {
							tvp.debug("get hls url fail,reload mp4...");
							_play(false);
							return;
						}
						if (!_isInited) {
							_isInited = true;
							t.callCBEvent("oninited");
						}
						t.$video.trigger("tvp:video:ajaxerror");
						t.$video.trigger("tvp:video:error", errcode, errcontent);
						t.showError(errcode, errcontent);
						t.isGetingInfo = false;
					}).always(function() {
						curVid = t.curVideo.lastQueryVid;
					});
				}
	
			},
			seek: function(time) {
				// 时间，必须确保这是数值类型，公共方法啊，不验证伤不起啊
				if (isNaN(time)) return;
	
				time = Math.min(time, this.getDuration() - 5), time = Math.max(time, 0);
				var t = this,
					seekTimer = null;
				if (seekTimer) {
					clearTimeout(seekTimer);
					seekTimer = null;
				}
	
				var seeks = this.videoTag.seekable;
				if (seeks.length == 1 && time < seeks.end(0)) {
					this.seekTo(time);
				} else {
					seekTimer = setTimeout(function() {
						t.seek(time);
					}, 100);
				}
			},
			seekTo: function(time) {
				var t = this;
				try {
					this.videoTag.currentTime = time;
					this.videoTag.paused && (this.videoTag.play());
				} catch (e) {
					this.$video.one("canplay", function() {
						t.videoTag.currentTime = time;
						t.videoTag.paused && (t.videoTag.play());
					});
				}
			},
			/**
			 * 获取当前播放的时间
			 * @return {[type]} [description]
			 */
			getCurTime: function() {
				return this.videoTag.currentTime;
			},
			/**
			 * @see getCurTime
			 * @return {[type]} [description]
			 */
			getPlaytime: function() {
				return this.getCurTime();
			},
			/**
			 * 设置播放时间
			 * @param {[type]} time [description]
			 */
			setPlaytime: function(time) {
				this.seek(time);
			},
			/**
			 * 循环检查是否开始播放了
			 * @param  {[type]} times [description]
			 * @return {[type]}       [description]
			 */
			checkIsPlayingLoop: function(times) {
				times = times || 0;
				var t = this;
				if ( !! this.playinglooptimer) clearTimeout(this.playinglooptimer);
				if (this.videoTag.currentTime === 0 && times <= 30) {
					this.videoTag.load();
					this.videoTag.play();
					this.playinglooptimer = setTimeout(function() {
						t.checkIsPlayingLoop(++times);
					}, 1000);
				}
			},
			/**
			 * 将video的poster属性设置到播放器的poster属性
			 */
			setPoster: function() {
				var poster = this.curVideo.getPoster();
				//不带皮肤时如果设置了pic参数 则暂时通过poster属性来显示封面
				if(!poster && this.config.pic && !this.config.isHtml5UseUI){
					poster = this.config.pic;
				}			
				if ($.isString(poster) && poster.length > 0) {
					this.videoTag.poster = poster
				} else {
					this.hidePoster();
				}
			},
			hidePoster: function() {
				this.videoTag.removeAttribute("poster");
			},
			/**
			 * 获取总时长
			 * @return {Number} 返回总时长
			 */
			getDuration: function() {
				var dur = this.curVideo.getDuration();
				if (!isNaN(dur) && dur > 0) {
					return dur
				}
				return this.videoTag.duration;
			},
			/**
			 * 获取文件大小
			 * @return {Number} 返回文件大小
			 */		
			getFileSize:function(){
				var size = typeof this.curVideo.getFileSize == 'function'?this.curVideo.getFileSize():0;
				if (!isNaN(size) && size > 0) {
					return size
				}
				return 0;			
			},
			// 确保不会中途卡死，导致无法操作
			checkPause: function() {
				var _timelist = [],
					t = this;
				pauseCheckTimer = setInterval(function(e) {
					if (t.videoTag.paused) {
						return;
					}
					_timelist.push(t.videoTag.currentTime);
	
					if (_timelist.length >= 2) {
						//tvp.log(Math.abs(_timelist[0] - _timelist[2]));
						if (Math.abs(_timelist[0] - _timelist[1]) == 0) {
							if ( !! pauseCheckTimer)
								clearInterval(pauseCheckTimer);
							_timelist = [];
							t.videoTag.load();
							t.videoTag.play();
						} else {
							if ( !! pauseCheckTimer)
								clearInterval(pauseCheckTimer);
						}
						_timelist = [];
					}
				}, 500);
			},
			/**
			 * 是否正在播放loading广告
			 */
			isPlayingLoadingAd : function(){
				return this.$video.attr("data-playing-loadingad") == 1;
			},
			/**
			 * 是否正在展示限播提示
			 * @return {Boolean}
			 */
			isShowingDurationLimit : function(){
				return this.hasDurationLimit() && this.DurationLimitInstance.isShow;
			},
			/**
			 * 是否有限播提示
			 */
			hasDurationLimit : function(){
				this.DurationLimitInstance = this.DurationLimitInstance || this.instance.DurationLimitInstance;
				return this.config.isShowDurationLimit && this.DurationLimitInstance && this.DurationLimitInstance.enable;
			}
		});
	
	
		// extend Html5TinyPlayer to tvp namespace
		tvp.Html5Tiny = Html5TinyPlayer;
	
	
	
	})(tvp, tvp.$);
	/**
	 * @fileOverview 腾讯视频云播放器 HTML5直播播放器
	 */
	
	/*
	 * @include "./tvp.define.js"
	 * @include "./tvp.jquery.js"
	 * @include "./tvp.common.js"
	 * @include "./tvp.baseplayer.js"
	 * @include "./tvp.livehub.js"
	 */
	
	;
	(function(tvp, $) {
		if(tvp.Html5LiveTiny){
			return;
		}
	
		var _isInited = false;
	
		function _reportCanPlayHls(t, canplay) {
			var op = {
				cmd: 3543,
				vid: t.curVideo.getChannelId(),
				contentId: t.config.contentId,
				appId: t.config.appid,
				//当前h5直播支持判断结果
				int5: tvp.common.isLiveUseHTML5() ? 1 : 0,
				//能不能播
				int6: canplay,
				str8: navigator.userAgent
			};
			tvp.report(op);
		}
	
		function _getCgiParams() {
			var op = {
				cmd: 2,
				qq: tvp.common.getUin(),
				guid: encodeURIComponent(tvp.$.createGUID()),
				txvjsv: '2.0',
				stream: 2
			};
			var extData = {
				debug: "",
				ip: ""
			}
			$.each(extData, function(el) {
				extData[el] = $.getUrlParam(el);
			})
			$.extend(op, extData);
			if ($.os.windows) {
				op.system = 0;
			}
			if ($.os.iphone || $.os.ipod) {
				op.system = 1;
				op.sdtfrom = 113;
			}
			if ($.os.ipad) {
				op.sdtfrom = 213;
			}
			if ($.os.android) {
				op.system = 2;
				op.sdtfrom = 313;
			}
			if ($.os.mac) {
				op.system = 3;
			}
	
			return op;
		}
	
		function _stepReort(num,op){
			if(tvp.livehub && tvp.livehub.stepReport){
				tvp.livehub.stepReport(num,op);
			}
		}
	
		function Html5LiveTiny(vWidth, vHeight) {
			this.config.width = tvp.$.filterXSS(vWidth),
			this.config.height = tvp.$.filterXSS(vHeight),
	
			this.videoTag = null, // <video>标签对象
			this.$video = null, // 播放器 $对象
			this.protectedFn = {},
			this.isUseControl = true;
	
			$.extend(this.h5EvtAdapter, {
				"onPlaying": function() {
					var t = this;
					//如果能播放hls,上报且上报一次
					if (!this.hasReportCanPlayHls) {
						this.hasReportCanPlayHls = true;
						_reportCanPlayHls(t, 1);
					}			
				},		
				"onError": function(ts, e) {
					var t = this;
					//播放hls失败,收集黑名单
					_reportCanPlayHls(t, 0);
					var errContent = -1;
					if ( !! e.target && e.target.error) {
						errContent = e.target.error.code;
					}
					//this.showError(0, errContent);
					//没办法播hls则显示下载/打开 按钮
					$.each(tvp.html5LiveFrontShow.plugins,function(i,o){
						if(o.name=='liveDownloader'){
							new o.key(t,true);
						}
					});
					this.callCBEvent("onerror", 0, errContent);
				}
			});
		}
	
		Html5LiveTiny.fn = Html5LiveTiny.prototype = new tvp.BaseHtml5();
	
		$.extend(Html5LiveTiny.fn, {
			/**
			 * 输出播放器
			 */
			write: function(id) {
	
				tvp.BaseHtml5.prototype.write.call(this, id);
	
				this.callProtectFn("onwrite");
				this.callCBEvent("onwrite");
	
				this.play(this.curVideo, this.config.autoplay);
			},
	
			play: function(video, isAutoPlay) {
				var t = this;
				if (!this.videoTag) {
					throw new Error("未找到视频播放器对象，请确认<video>标签是否存在");
				}
				if (!video instanceof tvp.VideoInfo) {
					throw new Error("传入的对象不是tvp.VideoInfo的实例");
				}
				if ($.isUndefined(isAutoPlay)) isAutoPlay = true;
	
				this.setCurVideo(video);
	
				var new_url;
				var userUrl = this.config.playUrl;
				var params = {
					cnlid: video.getChannelId(),
					host: tvp.$.getHost()
				};
				params = $.extend(params, _getCgiParams());
				var defer = $.Deferred();
				//如果直接传入了playUrl 
				if (userUrl) {
					if (/.*\.?qq\.com$/.test(params.host) || /.*\.?qq\.com$/.test(userUrl)) {
						new_url = userUrl;
						//直接使用外部参数地址播放
						_stepReort(9,{
							config:t.config
						});
						defer.resolve(new_url);					
					}else{
						//外部播放地址不合法
						_stepReort(10,{
							config:t.config
						});
						throw new Error("当前域或者播放地址不在白名单内!");
					}
				} else {
					//开始获取播放地址
					_stepReort(11,{
							config:t.config
						});
					var now = $.now();
					$.ajax({
						url: "http://info.zb.qq.com",
						data: params,
						dataType:'jsonp'
					}).done(function(rs, delay) {
						delay = $.now() - now;
						if (rs.playurl) {
							//获取播放地址成功
							_stepReort(12,{
								delay:delay,
								config:t.config
							});
							defer.resolve(rs.playurl);
						} else {
							//获取播放地址失败
							_stepReort(13,{
								delay:delay,
								config:t.config,
								code:rs.iretcode
							});
							defer.reject();
						}
					}).fail(function(error, delay) {
						delay = $.now() - now;
						//请求播放地址失败
						_stepReort(14,{
							delay:delay,
							config:t.config
						});					
						defer.reject();
					});
	
				}
	
				defer.then(function(url) {
					_cb(url);
				});
	
				function _cb(url) {
					t.videoTag.src = url;
					t.$video.trigger("tvp:video:src"); //触发自定义事件，video的src设置
					if (!_isInited) {
						_isInited = true;
						t.callCBEvent("oninited");
					}
	
					t.videoTag.pause();
					if (isAutoPlay) {
						t.videoTag.load(); // 重新加载数据源
						t.videoTag.play(); // 播放
					}
					//加载前贴行为(直播下载/跳转app)
					tvp.html5LiveFrontShow.create(t);
					t.callCBEvent("onchange", t.curVideo.getChannelId());
				}
			}
		});
	
		tvp.Html5LiveTiny = Html5LiveTiny;
		tvp.Html5LiveTiny.maxId = 0;
	})(tvp, tvp.$);
	/**
	 * @fileoverview 腾讯视频统一播放器直播 前贴内容对象
	 */
	
	
	;
	(function(tvp, $) {
	
		function Html5LiveFrontShow(t){
			//存放实例
			this.list = [];
			this.build(t);
		}
	
		$.extend(Html5LiveFrontShow.prototype,{
			build:function(t){
				if(!t){
					return;
				}
				//如果不是直播
				if(t.config.type!==1){
					return;
				}
				if(!!$.os.windows){
					return;
				}
				//根据配置加载前贴组件
				var self = this;
				var frontshowConfig = t.config.html5LiveFrontShow;
				$.each(frontshowConfig,function(i,o){
					$.each(tvp.html5LiveFrontShow.plugins,function(m,n){
						if(o==n.name){
							self.list.push(new n.key(t));
						}
					});
				});
			}
		});
	
	
		/**
		 * 腾讯视频统一播放器5分钟限播
		 * @type {Object}
		 */
		tvp.html5LiveFrontShow = {
			//前贴类集合
			plugins:[],
			create:function(t){
				t.html5LiveFrontShowInstance = new Html5LiveFrontShow(t);
				return t.html5LiveFrontShowInstance;		
			}
		};
	
	})(tvp, tvp.$);
	/**
	 * @fileoverview 腾讯视频统一播放器直播 前贴内容对象-下载/跳转app按钮
	 */
	
	
	;
	(function(tvp, $) {
		var defaultConfig = {
			name:'liveDownloader'
		};
	
	
		function LiveDownloader(t,isNotSupportHls){
			this.build(t,isNotSupportHls);
		}
	
		tvp.html5LiveFrontShow.plugins.push({
			name:'liveDownloader',
			key:LiveDownloader
		});
	
		$.extend(LiveDownloader.prototype,{
			build:function(t,isNotSupportHls){
				if(!t){
					return;
				}
				//如果不是直播
				if(t.config.type!==1){
					return;
				}
	
				//不支持app的平台
				if(tvp.app && !tvp.app.isSupportApp){
					return;
				}
							
				//如果支持h5直播
				if(tvp.common.isLiveUseHTML5() && !isNotSupportHls){
					return;
				}
	
				this.enable = true;
	
				var render = tvp.html5skin[defaultConfig.name];
				var renderData = tvp.html5lang[defaultConfig.name];
				//嵌入页面的情况
				renderData.iframe =  window != top ? 'target="_parent"' : "";
				//默认下载地址
				renderData.url = tvp.app.getDownloadUrl();
				this.renderData = renderData;
				render = $.formatTpl(render,renderData);		
	
				this.t = t;
				this.lid = t.curVideo.getChannelId();
				var $mod = t.$UILayer||t.$videomod;
				this.$mod = $mod;
				$mod.addClass('tvp_container');
				this.element = $(render).appendTo($mod);
				this.$btn = this.element.find('[data-role=liveDownloader-btn]');
				this.$text = this.element.find('[data-role=liveDownloader-text]');
				this._bindEvents();
				this.show();
				this._checkBtn();
			},
	
			_checkBtn:function(){
				var self = this;
				var $btn = this.$btn;
				tvp.app.check({
					lid:self.lid,
					t: self.t
				}).done(function(rs){
					if(rs&&rs.url){
						self.appInfo = rs;
						//修改链接地址
						$btn.attr('href',rs.url);
						$btn.attr('data-url',rs.liveOpenUrl);
						//修改下载为打开
						var openText = self.renderData.openText;
						if(rs.hasApp==1 && openText){
							self.$text.html(openText);
						}				
					}
	
				});			
			},
			_bindEvents:function(){
				var et = $.os.hasTouch ? "touchend" : "click";
				var self = this;
				var banner = self.t.instance.AppBanner;
				if(banner){
					this.$btn.on('touchend click',function(e){
						e.preventDefault();						
					});				
				}			
				this.$btn.on(et,function(e){
					self._report(1);
					if(banner){
						banner.$btn.trigger(et);
					}						
				});
			},
			_report:function(action){
				var t = this.t;
				var op = {
					cmd:3542,
					vid:t.curVideo.getChannelId(),
					contentId:t.config.contentId,
					appId:t.config.appid,
					//0曝光1点击
					int5:action
				};
				tvp.report(op);
			},
			show:function(){
				if(!this.enable){
					return;
				}
				this.t.hidePlayer();
				this.element && this.element.show();
				this.isShow = true;
				this._report(0);
			},
			hide:function(){
				if(!this.enable){
					return;
				}
				this.element && this.element.hide();
				this.isShow = false;			
			}
		});
	
	})(tvp, tvp.$);
	;
	(function(tvp, $) {
		$.extend(tvp.BaseHtml5.fn, {
			enterFullScreen: function() {
				var t = this,
					playerMod = this.$mod[0],
					times = 0;
				if (playerMod.webkitRequestFullScreen) {
					playerMod.webkitRequestFullScreen();
					return;
				}
				if (this.videoTag.webkitSupportsFullscreen) {
					if (this.videoTag.readyState >= 1) {
						this.videoTag.webkitEnterFullscreen();
					} else {
						if (++times >= 30) return;
						setTimeout(function() {
							t.enterFullScreen()
						}, 200);
					}
				}
			}
		});
	})(tvp, tvp.$)
	/**
	 * @fileOverview 腾讯视频统一播放器 HTML5播放器的清晰度切换API
	 * 
	 */
	
	
	;
	(function(tvp, $) {
		$.extend(tvp.Html5Tiny.fn, {
			/**
			 * 切换清晰度
			 * @memberOf tvp.Html5Tiny
			 * @param  {[type]} format [description]
			 * @return {[type]}        [description]
			 */
			swtichDefinition: function(format) {
				if (this.curVideo.getFormat() == format) return;
	
				this.pause();
				var curTime = this.getCurTime(),
					t = this,
					timer = null;
				this.curVideo.setFormat(format);
	
				this.$video.one("canplay canplaythrough", function(e) {
					if (!t.isDefinitionSwitching) {
						return;
					}
					setTimeout(function() {
						t.seek(curTime)
					}, 500);
					timer = setInterval(function() {
						if (t.videoTag.currentTime >= curTime) {
							clearInterval(timer);
							timer = null;
							t.isDefinitionSwitching = false;
						}
					}, 50);
				});
	
				this.isDefinitionSwitching = true;
				this.play(this.curVideo);
			}
		});
	})(tvp, tvp.$);
	;
	(function(tvp, $) {
	
		/**
		 * 播放质量监控组件
		 * @param {type} vid [description]
		 */
		function TimerObject() {
			this.start = tvp.$.now();
			this.end = 0;
		};
		TimerObject.prototype = {
			getTimelong: function() {
				this.end = tvp.$.now();
				if (this.end <= 0 || this.start <= 0) return 0;
				var a = this.end - this.start;
				return (a <= 0 ? 0 : a);
			},
			getSeconds: function() {
				return parseInt(this.getTimelong() / 1000, 10);
			}
		};
	
	
		function Monitor(vid, player) {
			this.vid = vid || "";
			this.player = player;
			this.rid = player.curVideo.getRid() || $.createGUID();
			this.pid = player.curVideo.getPid() || $.createGUID();
			this.reportTimer = {};
	
			var playertype = $.isFunction(player.getPlayerType) ? player.getPlayerType().toUpperCase() : "";
			var cgiURL = "http://rcgi.video.qq.com/report/play?",
				platformId = this.getplatform(),
				ver = ["TenPlayer", playertype, "V2.0"].join(""),
				param = {
					"version": ver,
					"vid": this.vid,
					"rid": this.rid,
					"pid": this.pid,
					"url": window != top ? document.referrer : document.location.href,
					"platform": platformId,
					"ptag": $.cookie.get("ptag"),
					"pfversion": $.os.version,
					appid : player.config.appid
				};
	
			this.getStepName = function(step) {
				return "report_" + step;
			};
			this.addStep = function(step, extData) {
				this.reportTimer[this.getStepName(step)] = new TimerObject();
			};
			this.delStep = function(step) {
				delete this.reportTimer[this.getStepName(step)];
			};
	
			this.report = function(step, val, extData) {
				var r = [],
					videodata = {},
					pa = {},
					url = cgiURL;
	
				if (!step) return;
	
				$.extend(pa, param);
	
				if (typeof extData == "object") {
					$.extend(pa, extData);
				}
	
				try {
					videodata.vt = player.curVideo.data.vl.vi[0].ul.ui[0].vt;
				} catch (er) {
					videodata.vt = 0;
				}
				videodata.vurl = player.curVideo.url;
				videodata.bt = parseInt(player.getDuration(), 10);
	
				$.extend(pa, videodata);
				pa.step = step;
				pa.ctime = $.getISOTimeFormat();
				pa.val = val;
	
				for (var p in pa) {
					var v = pa[p];
					if (isNaN(v)) {
						v = encodeURIComponent("" + v);
					}
					r.push(p + "=" + v);
				}
				url += r.join("&");
	
				tvp.report(url);
			}
	
			this.reportStep = function(step, extData) {
				if (!(this.reportTimer[this.getStepName(step)] instanceof TimerObject)) {
					tvp.debug("no timer " + step);
					return;
				}
	
				var val = this.reportTimer[this.getStepName(step)].getTimelong();
	
				if (isNaN(val) || val <= 0 || val > 9000000) {
					return;
				}
	
				this.report(step, val, extData);
				this.delStep(step);
			}
		};
	
		Monitor.fn = Monitor.prototype = {
			/**
			 * 获取上报的业务id
			 * @return {Number} 业务id
			 */
			getBusinessId: function() {
				//任何页面只要是在微信里打开，都算到微信的头上
				if ( !! $.browser.WeChat) {
					return 6;
				}
	
				if ( !! $.browser.MQQClient) {
					return 17;
				}
	
				var host = "";
				//如果是使用的统一播放器iframe版本，则需要获取顶部的url，由于可能跨域所以从referrer里取
				//被iframe的页面的referrer是其父页面的url
				if (document.location.href.indexOf("http://v.qq.com/iframe/") >= 0 && window != top) {
					var l = document.referrer;
					if (l != "") {
						var link = document.createElement("a");
						link.href = l;
						host = link.hostname;
						link = null;
						delete link;
					}
				}
				if (host == "") {
					host = document.location.hostname || document.location.host;
				}
				var keys = [{
						r: /(\w+\.)?weixin\.qq\.com$/i,
						v: 6
					},
					//腾讯视频
					{
						r: /^(v|film)\.qq\.com$/i,
						v: 1
					},
					//腾讯新闻
					{
						r: /^news\.qq\.com$/i,
						v: 2
					},
					//Qzone
					{
						r: /(\w+\.)?qzone\.qq\.com$/i,
						v: 3
					},
					//腾讯微博
					{
						r: /(\w+\.)?t\.qq\.com$/i,
						v: 5
					},
					//3g.v.qq.com
					{
						r: /^3g\.v\.qq\.com$/i,
						v: 8
					},
					//m.v.qq.com
					{
						r: /^m\.v\.qq\.com$/i,
						v: 10
					}
				];
				host = host.toLowerCase();
				for (var i = 0, len = keys.length; i < len; i++) {
					var key = keys[i];
					if (key.r.test(host)) {
						return key.v;
					}
				}
				return 7; //7表示其他，固定值，详情咨询figecheng或者vicyao
			},
			/**
			 * 获取上报的设备编号
			 * @return {Number} 设备编号
			 */
			getDeviceId: function() {
				var os = $.os,
					ua = navigator.userAgent;
				if (os.ipad) return 1;
				if (os.windows) {
					//windows pad userAgent like this: Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; WOW64; Trident/6.0; Touch)
					if (/Touch/i.test(ua)) return 8;
					//windows phone userAgent like this:
					//Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 920)
					if (/Phone/i.test(ua)) return 7;
					return 2;
				}
				if (os.android) {
					if (os.tablet) return 5;
					return 3;
				}
				if (os.iphone) return 4;
				if (os.Mac) return 9;
	
				//未知设备
				return 10;
			},
			/**
			 * 获取上报的platform值
			 * @return {Number} platform值
			 */
			getplatform: function() {
				//编号方式	业务编号×10000+设备编号×100+播放方式			
				var bussId = this.getBusinessId(),
					deviceId = this.getDeviceId();
				return bussId * 10000 + deviceId * 100 + 1; //播放方式 1表示HTML5，写死
			}
		}
	
		tvp.H5Monitor = Monitor;
	
	})(tvp, tvp.$);
	/**
	 * @fileoverview 腾讯视频统一播放器H5内核 语言包
	 */
	
	;
	(function(tvp, $) {
		var defaultConfig = {
			name : 'durationLimit',
			downLoadUrl : 'http://mcgi.v.qq.com/commdatav2?cmd=4&confid=673&platform=aphone',
			md5 : '1704845DAA0D5B250F869E01238659E9'
		};
	
		function DurationLimit() {
			// 上报区分用
			this.isFirstShow = 0;
		}
	
		$.extend(DurationLimit.prototype, {
			        build : function(t) {
				        var $me = this;
				        if (!t) {
					        return;
				        }
				        // 如果是直播
				        if (t.config.type == 1) {
					        return;
				        }
	
				        // 不支持app的平台
				        if (tvp.app && !tvp.app.isSupportApp) {
					        return;
				        }
	
				        // 没开启ui
				        if (!t.config.isHtml5UseUI) {
					        return;
				        }
	
				        var data = t.curVideo.data;
				        this.vid = t.curVideo.getVid();
				        if (data && data.exem && data.preview) {
					        // t.config[defaultConfig.name] = true;
					        t.curVideo.setDuration(data.preview.toString());
					        this.enable = true;
				        }
				        else {
					        return;
				        }
				        t.trigger('tvp.durationlimit.enable');
				        var render = tvp.html5skin[defaultConfig.name];
				        var renderData = tvp.html5lang[defaultConfig.name];
				        // 嵌入页面的情况
				        renderData.iframe = window != top ? 'target="_parent"' : "";
				        // 默认下载地址
				        renderData.url = defaultConfig.downLoadUrl || tvp.app.getDownloadUrl();
				        renderData.msg = (tvp.$.os.tablet ? renderData.padMsg : renderData.msg) || '';
				        var limitTime = data.preview - 29;
				        limitTime = limitTime>0 ? limitTime: 1;
				        renderData.msg = renderData.msg.replace('5', Math.ceil(limitTime / 60));
				        renderData.play = tvp.$.os.tablet ? renderData.padPlay : renderData.play;
				        render = $.formatTpl(render, renderData);
				        this.t = t;
				        var $mod = t.$UILayer || t.$videomod;
				        this.$mod = $mod;
				        $mod.addClass('tvp_container');
				        this.element = $(render).appendTo($mod);
				        this.playBtn = this.element.find('[data-role=durationLimit-play]');
				        this.downloadBtn = this.element.find('[data-role=durationLimit-download]');
				        this.openBtn = this.element.find('[data-role=durationLimit-open]');
				        this.replayBtn = this.element.find('[data-role=durationLimit-replay]');
				        this._bindEvents();
				        if (tvp.$.os.tablet) {
					        this.show();
				        }
				        else {
					        this.t.$video.on('pause', function() {
						                if ($me.t.control && $me.t.control.isTouching) {// 正在拖进度条
							                return;
						                }
						                else if($.isFunction($me.t.isPlayingLoadingAd) && $me.t.isPlayingLoadingAd()){ //正在播放广告
						                	return ;
						                }
						                $me.show(this.currentTime > 0 && Math.ceil(this.currentTime) == Math.ceil(this.duration));
					                }).on('play', function() {
						                $me.hide();
					                });
				        }
			        },
	
			        fixBtn : function(isend, hasApp) {
				        if (hasApp == 1) {
					        this.downloadBtn.hide();
					        this.openBtn.show();
				        }
				        else {
					        this.downloadBtn.show();
					        this.openBtn.hide();
				        }
				        if (isend) {
					        this.playBtn.hide();
					        this.replayBtn.show();
				        }
				        else {
					        this.playBtn.show();
					        this.replayBtn.hide();
				        }
			        },
			        checkBtn : function(isend) {
				        var self = this;
				        var downloadBtn = this.downloadBtn;
				        var openBtn = this.openBtn;
				        tvp.app.check({
					                vid : self.vid,
					                downloadUrl : defaultConfig.downLoadUrl,
					                md5 : defaultConfig.md5,
					                t : self.t
				                }).done(function(rs) {
					                if (rs && rs.url) {
						                self.appInfo = rs;
						                downloadBtn.attr('href', rs.url);
						                downloadBtn.attr('data-url', rs.openUrl);
						                openBtn.attr('href', rs.openUrl);
						                openBtn.attr('data-url', rs.openUrl);
						                self.fixBtn(isend, rs.hasApp);
						                self.bindDownloader(downloadBtn);
					                }
	
				                });
			        },
			        bindDownloader : function(btn) {
				        var self = this;
				        var appbannerParams = (self.t.config.plugins && self.t.config.plugins.AppBanner) ? self.t.config.plugins.AppBanner : {};
				        appbannerParams = $.extend(appbannerParams, {
					                downloader : true,
					                downloadUrl : defaultConfig.downLoadUrl,
					                md5 : defaultConfig.md5
				                });
				        if (this.hascheckDownloader) {
					        return;
				        }
				        else {
					        this.hascheckDownloader = true;
				        }
				        // var downloaderRes =
				        // tvp.app.checkCanDownloader(self.appInfo.hasApp,params);
				        tvp.app.checkCanDownloader(self.appInfo.hasApp, appbannerParams).done(function(rs) {
					                var count = 0;
					                var curInerval = setInterval(function() {
						                        count++;
						                        if (count < 20) {
							                        if (rs && tvp.app.hasDownloader) {
								                        clearInterval(curInerval);
								                        if ($.downloadClick_wechat && $.downloadClick_wechat.hasDownloader) {
									                        $.downloadClick_wechat.bindDownloader(btn);
								                        }
								                        if ($.downloadClick_mqq && $.downloadClick_mqq.hasDownloader) {
									                        $.downloadClick_mqq.bindDownloader(btn);
								                        }
							                        }
						                        }
						                        else {
							                        clearInterval(curInerval);
						                        }
					                        }, 100);
				                });
			        },
			        _bindEvents : function() {
				        var et = $.os.hasTouch ? "touchend" : "click";
				        var self = this;
				        var t = this.t;
				        var videoTag = t.$video[0];
				        var uiPlay = false;
				        // 带皮肤时
				        if (t.config.isHtml5UseUI) {
					        uiPlay = this.$mod.find(tvp.html5skin.elements.overlay.play);
				        }
	
				        this.playBtn.on(et, function() {
					                self.hide();
					                if (uiPlay) {
						                uiPlay.trigger(et);
					                }
					                else {
						                t.play();
					                }
					                self._report(1, 1);
				                });
				        this.downloadBtn.on(et, function() {
					                self._report(1, 2);
				                });
				        this.openBtn.on(et, function() {
					                self._report(1, 3);
				                });
				        this.replayBtn.on(et, function() {
					                self.hide();
					                if (uiPlay) {
						                uiPlay.trigger(et);
					                }
					                else {
						                videoTag.load();
						                videoTag.play();
					                }
					                self._report(1, 4);
				                });
			        },
			        _report : function(action, btnType) {
				        var t = this.t;
				        var isFirstShow = this.isFirstShow == 1 ? 1 : 0;
				        var op = {
					        cmd : action == 0 ? 3539 : 3540,
					        vid : t.curVideo.getVid(),
					        contentId : t.config.contentId,
					        appId : t.config.appid,
					        int5 : btnType || 0,
					        // 是开始还是结束时显示
					        int6 : isFirstShow
				        };
				        tvp.report(op);
			        },
			        show : function(isend) {
				        var $self = this;
				        if (!this.enable) {
					        return;
				        }
				        this.isFirstShow++;
				        if (!$.os.ipad) {
					        this.t.hidePlayer();
				        }
				        this.element && this.element.show();
				        this.isShow = true;
				        this.fixBtn(isend);
				        this.checkBtn(isend);
				        this._report(0);
				        this.t.trigger('tvp.durationlimit.show');
				        if (isend) {
					        // 如果是结束时出现，要在切换视频播放后隐藏
					        this.t.$video.one('tvp:player:videochange', function() {
						                $self.hide();
					                });
				        }
			        },
			        hide : function() {
				        if (!this.enable) {
					        return;
				        }
				        // iphone中常驻限播提示
				        // if (!$.os.iphone) {
					        this.element && this.element.hide();
				        // }
				        this.isShow = false;
				        // if (!$.os.ipad && !$.os.iphone) {
					        this.t.showPlayer();
				        // }
				        this.t.trigger('tvp.durationlimit.hide');
			        }
		        });
	
		/**
		 * 腾讯视频统一播放器5分钟限播
		 * @type {Object}
		 */
		tvp.html5DurationLimit = {};
		tvp.html5DurationLimit.create = function(t) {
			t.DurationLimitInstance = new DurationLimit();
			t.DurationLimitInstance.build(t);
			return t.DurationLimitInstance;
		}
	
	})(tvp, tvp.$);
	;
	(function(tvp, $) {
		//扩展基础插件
		$.extend(tvp.Html5Tiny.fn, {
			/**
			 * 创建播放质量监控
			 */
			buildmonitor: function() {
				var t = this,
					monitor = null,
					waitingTimes = 0,
					isUseHls = false;
	
				this.$video.on("tvp:video:ajaxstart", function(e, vid, hls) {
					isUseHls = hls;
					monitor = null;
					monitor = new tvp.H5Monitor(vid, t);
					monitor.addStep(isUseHls ? 1009 : 1011);
				}).on("tvp:video:ajaxsuc", function() {
					monitor.report(3, 1);
					monitor.reportStep(isUseHls ? 1009 : 1011, {
						val1: 1,
						val2: 0
					});
				}).on("tvp:video:src", function() {
					waitingTimes = 0;
					monitor.report(4, 1,{
						val2 : 1
					});
					monitor.addStep(6);
					monitor.addStep(30);
	
					t.$video.one("canplay", function() {
						monitor.reportStep(30, {
							"val1": 0,
							"val2": 2
						});
					}).one("error", function() {
						monitor.reportStep(30, {
							"val1": 1,
							"val2": 2
						});
						monitor.report(5, 0, {
							"val1": 3
						});
					}).one("playing", function() {
						monitor.reportStep(6, {
							"val1": 1
						});
						monitor.addStep(5);
						reportToBoss({
							itype : 1
						});
						t.$video.one("tvp:player:ended", function() {
							monitor.reportStep(5, {
								"val1": 1
							});
							reportToBoss({
								itype : 2
							});
						}).one("tvp:player:videochange", function() {
							monitor.reportStep(5, {
								"val1": 2
							});
							reportToBoss({
								itype : 3
							});
						});
					});
				}).on("waiting", function() {
					if (++waitingTimes == 1) return;
					if ( !! t.isDefinitionSwitching || !! t.isTouching) return;
					monitor.addStep(31);
					t.$video.one("timeupdate", report31)
				}).one("tvp:h5ui:playbtn:click",function(){
					reportToBoss({
						itype : 4
					});
				});
	
				var report31 = function() {
					var sp = monitor.reportTimer[monitor.getStepName(31)],
						tl = 0;
					if (!sp) {
						t.$video.off("timeupdate", report31);
						return;
					}
					tl = sp.getTimelong();
					monitor.report(31, Math.min(10000, tl), {
						"val1": tl > 10000 ? 1 : 0,
						"val2": 2,
						"ptime ": t.videoTag.currentTime
					});
					t.$video.off("timeupdate", report31);
				};
				
				/**
				 * 上报到boss和tdw
				 */
				var reportToBoss = function(_params){
					_params = _params || {};
					var params = {
						cmd : 3533,
						appId : t.config.appid || 0,
						contentId : t.config.contentId || "",
						vid : t.curVideo.getFullVid(),
						init5: t.hasDurationLimit() ? 1 : 0
					}
					params = $.extend(params,_params);
					tvp.report(params);
				}
			}
		});
	})(tvp, tvp.$);
	/**
	 * @fileoverview 腾讯视频统一播放器H5内核 语言包
	 */
	
	;
	(function(tvp, $) {
		/**
		 * 腾讯视频统一播放器H5内核语言包
		 * @type {Object}
		 */
		tvp.html5lang = {
			/**
			 * 错误码定义
			 * @type {Object}
			 * wiki:http://tapd.oa.com/tvideo/prong/stories/view/1010031991056002352 --pantherruan
			 */
			errMsg : {
				"default" : "抱歉,暂不支持播放",
				"0" : "当前视频文件无法播放", // 触发video.onerror事件
				"68" : 'CGI系统错误,请刷新页面重试', // cgi返回数据不合法
				// 以下都是ajax读取CGI从服务器返回的错误
				"-1" : 'cgi参数错误/cgi向服务器发包错误,请刷新页面重试',
				"-2" : 'cgi从服务器接包错误,请刷新页面重试',
				"-3" : 'cgi从服务器解包错误,请刷新页面重试',
				"-4" : 'cgi连接服务器网络错误,请刷新页面重试',
				"-6" : 'cgi连接服务超时,请刷新页面重试',
				"-7" : 'cgi访问服务未知错误,请刷新页面重试',
				"50" : 'CGI系统错误,请刷新页面重试',
				"52" : '访问视频付费信息失败，请刷新页面重试',
				"64" : '校验视频付费信息失败，请刷新页面重试',
	
				"51" : 'vid个数超出范围',
				"61" : 'vid不合法',
				"62" : '视频状态不合法',
				"63" : '清晰度格式不合法',
				"65" : '速度格式不合法',
				"67" : '视频格式不存在',
				"69" : 'format列表为空',
				"71" : '未找到HLS CDN',
				"73" : '生成文件名失败',
				"74" : '分片号不合法',
				"76" : '获取m3u8文件名失败',
				"77" : '生成HLS key失败',
				"80" : {
					"0" : '因版权限制,请到腾讯视频观看',
					"1" : "根据您当前的IP地址，该地区暂不提供播放",
					"2" : '因版权限制，暂不支持播放',
					callback : function($content, errcode, data) {
						if (parseInt(errcode) == 0 && tvp.app && data && data.vid) {
							var tpl = tvp.html5skin.errorDownloader;
							tvp.app.check(data).done(function(rs) {
								        if (rs.url) {
									        var $box = $content.find('.tvp_player_error_content');
									        var content = $content.find('.text').html();
									        content = content.substr(0, content.indexOf('('));
									        if (tpl) {
										        content = tpl.replace('${errorMsg}', content);
										        content = content.replace('${url}', rs.url);
									        }
									        else {
										        content = '<a href="' + rs.url + '">' + content + '</a>';
									        }
									        $box.length && $box.html(content);
								        }
							        });
						}
					}
				},
				"81" : 'referer限制',
				"82" : 'qzone权限限制',
				// 根据cgi返回结果判断
				"83" : {
					"main" : "视频付费限制",
					"-2" : "您可能未登录或登录超时",
					"-1" : "视频状态非法"
				},
				"84" : '访问IP是黑名单',
				"85" : {
					"main" : 'CGI访问key不正确',
					'-1' : 'key长度失败',
					'-2' : 'magicnum校验失败',
					'-3' : '时间校验失败',
					'-4' : 'platform校验失败',
					'-5' : 'clientVer校验失败',
					'-6' : 'encryptVer校验失败'
				},
				"86" : 'CGI访问频率限制',
				// 访问cgi进入fail
				"500" : {
					"main" : "获取服务器数据失败",
					"1" : "getinfo failed",
					"2" : "getkey failed"
				}
			},
			/**
			 * 根据指定的错误码，返回错误描述
			 * @param  {Number} errCode 指定的错误码
			 * @return {String}         错误描述
			 */
			getErrMsg : function(errCode, errContent) {
				if (isNaN(errCode))
					return "";
				if (errCode in tvp.html5lang.errMsg) {
					var val = tvp.html5lang.errMsg[errCode];
					if ($.isString(val))
						return val;
					if ($.isPlainObject(val)) {
						var res = [val["main"], val["main"] ? "," : "", errContent in val ? (val[errContent]) : ""].join("");
						return res || tvp.html5lang.errMsg["default"];
					}
				}
				return tvp.html5lang.errMsg["default"];
			},
			/**
			 * 清晰度文案定义
			 * @type {Object}
			 */
			definition : {
				"mp4" : "高清",
				"msd" : "流畅"
			},
	
			/**
			 * 字幕描述
			 * @type {Object}
			 */
			srtLang : {
				"50001" : {
					"srclang" : "zh-cn",
					"desc" : "简体中文"
				},
				"50002" : {
					"srclang" : "zh-cn",
					"desc" : "简体中文"
				},
				"50003" : {
					"srclang" : "zh-tw",
					"desc" : "繁体中文"
				},
				"50004" : {
					"srclang" : "en",
					"desc" : "英文"
				},
				"50005" : {
					"srclang" : "zh-cn,en",
					"desc" : "简体中文&英文"
				},
				"50006" : {
					"srclang" : "zh-tw,en",
					"desc" : "繁体中文&英文"
				}
			},
			/**
			 * 限播
			 */
			durationLimit : {
				msg : '5分钟看的不够爽？腾讯视频有高清完整版，等你来看~',
				padMsg : '本节目只提供5分钟预览。腾讯视频客户端可以观看高清完整版，等你喔~',
				download : '下载APP',
				padPlay : '立即播放',
				play : '继续播放',
				replay : '重新播放',
				open : '去看完整版'
			},
			/**
			 * 直播下载按钮
			 */
			liveDownloader : {
				downloadText : '下载腾讯视频，观看视频直播',
				openText : '打开腾讯视频，观看视频直播'
			},
			/**
			 * 获取清晰度的名称
			 * @param  {String} key format英文名，对应getinfo的fmt参数
			 * @return {type}    清晰度名称
			 */
			getDefiName : function(key) {
				return key in tvp.html5lang.definition ? tvp.html5lang.definition[key] : "";
			},
			/**
			 * 根据字幕id描述获取字幕描述
			 * @param  {[type]} id [description]
			 * @return {[type]}    [description]
			 */
			getSrtName : function(id) {
				return (id in tvp.html5lang.srtLang) ? tvp.html5lang.srtLang[id].desc : "";
			}
		}
	
	})(tvp, tvp.$);
	tvp.html5skin = {
		/**
		 * 默认出错样式
		 */
		defaultError: (function() {
			return [
				'<div class="tvp_container">',
				'	<div class="tvp_player_error" id="$ERROR-TIPS-INNER$">',
				'       <div class="tvp_player_error_row">',
				'		<div class="tvp_player_error_content">',
				'			<p class="text">$ERROR-MSG$ $ERROR-DETAIL$</p>',
				'		</div>',
				'       </div>',
				'	</div>',
				'</div>'].join("");
		})(),
		/**
		 * 错误提示下载app
		 */
		errorDownloader:(function() {
			return [
				'<div class="tvp_player_goto_app">',
				'	<a href="${url}" class="tvp_download_app_inner">',
				'       <i class="tpv_icon_download"></i>',
				'		<span class="tvp_icon_text">${errorMsg}</span>',
				'	</a>',
				'</div>'].join("");
		})(),
		/**
		 * 限播样式
		 */
		durationLimit: (function() {
			return [
				'<div style="display:none" class="tvp_limit_tips" data-role="durationLimit">',
				'   <div class="tvp_limit_tips_inner">',
				'		<div class="tvp_tips_content">',
				'			<p class="tvp_tips_text">${msg}</p>',
				'		</div>',
				'		<div class="tvp_btn_line">',
				'			<span data-role="durationLimit-play" class="tvp_btn tvp_btn_try">${play}</span>',
				'			<span  data-role="durationLimit-replay" class="tvp_btn tvp_btn_try">${replay}</span>',
				'			<a data-action="applink" ${iframe} href="${url}" data-url="" data-role="durationLimit-download" class="tvp_btn tvp_btn_download">${download}</a>',
				'			<a data-action="applink" href="" data-url="" data-role="durationLimit-open" class="tvp_btn tvp_btn_download">${open}</a>',
				'		</div>',
				'	</div>',
				'</div>'].join("");
		})(),
		/**
		 * 直播下载样式
		 */
		liveDownloader: (function() {
			return [
				'<div  data-role="liveDownloader" style="z-index:10;display:none"  class="tvp_live_download_app">',
					'<a data-action="applink" href="${url}" data-url="${liveOpenUrl}" ${iframe} data-role="liveDownloader-btn" class="tvp_download_app_inner">',
						'<i class="tpv_icon_download"></i>',
						'<span data-role="liveDownloader-text" class="tvp_icon_text">${downloadText}</span>',
					'</a>',
				'</div>'].join("");
		})(),
		/**
		 * 关注星星样式
		 */
		follow : (function(){
			return '<a class="tvp_follow" data-role="appfollow_followbtn" data-follow="follow">\
							<span class="tvp_icon_follow"></span>\
							<span class="tvp_icon_text" data-role="appfollow_followtext">关注</span>\
						</a>\
						<div class="tvp_follow_hint">\
							<div class="tvp_hint_title">关注成功！</div>\
							<div class="tvp_hint_desc" data-role="bannerText">{FOLLOWTEXT}</div>\
						</div>'
		})()
					
	}
	/**
	 * @fileOverview 腾讯视频统一播放器 HTML5播放器
	 *
	 */
	
	/*
	 * @include "../tvp.define.js"
	 * @include "../../extend/zepto.js"
	 * @include "../tvp.common.js"
	 * @include "../tvp.baseplayer.js"
	 * @include "./tvp.html5tiny.js"
	 */
	
	;
	(function(tvp, $) {
	
		if(tvp.Html5Player){
			return;
		}
	
		/**
		 * 腾讯视频统一播放器 带有控制栏的HTML5播放器
		 */
	
		function Html5Player(vWidth, vHeight) {
			this.isUseControl = false;
			this.config.width = tvp.$.filterXSS(vWidth);
			this.config.height = tvp.$.filterXSS(vHeight);
			this.control = null;
			this.$UILayer = null;
	
			var $self = this;
			$.extend(this.protectedFn, {
				onwrite: function() { //注意这个会覆盖tinyplayer的onwrite接口哦
					//皮肤图片使用了SVG，对于不支持SVG的直接加个样式
					//这个样式名能自动使用png图片，重构接口人blankyu
					var time = [];
					time[0] = new Date().getTime();	
								
					var cssname = tvp.html5skin.noSVGClassName;
					if ($.isString(cssname) && cssname.length > 0 && !tvp.common.isSupportSVG()) {
						this.videomod.classList.add(cssname);
					}
	
					//开始创建各种UI皮肤和皮肤里的各种零件
					this.control = new tvp.Html5UI($self);
					this.control.init();
					this.$UILayer = this.control.$UILayer;
	
					time[1] = new Date().getTime();
					tvp.report({
						cmd:3536,
						vid:this.getCurVid(),
						//别名：appid业务id
						appId:this.config.appid,
						//业务内容id
						contentId:this.config.contentId,
						//测速单位毫秒				
						speed:time[1]-time[0]
					});
				}
			});
	
			// $.extend(this.h5EvtAdapter, {
			// 	"onCanPlayThrough": function() {
			// 		var prefix = $self.getCurVideo().getPrefix();
			// 		if (prefix > 0) {
			// 			this.seek(prefix);
			// 			$self.showTips("播放器已经为您自动跳过片头");
			// 		}
			// 	}
			// });
		};
		Html5Player.fn = Html5Player.prototype = new tvp.Html5Tiny();
	
		$.extend(Html5Player.prototype, {
			createVideoHtml: function() {
				var videoTagHtml = tvp.Html5Tiny.prototype.createVideoHtml.call(this), // 调用父类的方法
					html = tvp.html5skin.getHtml(this.config);
				return html.replace("$VIDEO$", videoTagHtml);
			},
			// write: function(modId) {
			// 	var t = this;
			// 	this.loadCss().done(function() {
			// 		tvp.Html5Tiny.prototype.write.call(t, modId);
			// 	});
			// },
			hideControl: function() {
				this.control.hide();
			},
			showControl: function() {
				this.control.show();
			}
		});
	
		// extends Html5Player to tvp namespace
		tvp.Html5Player = Html5Player;
	
	})(tvp, tvp.$);
	/**
	 * @fileOverview 腾讯视频统一播放器 HTML5播放器
	 *
	 */
	
	/*
	 * @include "../tvp.define.js"
	 * @include "../../extend/zepto.js"
	 * @include "../tvp.common.js"
	 * @include "../tvp.baseplayer.js"
	 * @include "./tvp.html5tiny.js"
	 */
	
	;
	(function(tvp, $) {
		if(tvp.Html5Live){
			return;
		}
	
		/**
		 * 腾讯视频统一播放器 带有控制栏的HTML5播放器
		 */
	
		function Html5Live(vWidth, vHeight) {
			this.isUseControl = false;
	
			this.config.width = tvp.$.filterXSS(vWidth);
			this.config.height = tvp.$.filterXSS(vHeight);
	
			this.control = null;
			this.$UILayer = null;
	
			var $self = this;
			$.extend(this.protectedFn, {
				onwrite: function() {
					this.control = new tvp.Html5UI($self);
					this.control.feature = this.config.html5LiveUIFeature;
					this.control.init();
					this.$UILayer = this.control.$UILayer;
				}
			});
		};
		Html5Live.fn = Html5Live.prototype = new tvp.Html5LiveTiny();
	
		$.extend(Html5Live.prototype, {
			createVideoHtml: function() {
				var videoTagHtml = tvp.Html5LiveTiny.prototype.createVideoHtml.call(this), // 调用父类的方法
					html = tvp.html5skin.getHtml(this.config);
				return html.replace("$VIDEO$", videoTagHtml);
			},
			getPlayerType: function() {
				return "html5live";
			}
		});
	
		// extends Html5Live to tvp namespace
		tvp.Html5Live = Html5Live;
	
	})(tvp, tvp.$);
	;
	(function($) {
	
	  //微信5.0以下的版本自带tap事件
	  if (($.browser.WeChat && $.browser.getNumVersion() < 5) || ($.os.windows && $.browser.ie) || $.isFunction($.fn["tap"])) {
	    return;
	  }
	
	  var touch = {},
	    touchTimeout, tapTimeout, swipeTimeout,
	    longTapDelay = 750,
	    longTapTimeout;
	
	  function parentIfText(node) {
	    return 'tagName' in node ? node : node.parentNode;
	  }
	
	  function swipeDirection(x1, x2, y1, y2) {
	    var xDelta = Math.abs(x1 - x2),
	      yDelta = Math.abs(y1 - y2);
	    return xDelta >= yDelta ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down');
	  }
	
	  function longTap() {
	    longTapTimeout = null;
	    if (touch.last) {
	      touch.el.trigger('longTap');
	      touch = {};
	    }
	  }
	
	  function cancelLongTap() {
	    if (longTapTimeout) clearTimeout(longTapTimeout);
	    longTapTimeout = null;
	  }
	
	  function cancelAll() {
	    if (touchTimeout) clearTimeout(touchTimeout);
	    if (tapTimeout) clearTimeout(tapTimeout);
	    if (swipeTimeout) clearTimeout(swipeTimeout);
	    if (longTapTimeout) clearTimeout(longTapTimeout);
	    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null,
	    touch = {};
	  }
	
	  $(document).ready(function() {
	    var now, delta;
	
	    $(document.body)
	      .bind('touchstart', function(e) {
	      if(e.originalEvent)e=e.originalEvent;
	      now = Date.now(),
	      delta = now - (touch.last || now);
	      touch.el = $(parentIfText(e.touches[0].target));
	      touchTimeout && clearTimeout(touchTimeout);
	      touch.x1 = e.touches[0].pageX;
	      touch.y1 = e.touches[0].pageY;
	      if (delta > 0 && delta <= 250) touch.isDoubleTap = true;
	      touch.last = now;
	      longTapTimeout = setTimeout(longTap, longTapDelay);
	    })
	      .bind('touchmove', function(e) {
	         if(e.originalEvent)e=e.originalEvent;
	      cancelLongTap();
	      touch.x2 = e.touches[0].pageX;
	      touch.y2 = e.touches[0].pageY;
	      // if (Math.abs(touch.x1 - touch.x2) > 10)
	      //   e.preventDefault()
	    })
	      .bind('touchend', function(e) {
	         if(e.originalEvent)e=e.originalEvent;
	      cancelLongTap();
	
	      // swipe
	      if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) || (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))
	
	        swipeTimeout = setTimeout(function() {
	         if (!touch.el || typeof touch.el.trigger != "function") {return;}
	          touch.el.trigger('swipe');
	          touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)));
	          touch = {}
	        }, 0);
	
	      // normal tap
	      else if ('last' in touch)
	
	      // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
	      // ('tap' fires before 'scroll')
	        tapTimeout = setTimeout(function() {
	          if (!touch.el || typeof touch.el.trigger != "function") {return;}
	          // trigger universal 'tap' with the option to cancelTouch()
	          // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
	          var event = $.Event('tap');
	          event.cancelTouch = cancelAll;
	          touch.el.trigger(event);
	
	          // trigger double tap immediately
	          if (touch.isDoubleTap) {
	            touch.el.trigger('doubleTap');
	            touch = {};
	          }
	
	          // trigger single tap after 250ms of inactivity
	          else {
	            touchTimeout = setTimeout(function() {
	              touchTimeout = null;
	              if ( !! touch.el) touch.el.trigger('singleTap');
	              touch = {};
	            }, 250)
	          }
	
	        }, 0)
	
	    })
	      .bind('touchcancel', function(){
	        // swipe
	        if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) || (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30)){
	            try{
	                swipeTimeout = setTimeout(function() {
	                 if (!touch.el || typeof touch.el.trigger != "function") {return;}
	                  touch.el.trigger('swipe');
	                  touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)));
	                  touch = {}
	                }, 0);
	            }
	            catch(e){
	              cancelAll();
	            }
	        }
	        else {
	          cancelAll();
	        }
	      });
	
	    $(window).bind('scroll', cancelAll);
	  })
	
	  ;
	  ['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(m) {
	    $.fn[m] = function(callback) {
	      return this.bind(m, callback);
	    }
	  });
	})(tvp.$)
	;
	(function($) {
		$.extend(tvp.html5skin, {
			html: (function() {
				return [
					'<div class="tvp_container tvp_controls_hide">',
					'	<% if(!!feature.title) {%>',
					// 标题 开始 
					'		<div class="tvp_titles">',
					'			<strong class="tvp_title"><span></span></strong>',
					//'			<div class="tvp_button tvp_button_back">',
					//'				<button type="button" title="返回"><span class="tvp_btn_value">返回</span></button>',
					//'			</div>',
					'		</div>',
					// 标题 结束 
					'	<% } %>',
					'	<div class="tvp_video">', '$VIDEO$', '</div>',
					// '	<% if(!!feature.logo) {%>',
					// // logo 开始 
					// '	<div class="tvp_logo">',
					// '			<a class="tvp_logo_btn"></a>',
					// '	</div>',
					// // logo 结束 
					// '	<% } %>',
					// 控制栏开始 
					'	<% if(!!feature.controlbar) {%>',
					'	<div class="tvp_controls">',
	
					// 进度条开始 
					'		<% if(!!feature.progress) {%>',
					'		<div class="tvp_time_rail">',
					'			<% if(!!feature.timepanel) {%>',
					'			<span class="tvp_time_panel_current">00:00</span>',
					'			<% } %>',
					'			<span class="tvp_time_total" >',
					'				<span class="tvp_time_loaded" ></span>',
					'				<span class="tvp_time_current"><span class="tvp_time_handle"></span></span>',
					'			</span>',
					'			<% if(!!feature.timepanel) {%>',
					'			<span class="tvp_time_panel_total">00:00</span>',
					'			<% } %>',
					'		</div>',
					'		<% } %>',
					// 进度条结束 
					// 提示信息 
					'		<span class="tvp_time_handel_hint" style="display:none"></span>',
					// 播放暂停开始 
					'		<% if(!!feature.playpause) {%>',
					'		<div class="tvp_button tvp_playpause_button tvp_play">',
					'			<button type="button" title="播放/暂停"><span class="tvp_btn_value">播放</span></button>',
					'		</div>',
					'		<% } %>',
					// 播放暂停结束 
					// 下载App文字提示开始
					'		<% if(!!feature.promotion) {%>',
					'		<div class="tvp_promotion" style="display:none;">',
					'			<a href="https://itunes.apple.com/cn/app/id407925512?mt=8" target="_blank">安装腾讯视频iPad客户端 &gt;&gt;</a>',
					'		</div>',
					'		<% } %>',
					// 下载App文字提示结束
					'		<% if(!!feature.fullscreen) {%>',
					'		<div class="tvp_button tvp_fullscreen_button tvp_fullscreen">',
					'			<button type="button" title="切换全屏"><span class="tvp_btn_value">全屏</span></button>',
					'		</div>',
					'		<% } %>',
					// 清晰度选择 开始 
					'		<% if(!!feature.definition) {%>',
					'		<div class="tvp_button tvp_definition _tvp_definition_" style="display:none">',
					'			<div class="tvp_definition_button"><span>清晰度</span></div>',
					'			<div class="tvp_definition_list"></div>',
					'		</div>',
					'		<% } %>',
					// 清晰度选择 结束 
					// 字幕选择 开始 
					'		<% if(!!feature.track) {%>',
					// '		<div class="tvp_button tvp_definition _tvp_track_" style="display:none">',
					// '			<div class="tvp_definition_button"><span>字幕</span></div>',
					// '			<div class="tvp_definition_list"></div>',
					// '		</div>',
					'		<% } %>',
					// 清晰度选择 结束 
					'	</div>',
					'	<% } %>',
					// 控制栏结束
	
					'	<% if(!!feature.overlay) {%>',
					// loading图标 开始 
					'	<div class="tvp_overlay_loading tvp_none" style="z-index:5">',
					'		<span class="tvp_icon_loading"></span>',
					'	</div>',
					// loading图标 结束 
	
					// 播放大按钮 开始   
					'	<div class="tvp_overlay_play">',
					'		<span class="tvp_button_play"></span>',
					'	</div>',
					// 播放大按钮 结束   
					'	<% } %>',
	
					'	<% if(!!feature.meta) {%>',
					// meta 开始 
					'	<div class="tvp_meta_info">',
					'		<span class="tvp_meta_duration"></span>',
					'		<span class="tvp_meta_length"></span>',
					'	</div>',
					// meta 结束 
					'	<% } %>',				
	
					'	<% if(!!feature.bigben) {%>',
					'	<div class="tvp_overlay_bigben">',
					'		<div class="tvp_overlay_content">',
					'			<i class="tvp_ico_ff_rw tvp_ico_ff"></i><span class="tvp_text tvp_overlay_bigben_text">0:03:12</span>',
					'			<span class="tvp_time_total_small"><span class="tvp_time_current_small"></span></span>',
					'		</div>',
					'	</div>',
					'	<% } %>',
	
					'	<% if(!!feature.posterlayer) {%>',
					'	<div class="tvp_overlay_poster" style="display:none;">',
					'		<img class="tvp_poster_img"/>',
					'	</div>',
					'	<% } %>',
	
					// 功能性提示 开始 
					'	<% if(!!feature.tips) {%>',
					'	<div class="tvp_overlay_tips tvp_none">',
					'		<div class="tvp_overlay_content">',
					'			<span class="tvp_text"></span> ',
					'		</div>',
					'	</div>',
					'	<% } %>',
					// 功能性提示 结束
					
					//loading广告开始
					'	<% if(!!feature.loadingAd) {%>',
					'	<div class="tvp_shadow"></div>',
					'	<div class="tvp_ads" style="display:none;">',
					'		<div class="tvp_ads_inner" style="width:100%;height:100%;">',
					'			<div class="tvp_ads_content"><a href="javascript:;" class="tvp_ads_link"></a></div>',
					'			<div class="tvp_ads_control tvp_none">',
					'				<a href="javascript:;" class="tvp_ads_skip tvp_none">',
					'					<span class="tvp_ads_countdown"></span>',
					'					<span class="tvp_ads_skip_text">跳过广告</span>',
					'				</a>',
					'				<div class="tvp_ads_qqvip_skip tvp_none">',
					'					<span class="tvp_ads_remain">【剩余 <span class="_remain"></span> 则广告】</span>',
					'					<span class="tvp_ads_desc">',
					'						您是尊贵的<span class="_vipname">QQ会员</span> <span class="_remaintime"><em class="tvp_ads_num"></em>秒后</span>可',
					'						<a href="javascript:;" class="tvp_ads_skip_text">跳过此广告</a>',
					'					</span>',
					'				</div>',
					'			</div>',
					'			<a href="javascript:;" class="tvp_btn_ads_more tvp_none">',
					'				详情点击 <i class="tvp_icon_arrow"></i>',
					'			</a>',
					'			<div class="tvp_ads_copyright tvp_none">',
					'				<div class="tvp_ads_text">应版权方的要求，好莱坞会员无法免除该部电视剧的广告，请您谅解！</div>',
					'				<div class="tvp_ads_btn">我知道了！</div>',
					'				<span class="tvp_btn_close">✕</span>',
					'			</div>',
					'		</div>',
					'	</div>',
					'	<% } %>',
				   //loading广告结束
					'</div>'].join("");
			})(),
			definitionList: (function() {
				return [
					'<ul>',
					'	<% for(var p in data.list) { %><% if(data.curv!=p){ %>',
					'	<li data-fmt="<%=p%>">',
					'		<span><%=data.list[p]%></span>',
					'	</li>',
					'	<% } }%>',
					'</ul>'].join("");
			})(),
			/**
			 * 不支持svg时需要添加的classname
			 * @type {String}
			 */
			noSVGClassName: "tvp_no_svg",
	
			/**
			 * DOM元素集合
			 * @type {Object}
			 */
			elements: {
				title: {
					main: ".tvp_titles",
					text: ".tvp_title span"
				},
				// logo: {
				// 	main: ".tvp_logo",
				// 	btn: ".tvp_logo_btn"
				// },
				/**
				 * 默认初始显示的时长及文件大小信息
				 */
				meta :{
					main:".tvp_meta_info",
					duration:".tvp_meta_duration",
					filesize:".tvp_meta_length"
				},		
				/**
				 * 播放器UI最外层容器
				 * @type {String}
				 */
				layer: ".tvp_container",
				/**
				 * 播放器控制栏
				 * @type {String}
				 */
				control: ".tvp_controls",
				/**
				 * 播放暂停按钮
				 * @type {String}
				 */
				play: ".tvp_playpause_button",
				/**
				 * 遮罩层
				 * @type {Object}
				 */
				overlay: {
					/**
					 * 播放按钮
					 * @type {String}
					 */
					play: ".tvp_overlay_play",
					/**
					 * 加载中按钮
					 * @type {String}
					 */
					loading: ".tvp_overlay_loading"
				},
				/**
				 * 进度条
				 * @type {Object}
				 */
				progress: {
					main: ".tvp_time_rail",
					cur: ".tvp_time_current",
					loaded: ".tvp_time_loaded",
					total: ".tvp_time_total",
					handle: ".tvp_time_handle",
					tips: ".tvp_time_float"
				},
				fullscreen: ".tvp_fullscreen_button",
				timePanel: {
					cur: ".tvp_time_panel_current",
					total: ".tvp_time_panel_total"
				},
				bigben: {
					main: ".tvp_overlay_bigben",
					desc: ".tvp_overlay_bigben_text",
					ffrw: ".tvp_ico_ff_rw",
					bar: ".tvp_time_current_small"
				},
				/**
				 * 清晰度
				 * @type {Object}
				 */
				definition: {
					/**
					 * 主面板
					 * @type {String}
					 */
					main: "._tvp_definition_",
					/**
					 * 控制栏上展示清晰度的按钮
					 * @type {String}
					 */
					button: "._tvp_definition_ .tvp_definition_button > span",
					/**
					 * 选择清晰度的列表
					 * @type {String}
					 */
					list: "._tvp_definition_ .tvp_definition_list"
				},
				track: {
					/**
					 * 主面板
					 * @type {String}
					 */
					main: "._tvp_track_",
					/**
					 * 控制栏上展示清晰度的按钮
					 * @type {String}
					 */
					button: "._tvp_track_ .tvp_definition_button > span",
					/**
					 * 选择清晰度的列表
					 * @type {String}
					 */
					list: "._tvp_track_ .tvp_definition_list"
				},
				/**
				 * 封面图图层
				 * @type {Object}
				 */
				posterlayer: {
					/**
					 * 主面板
					 * @type {String}
					 */
					main: ".tvp_overlay_poster",
					/**
					 * 图片img元素
					 * @type {String}
					 */
					img: ".tvp_poster_img"
				},
				/**
				 * 功能性tips
				 * @type {Object}
				 */
				tips: {
					/**
					 * 面板div
					 * @type {String}
					 */
					main: ".tvp_overlay_tips",
					/**
					 * 文案显示区域
					 * @type {String}
					 */
					desc: " .tvp_overlay_tips .tvp_text"
				},
				/**
				 * 下载App文字提示
				 * @type {Object}
				 */
				promotion: {
					/**
					 * 主面板div
					 * @type {String}
					 */
					main: ".tvp_promotion",
					/**
					 * 链接
					 * @type {String}
					 */
					link: ".tvp_promotion >a"
				},
				/**
				 * loading广告
				 * @type {Object}
				 */
				loadingAd : {
					/**
					 * 主面板div
					 * @type {String}
					 */
					main : ".tvp_ads",
					/**
					 * 控制跳过广告和倒计时容器
					 * @type {String}
					 */
					control : ".tvp_ads_control",
					/**
					 * 倒计时容器
					 * @type {String}
					 */
					countdown : ".tvp_ads_countdown",
					/**
					 * 跳过广告按钮
					 * @type {String}
					 */
					skip : ".tvp_ads_skip",
					/**
					 * QQ会员去广告模块
					 */
					qqVipSkip : ".tvp_ads_qqvip_skip",
					/**
					 * 广告详情链接
					 * @type {String}
					 */
					more : ".tvp_btn_ads_more",
					/**
					 * 广告遮罩链接
					 * @type {String}
					 */
					adLink : ".tvp_ads_link",
					/**
					 * 版权方要求不能去广告提示
					 * @type {String}
					 */
					copyrightTips : ".tvp_ads_copyright"
				}
			},
			/**
			 * 获取播放器HTML字符串
			 * @param  {object} cfg 配置项
			 * @return {String}     返回得到的播放器HTML字符串
			 */
			getHtml: function(cfg) {
				var render = tvp.$.tmpl(tvp.html5skin.html),
					featureData = {};
				tvp.$.each(cfg.type == tvp.PLAYER_DEFINE.LIVE ? cfg.html5LiveUIFeature : cfg.html5VodUIFeature, function(i, v) {
					featureData[v] = true;
				});
				tvp.$.each(cfg.html5ForbiddenUIFeature, function(i, v) {
					featureData[v] = false;
				});
				return render({
					"feature": featureData
				});
			}
		})
	})(tvp.$);
	/**
	 * @fileOverview 腾讯视频统一播放器 HTML5播放器 控制栏
	 *
	 */
	
	;
	(function(tvp, $) {
		var $me;
		/**
		 * HTML5播放器控制栏
		 */
		tvp.Html5UI = function(player) {
			this.player = player;
			this.videoTag = player.getPlayer();
			this.$video = player.$video;
			this.$mod = player.$mod;
			this.$UILayer = null;
			this.$control = null;
			this.feature = player.config.html5VodUIFeature;
			$me = this;
	
			this.elements = {}
			this.constvars = {
				progressWidth: 0
			}
		}
	
		tvp.Html5UI.fn = tvp.Html5UI.prototype = {
			getCurVideo: function() {
				return this.player.getCurVideo();
			},
			init: function() {
				this.initDom();
				this.controlReady();
			},
	
			initDom: function() {
				this.$UILayer = this.$mod.find(tvp.html5skin.elements.layer);
				this.$control = this.$UILayer.find(tvp.html5skin.elements.control);
				if(this.player.config.width == '100%' && this.player.config.height == '100%'){
					this.$UILayer.addClass('tvp_fullscreen_mode');
				}
			},
			controlReady: function() {
				var t = this;
	
				function invoke(v) {
					try {
						var evtName = "build" + v;
						if ($.isFunction(t[evtName])) {
							t[evtName](t.player, t.$video, t.$control, t.$UILayer);
						}
					} catch (err) {}
				}
	
				$.each(this.feature, function(i, v) {
					if (!t.player.isForbiddenH5UIFeature(v)) {
						if (v in t.player.config.html5FeatureExtJS) {
							$.ajax({
								url: t.player.config.html5FeatureExtJS[v] + "?v=" + new Date().valueOf(),
								dataType: "script",
								success: function() {
									invoke(v);
								}
							});
						} else {
							invoke(v);
						}
					}
				});
	
				//如果使用了自定义的控制栏，才有后面的这些点击操作隐藏控制栏或者展现控制栏
				if (this.player.isUseH5UIFeature("controlbar")) {
	
					//如果不是设置为永远显示控制栏，就要做自动化隐藏逻辑
					if (!this.player.config.isHtml5ControlAlwaysShow) {
						this.$video.on(t.getClickName(), function(e) {
							//没播放时就不显示控制栏了
							if (t.isHidden() && (t.videoTag.currentTime || t.overlayPlayClicked)) {
								t.show();
								t.beginHide(5e3);; //显示了控制栏以后倒计时8秒，8秒内啥都不做，直接关闭，除非点击了其他控制区域
							} else {
								t.hide();
							}
							e.preventDefault();
							e.stopPropagation();
						});
	
						// this.$UILayer.on("touchstart", function(e) {
						// 	var evt = !! e.originalEvent ? e.originalEvent : e;
						// 	if (evt.srcElement.tagName == "VIDEO") {
						// 		return;
						// 	}
						// 	t.stopHide();
						// }).on("touchend", function(e) {
						// 	var evt = !! e.originalEvent ? e.originalEvent : e;
						// 	if (evt.srcElement.tagName == "VIDEO") {
						// 		return;
						// 	}
						// 	t.beginHide();
						// });
	
						this.hideControlTimer = 0;
						this.$video.on("play", function() { //开始播放时倒计时隐藏控制栏
							t.beginHide(3e3);
						}).on("pause paused", function() {
							//t.show();
							t.beginHide(8e3);
						}).one("timeupdate",function(){
							// 开始播放显示控制栏，逻辑去掉
							// zoborzhang
							// t.show();
							// t.beginHide(3e3);
						})
					}
				}
			},
			beginHide: function(time) {
				var t = this;
				time = time || 5e3;
				this.stopHide();
				this.hideControlTimer = setTimeout(function() {
					t.hide();
				}, time);
	
			},
			stopHide: function() {
				if (this.hideControlTimer) {
					clearTimeout(this.hideControlTimer);
					this.hideControlTimer = 0;
				}
			},
			hide: function() {
				this.$UILayer.addClass("tvp_controls_hide");
				this.$control.trigger("tvp:control:hide");
			},
			show: function() {
				if(this.$video.data("data-playing-loadingad") == 1){
					this.hide();
					return;
				}
				if (this.hideControlTimer) {
					clearTimeout(this.hideControlTimer);
					this.hideControlTimer = 0;
				}
	
				this.$UILayer.removeClass("tvp_controls_hide");
				this.$control.trigger("tvp:control:show");
			},
			isHidden: function() {
				return this.$UILayer.hasClass("tvp_controls_hide");
			},
			/**
			 * 获取总时长
			 * @return {[type]} [description]
			 */
			getDuration: function() {
				return this.player.getDuration();
			},
			/**
			 * 按钮点击事件名称
			 * @return {[type]} [description]
			 */
			getClickName: function() {
				return $.os.hasTouch ? "touchend" : "click";
			}
		}
	
	})(tvp, tvp.$);
	/**
	 * @fileoverview 腾讯视频统一播放器H5内核遮罩插件
	 *
	 */
	
	(function(tvp, $) {
	
		/**
		 * 扩展内核遮罩插件
		 * @param  {tvp.Player} player    tvp.Player实例
		 * @param  {$("video")} $video     video标签$查询结果
		 * @param  {$("control")} $control   控制栏标签$查询结果
		 * @param  {$("container")} $UILayer UI容器$查询结果
		 */
		$.extend(tvp.Html5UI.fn, {
			buildoverlay: function(player, $video, $control, $UILayer) {
	
				var videoTag = $video[0], // 
					$elements = {},
					$overlay = {},
					t = this,
					n = "tvp_none",
					playtimer = null,
					isHidePlayOnInit = (($.os.iphone || $.os.ipod) && $.os.version >= "6"),
					isShowingDurationLimit = false,
					isClicked = false;
	
				$.each(tvp.html5skin.elements.overlay, function(k, v) {
					$elements[k] = $UILayer.find(v);
				});
	
	
				// $elements.loading.hide();
				$elements.loading.addClass(n);
	
				function showloading() {
					clearTimeout(playtimer);
					//tvp.log("[buildoverlay][showloading]:" + e.type);
					$elements.loading.removeClass(n);
					// $elements.loading.show();
					$elements.play.hide();
				}
	
				function showplay() {
					if(isShowingDurationLimit){
						return ;
					}
					playtimer = setTimeout(function() {
						//tvp.log("[buildoverlay][showplay]:" + e.type);
						$elements.loading.addClass(n);
						// $elements.loading.hide();
						$elements.play.show();
					}, 500); //为什么是500毫秒？因为有个定时器每500毫秒判断一次当前视频是否正常开始播放
				}
	
				function hideoverlay() {
					clearTimeout(playtimer);
					// $elements.loading.hide();
					$elements.loading.addClass(n);
					$elements.play.hide();
				}
	
				$video
					.on("playing seeked", hideoverlay)
					.on("pause paused", function() {
						if (!player.config.isHtml5ShowPlayBtnOnPause || !! t.isTouching || !! (player.isGetingInfo && !player.isPlayingLoadingAd()) || !! player.isDefinitionSwitching) {
							return;
						}
						showplay();
					})
					.on("seeking waiting", showloading);
	
				var _pfn = function(e) {
					if (window.DEBUG) tvp.log("_pfn:" + e.type);
					$elements.play.off(e.type == "click" ? "touchend" : "click", _pfn);
					$video.trigger("tvp:h5ui:playbtn:click");
					//如果没点过
					if (!isClicked) {
						isClicked = true;
						t.overlayPlayClicked = true;
						//如果还没开始播
						if(!videoTag.currentTime){
							videoTag.load();
						}	
					}
					videoTag.play();
				};
				//有些浏览器不支持tap，有些又click无效
				$elements.play.on("click", _pfn);
				$elements.play.on("touchend", _pfn);
				//如果当前有显示限播提示就不出现播放按钮
				player.on('tvp.durationlimit.show',function(){
					hideoverlay();
					isShowingDurationLimit = true;
				}).on('tvp.durationlimit.hide',function(){
					isShowingDurationLimit = false;
				});
			}
		});
	})(tvp, tvp.$);
	/**
	 * @fileoverview 腾讯视频统一播放器H5内核 功能性tips
	 *
	 */
	
	;
	(function(tvp, $) {
	
		// 扩展UI的功能性TIPS提醒
		$.extend(tvp.Html5UI.fn, {
			/**
			 * 建立shadow插件创建入口
			 * @param  {tvp.Player} player    tvp.Player实例
			 * @param  {$("video")} $video     video标签$查询结果
			 * @param  {$("control")} $control   控制栏标签$查询结果
			 * @param  {$("container")} $UILayer UI容器$查询结果
			 */
			buildtips: function(player, $video, $control, $UILayer) {
				var $elements = {}, t = this;
	
				$.each(tvp.html5skin.elements.tips, function(k, v) {
					$elements[k] = $UILayer.find(v);
				});
	
				function showTips(msg, hideTime) {
					if ($.isUndefined(hideTime)) {
						hideTime = 5;
					}
					$elements.main.addClass("tvp_show");
					$elements.desc.text(msg);
	
					if (hideTime != 0) {
						setTimeout(function() {
							$elements.main.removeClass("tvp_show");
							$elements.desc.text("");
						}, hideTime * 1000);
					}
				}
	
				/**
				 * 扩展showTips
				 */
				$.extend(tvp.Html5Player.fn, {
					"showTips": showTips
				})
			}
	
		});
	})(tvp, tvp.$);
	/**
	 * @fileoverview 腾讯视频统一播放器 H5内核 腾讯视频logo
	 */
	
	;
	(function(tvp, $) {
		/**
		 * 建立HTML5播放器视频标题显示面板
		 * @param  {tvp.Player} player    tvp.Player实例
		 * @param  {$("video")} $video     video标签$查询结果
		 * @param  {$("control")} $control   控制栏标签$查询结果
		 * @param  {$("container")} $UILayer UI容器$查询结果
		 */
		$.extend(tvp.Html5UI.fn, {
			buildtitle: function(player, $video, $control, $UILayer) {
				var $elements = {}, t = this;
	
				$.each(tvp.html5skin.elements.title, function(k, v) {
					$elements[k] = $UILayer.find(v);
				});
	
				$video.on("tvp:video:ajaxsuc", function() {
					$elements.text.text(player.curVideo.getTitle());
				});
			}
		});
	})(tvp, tvp.$);
	/**
	 * @fileoverview 腾讯视频统一播放器 H5内核 腾讯视频logo
	 */
	
	;
	(function(tvp, $) {
		// extends control any feature ...
		$.extend(tvp.Html5UI.fn, {
			    buildmeta : function(player, $video, $control, $UILayer) {
					var $elements = {}, t = this,
						videoTag = $video[0];
	
					$.each(tvp.html5skin.elements.meta, function(k, v) {
						$elements[k] = $UILayer.find(v);
					});
	
					//暂不开放显示
					$elements.main.hide();
					
					if (!$.isUndefined($elements.main) && $elements.main.length != 0) {
						$video.on("durationchange tvp:video:src", function(e) {
							$elements.duration.text($.formatSecondsWithText(player.getDuration()));
							$elements.filesize.text($.formatFileSize(player.getFileSize()));
						})
	
						$video.on('play playing',function(){
							$elements.main.hide();
						});
					}			   	
			    }
		    });
	})(tvp, tvp.$);
	/**
	 * @fileoverview 腾讯视频统一播放器H5播放暂停按钮
	 *
	 */
	
	(function(tvp, $) {
	
		$.extend(tvp.Html5UI.fn, {
			/**
			 * 扩展播放暂停按钮
			 * @param  {tvp.Player} player    tvp.Player实例
			 * @param  {$("video")} $video     video标签$查询结果
			 * @param  {$("control")} $control   控制栏标签$查询结果
			 * @param  {$("container")} $UILayer UI容器$查询结果
			 */
			buildplaypause: function(player, $video, $control, $UILayer) {
	
				var $playBtn = $UILayer.find(tvp.html5skin.elements.play),
					videoTag = $video[0],
					t = this,
					isClick = false;
	
				$playBtn.on($.os.hasTouch ? "touchend" : "click", function(e) {
					if (videoTag.paused) {
						//如果没点过
						if (!isClick) {
							isClick = true;
							//如果还没开始播
							if(!videoTag.currentTime){
								videoTag.load();
							}
						}					
						videoTag.play();
					} else {
						videoTag.pause();
					}
				});
				$video.on("paused pause", function() {
					//如果当前是正在拖动控制栏，也会触发pause，但事实上这个时候不需要把播放按钮置为暂停状态
					if ( !! t.isTouching) {
						return;
					}
					$playBtn.addClass("tvp_play").removeClass("tvp_pause");
				}).on("play playing", function() {
					$playBtn.addClass("tvp_pause").removeClass("tvp_play");
				})
	
			}
		});
	})(tvp, tvp.$);
	/**
	 * @fileOverview HTML5播放器时间显示面板
	 */
	;
	(function(tvp, $) {
		$.extend(tvp.Html5UI.fn, {
			/**
			 * 建立HTML5播放器时间显示面板
			 * @param  {tvp.Player} player    tvp.Player实例
			 * @param  {$("video")} $video     video标签$查询结果
			 * @param  {$("control")} $control   控制栏标签$查询结果
			 * @param  {$("container")} $UILayer UI容器$查询结果
			 */
			buildtimepanel: function(player, $video, $control, $UILayer) {
				var $elements = {}, t = this;
				$.each(tvp.html5skin.elements.timePanel, function(k, v) {
					$elements[k] = $control.find(v);
				});
	
				if (!$.isUndefined($elements.total) && $elements.total.length != 0) {
					$video.on("durationchange tvp:video:src", function(e) {
						$elements.total.text($.formatSeconds(player.getDuration()));
					})
				}
	
				if (!$.isUndefined($elements.cur) && $elements.cur.length != 0) {
					$video.on("timeupdate", function() {
						$elements.cur.text($.formatSeconds(this.currentTime));
					}).on("tvp:player:videochange", function() {
						$elements.cur.text($.formatSeconds(0));
					});
				}
	
				$control.bind("tvp:progress:touchstart", function(e, data) {
					$elements.cur.text($.formatSeconds(data.time));
				})
	
			}
		});
	})(tvp, tvp.$);
	/**
	 * @fileoverview 腾讯视频统一播放器H5内核控制栏上的进度条
	 *
	 */
	
	(function(tvp, $) {
	
		/**
		 * 扩展控制栏进度条
		 * @param  {tvp.Player} player    tvp.Player实例
		 * @param  {$("video")} $video     video标签$查询结果
		 * @param  {$("control")} $control   控制栏标签$查询结果
		 * @param  {$("container")} $UILayer UI容器$查询结果
		 */
		 // 计算旋转后的进度条，蛋碎了
		$.extend(tvp.Html5UI.fn, {
			buildprogress: function(player, $video, $control, $UILayer) {
	
				var t = this,
					videoTag = $video[0],
					$elements = {},
					mouseIsDown = false;
				this.isTouching = false;
	
				$.each(tvp.html5skin.elements.progress, function(k, v) {
					$elements[k] = $control.find(v);
				});
	
				/**
				 * handleMove  处理鼠标或者手势移动
				 *
				 * @ignore
				 * @param  {[TouchEvent]} touchEvent 触摸事件
				 * @return {[type]}            [description]
				 */
	
				function handleMove(touchEvent) {
					if (!player.getDuration()) return null;
					var x,
						// 记录点击左边的相对偏移量
						offset,
						// 点击位置的百分比
						precent = 0,
						// 最后算出的期望拖拽到的时间点
						expectTime = 0,
						pos = 0;
	
					// 伪全屏时候旋转的情况
					if(t.isRotate){
						x = touchEvent.pageY;
						offset = $elements.total.offset().top;
						progressWidth = $elements.total.height();
					}else{
						x = touchEvent.pageX;
						offset = $elements.total.offset().left;
						progressWidth = $elements.total.width();
					}
	
					if (x < offset) {
						x = offset;
					} else if (x > progressWidth + offset) {
						x = progressWidth + offset;
					}
					pos = x - offset;
	
					precent = pos / progressWidth;
					expectTime = player.getDuration() * precent;
					var data = {
						"pos": pos,
						"precent": precent,
						"time": expectTime
					}
					$control.trigger("tvp:progress:touchstart", data);
					return data;
				}
	
				function iosProcessHandler(){
					var totalWidth, x1, x2, x3, curWidth, toWidth,
						progressWidth;
					$control.find('.tvp_time_rail').on('touchstart', function(e){
						if( !(e && e.touches && e.touches.length)){
							return;
						}
						var evt = e.touches[0];
						if(t.isRotate){
							x1 = evt.pageY;
							curWidth = $elements.cur.height();
						}else{
							x1 = evt.pageX;
							curWidth = $elements.cur.width();
						}
						player.isDefinitionSwitching = false;
						t.isTouching = true;
						videoTag.pause();
						e.preventDefault();
					}).on('touchmove', function(e){
						if( !(e && e.touches && e.touches.length)){
							return;
						}
						var evt = e.touches[0], per, toTime;
						if(t.isRotate){
							x2 = evt.pageY;
						}else{
							x2 = evt.pageX;
						}
						x3 = x2 - x1;
						toWidth = curWidth + x3;
						if(t.isRotate){
							progressWidth = $elements.total.height();
						}else{
							progressWidth = $elements.total.width();
						}
						// 判断进度条的左右边界
						toWidth = (toWidth>progressWidth) ? progressWidth :(
								(toWidth < 0) ? 0 : toWidth
						);
						per = toWidth / progressWidth;
						toTime = player.getDuration() * per;
						toTime = isNaN(toTime)? 0 : toTime;
						t.setProgress(toWidth, $elements);
						$control.trigger("tvp:progress:touchstart", {
							"pos": toWidth,
							"precent": per,
							"time": toTime
						});
						e.preventDefault();
					}).on('touchend', function(e){
						if( !t.isTouching ){
							return;
						}
						if(t.isRotate){
							progressWidth = $elements.total.height();
						}else{
							progressWidth = $elements.total.width();
						}
						var per = toWidth / progressWidth;
						var toTime = player.getDuration() * per;
						player.seek(toTime);
						$control.trigger("tvp:progress:touchend");
						t.isTouching = false;
						e.preventDefault();
						e.stopPropagation();
					});
				}
				// if($.os.ios){
					iosProcessHandler();
				// }
	
				// $elements.total.bind("touchstart", function(e) {
				// 	e = !! e.originalEvent ? e.originalEvent : e;
				// 	if (e.targetTouches.length != 1 
				// 		|| t.isTouching
				// 		|| t.isRotate) return;
				// 	t.isTouching = true;
				// 	e.preventDefault();
				// 	videoTag.pause();
				// 	var d = handleMove(e.targetTouches[0]); !! d && (t.setProgress(d.pos, $elements));
				// 	player.isDefinitionSwitching = false;
	
				// 	$elements.total.bind("touchmove", function(e) {
				// 		e = !! e.originalEvent ? e.originalEvent : e;
				// 		if (e.targetTouches.length != 1 || t.isRotate) return;
				// 		var d = handleMove(e.targetTouches[0]); !! d && (t.setProgress(d.pos, $elements));
				// 		e.preventDefault();
	
				// 	}).bind("touchend", function(e) { //看清楚哦，这里写的是one，而不是on哦
				// 		e = !! e.originalEvent ? e.originalEvent : e;
				// 		t.isTouching = false;
				// 		if (e.changedTouches.length != 1 ||t.isRotate) return;
				// 		var d = handleMove(e.changedTouches[0]); !! d && (t.setProgress(d.pos, $elements));
				// 		player.seek(d.time);
				// 		e.preventDefault();
				// 		e.stopPropagation();
				// 		$elements.total.unbind("touchmove");
				// 		$elements.total.unbind("touchend");
				// 		$control.trigger("tvp:progress:touchend");
				// 	});
				// });
	
				$video.bind("timeupdate", function(e) {
					e = !! e.originalEvent ? e.originalEvent : e;
					if (t.isHidden() || !! player.isDefinitionSwitching) return; //隐藏了就不计算了，浪费资源啊
					if (e.target.readyState == 4) {
						var curLeft;
						// 伪全屏时候旋转的情况
						if(t.isRotate){
							curLeft = videoTag.currentTime / player.getDuration() * $elements.total.height();
						}else{
							curLeft = videoTag.currentTime / player.getDuration() * $elements.total.width();
						}
						t.setProgress(curLeft, $elements);
					}
				});
	
				$video.bind("progress", function(e) {
					if (t.isHidden() || !! player.isDefinitionSwitching) return;
					var bufferd = 0,
						curLeft = 0;
					if (videoTag.buffered && videoTag.buffered.length > 0 && videoTag.buffered.end && player.getDuration()) {
						curLeft = videoTag.buffered.end(0) / player.getDuration() * $elements.total.width();
						$elements.loaded.css("width", curLeft);
					}
				}).bind("tvp:video:src", function() {
					if ( !! player.isDefinitionSwitching) return;
					t.resetProgress();
				})
	
				$control.bind("tvp:control:show", function() {
					var curLeft = videoTag.currentTime / player.getDuration() * $elements.total.width();
					t.setProgress(curLeft, $elements);
				});
	
				$.extend(this, {
					resetProgress: function() {
						$elements.cur.css('width', "0px");
						$elements.handle.css('left', "0px");
						$elements.loaded.css("width", "0px");
					}
				});
			},
			/**
			 * 设置进度条
			 * @param {[Number]} curLeft   宽度
			 * @param {Object} $elements DOM元素集合
			 */
			setProgress: function(curLeft, $elements) {
				var progressWidth, // 记录进度条总体宽度
					handlWidth = $elements.handle.width(),
					handlLeft = curLeft - handlWidth / 2;
				progressWidth = $elements.total.height();
				// 伪全屏时候旋转的情况
				if(this.isRotate){
					progressWidth = $elements.total.height()
				}else{
					progressWidth = $elements.total.width()
				}
	
				handlLeft = Math.min(handlLeft, progressWidth - handlWidth);
				handlLeft = Math.max(handlLeft, 0);
	
				$elements.cur.css('width', curLeft + "px");
				$elements.handle.css('left', handlLeft + "px");
			}
		});
	})(tvp, tvp.$);
	;
	(function(tvp, $) {
		var $fullscreen = null,
			scrollTop = 0,
			parentStyle="",
			frameStyle = "",
			fakeStyle = "";
		var calc = {
			calcTimer: null,
			times: 0,
			changeTimes:0
		};
		$.extend(tvp.Html5Player||{}, {
			isFullScreen: false
		});
	
		$.extend(tvp.Html5UI.fn, {
			buildfullscreen: function(player, $video, $control, $UILayer) {
				var videoTag = $video[0],
					t = this;
	
				$fullscreen = $control.find(tvp.html5skin.elements.fullscreen);
	
				//绑定全屏按钮
				$fullscreen.on($.os.hasTouch ? "touchend" : "click", function() {
					//解决android系统全屏后返回暂停出原生皮肤的问题
					if($.os.android && t.player.config.isHtml5UseFakeFullScreen){
						$video.removeClass('tvp_video_with_skin');
					}
					if (t.checkIsFullScreen()) {
						// 暂时用延时来解决击穿问题
						setTimeout(function(){
							t.cancelFullScreen();
						},400);
					} else {
						t.enterFullScreen();
					}
				});
	
				// webkit内核的特性
				if ("onwebkitfullscreenchange" in $UILayer[0]) {
					document.addEventListener("webkitfullscreenchange", function () {
						if(document.webkitIsFullScreen ){
							t.enterFullScreen();						
						}else{
							t.cancelFullScreen();	
						}
					}, false);
				} else {
					//ios独有的特性,但不会触发上述onwebkitfullscreenchange
					//详见 apple官方参考文档 :
					//http://developer.apple.com/library/safari/#documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/ControllingMediaWithJavaScript/ControllingMediaWithJavaScript.html#//apple_ref/doc/uid/TP40009523-CH3-SW1
					$video.bind("webkitendfullscreen ", function() {
						t.cancelFullScreen();
					});
				}
	
				//绑定键盘Esc按钮
				$(document).on("keydown", function(e) {
					if (document.webkitIsFullScreen && e.keyCode == 27) {
						t.cancelFullScreen();
					}
				});
	
				//重写播放器全屏API
				$.extend(tvp.Html5Player.fn, {
					"enterFullScreen": function() {
						t.enterFullScreen();
					},
					"cancelFullScreen": function() {
						t.cancelFullScreen();
					}
				});
	
				// try{
				// 	$(top).on('scroll', function(){
				// 		var st = top.document.body.scrollTop;
				// 		if(st==0){
				// 			return;
				// 		}
				// 		scrollTop = st;
				// 	});
				// }catch(e){}
			},
	
			/**
			 * 处理全屏按钮的样式
			 * @return {[type]} [description]
			 */
			fixClassName:function(enter){
				if(enter){
					$fullscreen.removeClass("tvp_fullscreen").addClass("tvp_unfullscreen");
				}
				else {
					$fullscreen.removeClass("tvp_unfullscreen").addClass("tvp_fullscreen");
				}
			},
			/**
			 * 判断当前是否是全屏
			 * @return {[type]} [description]
			 */
			checkIsFullScreen: function() {
				return $fullscreen.hasClass("tvp_unfullscreen")
			},
			/**
			 * 进入全屏
			 * @return {[type]} [description]
			 */
			enterFullScreen: function() {
				if(this.player.videoTag && this.player.videoTag.currentTime == 0 && $.os.ipad){//ipad没开始播放就先不要进入全屏
					return ;
				}
				if (this.player.config.isHtml5UseFakeFullScreen) {
					// this.enterFakeFullScreen();
					this.allEnterFullScreen();
				} else {
					this.enterRealFullScreen();
				}
				this.player.isFullScreen = true;
				this.player.callCBEvent("onfullscreen", true);
			},
			/**
			 * 取消全屏
			 * @return {[type]} [description]
			 */
			cancelFullScreen: function() {
				if (this.player.config.isHtml5UseFakeFullScreen) {
					// this.cancelFakeFullScreen();
					this.allCancelFullScreen();
				} else {
					this.cancelRealFullScreen();
				}
				this.player.isFullScreen = false;
				this.player.callCBEvent("onfullscreen", false);
			},
			/**
			 * 调用全屏API进入真正的全屏
			 * @return {[type]} [description]
			 */
			enterRealFullScreen: function() {
				var t = this,
					$video = t.$video,
					$fullscreen = this.$control.find(tvp.html5skin.elements.fullscreen);
	
				var videoTag = $video[0];
				if (videoTag.webkitRequestFullScreen) {
					videoTag.webkitRequestFullScreen();
				} else if(videoTag.webkitSupportsFullscreen) {
					//有时候video傻傻不知道已经退出全屏，此时直接调用enterFullscreen无效
					//需先调exit退出，再调enter进入全屏,fix by jarvanxing 2014-07-21
					videoTag.webkitExitFullscreen();
					videoTag.webkitEnterFullscreen();
				}
	
				// if (videoTag.webkitSupportsFullscreen) {
				// 	//有时候video傻傻不知道已经退出全屏，此时直接调用enterFullscreen无效
				// 	//需先调exit退出，再调enter进入全屏,fix by jarvanxing 2014-07-21
				// 	videoTag.webkitExitFullscreen();
				// 	videoTag.webkitEnterFullscreen();
				// } else if() {
				// 	videoTag.webkitRequestFullScreen();
				// }
	
				//android中某些设备(比如三星s3)在iframe下有bug
				//全屏按钮样式不处理
				if(($.browser.WeChat||$.browser.MQQClient) && $.os.android){
	
				}
				else {
					this.fixClassName(1);
				}
				
				//$fullscreen.removeClass("tvp_fullscreen").addClass("tvp_unfullscreen");
			},
			/**
			 * 调用全屏API取消全屏
			 * @return {[type]} [description]
			 */
			cancelRealFullScreen: function() {
				var t = this,
					player = t.player,
					$UILayer = player.$UILayer,
					$video = t.$video,
					$fullscreen = this.$control.find(tvp.html5skin.elements.fullscreen);
	
				this.fixClassName(0);
				//$fullscreen.removeClass("tvp_unfullscreen").addClass("tvp_fullscreen");
				if (document.webkitCancelFullScreen) {
					document.webkitCancelFullScreen();
				}
			},
			/**
			 * 处理iframe伪全屏的情况
			 * @return {[type]} [description]
			 */		
			allCancelFullScreen:function(){
				var fake = this.player.config.isHtml5UseFakeFullScreen,
					isInline = $.os.android 
						|| ($.os.ios 
							&& tvp.$.browser.WeChat
							&& this.player.config.isiPhoneShowPlaysinline );
				// if(fake && window!=top && this.player.config.appid == 10000){
				if(fake && isInline){
					try {
						if(frameElement){
							frameElement.style.cssText = frameStyle;
						}
						this.cancelFakeFullScreen();
					} catch (err) {
						this.player.config.isHtml5UseFakeFullScreen = false;
						this.cancelRealFullScreen();
					}	
				}
				else {
					this.cancelRealFullScreen();
				}
			},
			/**
			 * 处理iframe伪全屏的情况
			 * @return {[type]} [description]
			 */
			allEnterFullScreen:function(){
				var fake = this.player.config.isHtml5UseFakeFullScreen,
					isInline = $.os.android 
						|| ($.os.ios 
							&& tvp.$.browser.WeChat
							&& this.player.config.isiPhoneShowPlaysinline );
				var maxW = top.innerWidth, MaxH = top.innerHeight;
				//iframe页面的伪全屏
				// if(fake && window!=top && this.player.config.appid == 10000){
				if(fake && isInline){
					try {
						if(frameElement){
							frameStyle = frameElement.style.cssText;
							$(frameElement).css({
								'position': 'fixed !important', 
								'left': '0',
								'top': '0',
								'width': maxW+'px !important',
								'height':'100%',
								'z-index': 1000
							});
						}
						this.enterFakeFullScreen();
					} catch (err) {
						this.player.config.isHtml5UseFakeFullScreen = false;
						this.enterRealFullScreen();
					}
				}else {
					this.enterRealFullScreen();
				}			
			},		
			/**
			 * 进入伪全屏
			 */
			enterFakeFullScreen: function() {
				var maxW = top.innerWidth, maxH = top.innerHeight;
				var offsets = Math.ceil((maxH - maxW)/2);
				fakeStyle = this.player.$videomod[0].style.cssText;
				if( false && maxH>maxW){
					this.player.$videomod.css({
						'position': 'fixed !important', 
						'left': 0,
						'top': 0,
						'width': maxH+'px',
						'height': maxW+'px',
						'-webkit-transform':'rotate(90deg) translateX('+offsets+'px) translateY('+offsets+'px)',
						'z-index': 1000
					});
					this.isRotate = true;
				}else{
					this.player.$videomod.css({
						'position': 'fixed !important', 
						'left': 0,
						'top': 0,
						'width': '100%',
						'height': '100%',
						'z-index': 1000
					});
				}
				$(frameElement).css({
					'position': 'fixed !important', 
					'width': maxW+'px !important',
					'height': (maxH+1)+'px !important',
					'top':'-1px',
					'background-color':'#000',
					'left':0
				});
				this.listenOrientationChange();
				try{
					scrollTop = top.document.body.scrollTop;
				}catch(e){}
				$fullscreen.removeClass('tvp_fullscreen');
				$fullscreen.addClass('tvp_unfullscreen');
				this.$UILayer.addClass('tvp_fullscreen_mode');
			},
			/**
			 * 取消伪全屏API
			 * @return {[type]} [description]
			 */
			cancelFakeFullScreen: function() {
				try{
					top.document.body.scrollTop = scrollTop;
				}catch(e){}
				this.player.$videomod[0].style.cssText = fakeStyle;
				$fullscreen.removeClass('tvp_unfullscreen');
				$fullscreen.addClass('tvp_fullscreen');
				this.$UILayer.removeClass('tvp_fullscreen_mode');
				this.isRotate = false;
				this.unbindOritationChange();
			},
	
			/**
			 * 监听屏幕旋转
			 */
			listenOrientationChange: function(){
				var player = this.player;
				var t = this;
				var OrientationChange = function(){
					var maxW = top.innerWidth, maxH = top.innerHeight;
					if(calc.s0 && calc.s1){
						if(Math.abs(top.orientation)===90){
							maxW = calc.s1.width;
							maxH = calc.s1.height;
						}else{
							maxW = calc.s0.width;
							maxH = calc.s0.height;
						}
					}
					if(window!==top){
						$(frameElement).css({
							'position': 'fixed !important', 
							'width': maxW+'px !important',
							'height': maxH+'px !important',
							'top': 0,
							'background-color':'#000',
							'left':0
						});
					}
			    player.$videomod.css({
						'position': 'fixed !important', 
						'width': maxW+'px !important',
						'height': maxH+'px !important',
						'top':0,
						'left':0
					});
					t.isRotate = false;
					// fix Bug
					// 解决伪全屏的白边bug
					top.document.body.scrollTop = scrollTop + 30;
					setTimeout(function(){
						top.document.body.scrollTop = scrollTop - 30;
					},10);
					// 如果有结束推荐，重新计算滚动值
					t.$mod.trigger('tvp:recommend:orientationchange');
				};
				try{
					t.setCalcValue();
					$(top).off('orientationchange.fullscreen')
					.on('orientationchange.fullscreen', function(){
						// ipod 不需要延时
						if($.os.ipod){
							OrientationChange();
							return;
						}
						// 安卓需要延时计算屏幕实际宽高
						if(calc.s0 && calc.s1){
							OrientationChange();
						}else{
							t.androidScreenCalc( OrientationChange );
						}
					});
					$(top.document.body).on('touchmove',function(e){
						e.preventDefault();
					});
					$(document.body).on('touchmove',function(e){
						e.preventDefault();
					});
				}catch(e){}
			},
	
			androidScreenCalc: function(cb){
				var t = this;
				cb = cb || function(){};
				if(calc.times>=2){
					return;
				}
				calc.times += 1;
				calc.calcTimer = setInterval(function(){
					t.setCalcValue();
					if(calc.changeTimes>=1){
						clearInterval(calc.calcTimer);
						calc.calcTimer = null;
						setTimeout(function(){
							t.setCalcValue();
							cb();
						},100);
					}
				},50);
				// 你妹的，iphone必须延时
				if($.os.iphone){
					setTimeout(function(){
						t.setCalcValue();
						cb();
					},100);
				}
				setTimeout(function(){
					calc.calcTimer && clearInterval(calc.calcTimer);
					t.setCalcValue();
					cb();
				},2000);
			},
	
			setCalcValue: function(){
				var s = {
					width: top.innerWidth,
					height: top.innerHeight
				};
				if(Math.abs(top.orientation)===90){
					if(calc.s1 && calc.s1.width!==s.width){
						calc.changeTimes++;
					}
					calc.s1 = s;
				}else{
					if(calc.s0 && calc.s0.width!==s.width){
						calc.changeTimes++;
					}
					calc.s0 = s;
				}
			},
	
			/**
			 * 取消监听屏幕旋转
			 */
			unbindOritationChange: function(){
				try{
					$(top).off('orientationchange');
					$(top.document.body).off('touchmove');
					$(document.body).off('touchmove');
				}catch(e){}
			}
	
			
		});
	})(tvp, tvp.$);
	(function(tvp, $) {
	
		// extends control any feature ...
		$.extend(tvp.Html5UI.fn, {
			buildbigben: function(player, $video, $control, $UILayer) {
	
				var $elements = {}, t = this,
					videoTag = $video[0],
					temp_time = 0; //临时变量，记录上次获取到的时间，用于判断左移右移
	
				$.each(tvp.html5skin.elements.bigben, function(k, v) {
					$elements[k] = $UILayer.find(v);
				});
	
				$control.on("tvp:progress:touchstart", function(e, data) {
					$elements.main.show();
					$elements.desc.text($.formatSeconds(data.time));
					$elements.bar.width(data.time / player.getDuration() * 100 + "%");
					if (data.time < temp_time) {
						$elements.ffrw.addClass("tvp_ico_rw");
					} else {
						$elements.ffrw.removeClass("tvp_ico_rw");
					}
					temp_time = data.time;
				}).on("tvp:progress:touchend", function() {
					$elements.main.hide();
					$elements.desc.text("");
				});
	
			}
		});
	})(tvp, tvp.$);
	;
	(function(tvp, $) {
		$.extend(tvp.Html5UI.fn, {
			/**
			 * 切换清晰度控制按钮
			 * @param  {tvp.Player} player 播放器示例
			 * @param  {tvp.$} $video    video标签$查询后的zepto对象
			 * @param  {tvp.$} $control  控制栏$查询后的zepto对象
			 * @param  {tvp.$} $UILayer 播放器UI $查询后的zepto对象
			 */
			builddefinition: function(player, $video, $control, $UILayer) {
				var $elements = {}, curVideo = player.curVideo;
				$.each(tvp.html5skin.elements.definition, function(k, v) {
					$elements[k] = $control.find(v);
				});
	
				$video.bind("tvp:video:src", function() {
					$.when(curVideo.getFormatList()).then(function(d) {
						if (d.list.length == 1) { //如果就唯一一种清晰度，就不要显示清晰度可选了
							$elements.main.hide();
							$elements.list.hide();
							$elements.button.hide();
							return;
						}
	
						//将支持的清晰度列表填充到清晰度列表选择栏里
						var defValue = $.isFunction(curVideo.getPlayFormat) ? curVideo.getPlayFormat() : curVideo.getFormat(),
							defName = tvp.html5lang.getDefiName(defValue),
							listKV = {},
							html = "";
	
						$.each(d.list, function(i, v) {
							listKV[v] = tvp.html5lang.getDefiName(v);
						});
						var data = {
							"curv": defValue,
							"curn": defName,
							"list": listKV
						};
	
						var render = tvp.$.tmpl(tvp.html5skin.definitionList);
						html = render({
							"data": data
						});
						$elements.list.html(html);
	
						//设置控制栏当前显示的清晰度名称
						if (defName) {
							$elements.button.text(defName);
							if ($elements.button.css("display") == "none") $elements.button.show();
						}
						$elements.main.show();
					});
	
				});
	
				$elements.button.click(function() {
					$elements.list.toggle();
				});
	
				$control.on("tvp:progress:touchstart", function() {
					if ($elements.list.css("display") != "none") {
						$elements.list.hide();
					}
				})
	
				var t = this;
				$elements.list.undelegate("li", "touchend");
				$elements.list.delegate("li", "touchend", function() {
					var $el = $(this),
						fmt = $el.data("fmt"); //从data-fmt自定义属性里获取
					if (!fmt) return;
					t.player.swtichDefinition(fmt);
					$elements.list.hide();
				});
			}
		})
	})(tvp, tvp.$);
	/**
	 * @fileoverview 腾讯视频统一播放器H5内核 poster遮罩层
	 *
	 */
	
	
	;
	(function(tvp, $) {
	
		// extends control any feature ...
		$.extend(tvp.Html5UI.fn, {
			/**
			 * 扩展poster遮罩
			 * @param  {tvp.Player} player    tvp.Player实例
			 * @param  {$("video")} $video     video标签$查询结果
			 * @param  {$("control")} $control   控制栏标签$查询结果
			 * @param  {$("container")} $UILayer UI容器$查询结果
			 */
			buildposterlayer: function(player, $video, $control, $UILayer) {
				var $poster = $UILayer.find(tvp.html5skin.elements.posterlayer.main),
					$img = $poster.find(tvp.html5skin.elements.posterlayer.img),
					t = this,
					setPoster = function(url) {
						url = url || player.curVideo.getPoster() || player.config.pic;
						if (url.length == 0) {
							var _url = $img.attr("src");
							if (_url != "") {
								url = _url;
							}
						}
						if ($.isString(url) && url.length > 0) {
							url = $.filterXSS(url);
							$img.attr("src", url);
							showPoster();
						} else {
							hidePoster();
						}
					},
					showPoster = function() {
						$poster.show();
						$video.one("play playing", hidePoster);
						//$video.on("timeupdate", hidePoster);
					},
					hidePoster = function() {
						$poster.hide();
						//$video.off("timeupdate", hidePoster);
					};
	
				//$poster.css("height", player.config.height).css("width", player.config.width);
	
				if (player.config.isHtml5ShowPosterOnStart) {
					setPoster();
				}
	
				$.extend(this, {
					setPoster: setPoster,
					showPoster: showPoster,
					hidePoster: hidePoster
				});
	
				$.extend(player, {
					setPoster: setPoster
				});
	
				if (($.os.iphone || $.os.ipod) && player.config.isiPhoneShowPosterOnPause) {
					$video.on("pause paused", function() {
						// fix bug
						// 小窗播放滑动控制条 时间bigben被poster盖住
						if(!t.isTouching){
							t.setPoster();
						}
					})
				}
	
	
	
			}
		});
	})(tvp, tvp.$);
	/**
	 * @fileoverview 腾讯视频统一播放器H5内核shadow遮罩层用于覆盖一个透明div放到video标签正上方拦截用户直接对video的触摸操作的默认逻辑
	 *
	 */
	
	
	;
	(function(tvp, $) {
		$.extend(tvp.Html5UI.fn, {
			/**
			 * 建立shadow插件创建入口
			 * @param  {tvp.Player} player    tvp.Player实例
			 * @param  {$("video")} $video     video标签$查询结果
			 * @param  {$("control")} $control   控制栏标签$查询结果
			 * @param  {$("container")} $UILayer UI容器$查询结果
			 */
			buildshadow: function(player, $video, $control, $UILayer) {
				var $shadow = $('<div class="tvp_shadow"></div>').appendTo($UILayer);
				var t = this;
				//如果不是设置为永远显示控制栏，就要做自动化隐藏逻辑
				if (!player.config.isHtml5ControlAlwaysShow) {
					$shadow.bind(t.getClickName(), function(e) {
						if (t.isHidden() && (t.videoTag.currentTime || t.overlayPlayClicked)) {
							// 点击shadow暂停播放
							// 取消这里的暂停逻辑zobor
							// try{
							// 	player.pause();
							// }
							// catch(e){
							// 	tvp.reportErr('call player.pause error in buildshadow:' + (e ? e.message : ''));
							// }
							t.show();
							t.beginHide(8e3); //显示了控制栏以后倒计时8秒，8秒内啥都不做，直接关闭，除非点击了其他控制区域
						} else {
							t.hide();
						}
						e.preventDefault();
						e.stopPropagation();
					});
				}
			}
	
		});
	})(tvp, tvp.$);
	/**
	 * @fileoverview 腾讯视频统一播放器H5内核控制栏下载App文字提示
	 *
	 */
	
	(function(tvp, $) {
	
		$.extend(tvp.Html5UI.fn, {
			/**
			 * 扩展播放暂停按钮
			 * @param  {tvp.Player} player    tvp.Player实例
			 * @param  {$("video")} $video     video标签$查询结果
			 * @param  {$("control")} $control   控制栏标签$查询结果
			 * @param  {$("container")} $UILayer UI容器$查询结果
			 */
			buildpromotion: function(player, $video, $control, $UILayer) {
				if (!$.os.ipad) return; //目前只针对iPad才有这个提示
	
				var $elements = {},
					t = this;
	
	
				$.each(tvp.html5skin.elements.promotion, function(k, v) {
					$elements[k] = $UILayer.find(v);
				});
	
				function report(val) {
					var data = {
						cmd: 3526,
						val: val,
						itype: (function() {
							if ($.os.iPad) return 2;
							if ($.os.iPhone || $.os.ipod) return 1;
							if ($.os.android) return 3;
							return 4;
						})(),
						url: window != top ? document.referrer : document.location.href
					}
					tvp.report(data);
				}
	
				$elements.link.bind("click", function() {
					report(2);
				});
	
				if ($.isString(player.config.iPadPromotionText) && player.config.iPadPromotionText.length > 0) {
					$elements.link.text(player.config.iPadPromotionText);
				}
	
				$elements.main.show();
	
				report(1);
	
	
			}
		});
	})(tvp, tvp.$);
	/**
	 * @fileOverview 初始化h5 loading广告插件模块代码
	 */
	;(function(tvp,$){
		function init(player, $video, $control, $UILayer){
			var adPlayer = new tvp.Html5LoaingAd(),
					  $container = $UILayer.find(tvp.html5skin.elements.loadingAd.main),
					  $control = $container.find(tvp.html5skin.elements.loadingAd.control),
					  $countdownContainer = $container.find(tvp.html5skin.elements.loadingAd.countdown),
					  $skipLink = $container.find(tvp.html5skin.elements.loadingAd.skip),
					  $moreLink = $container.find(tvp.html5skin.elements.loadingAd.more),
					  $adLink = $container.find(tvp.html5skin.elements.loadingAd.adLink);
				$video.on("tvp:player:videochange",function(){
					if(player.config.isHtml5ShowLoadingAdOnChange){
						adPlayer.getAdId();
					}
				});
				adPlayer.onEnd = function(){
					$container.hide();
					$video.attr("data-playing-loadingad","0");
					$video.trigger("tvp:loadingad:ended");
					player.callCBEvent("onh5loadingadend");
				}
				adPlayer.onStart = function(){
					$video.attr("data-playing-loadingad","1");
					$container.show();
					player.callCBEvent("onh5loadingadstart");
				}
				adPlayer.create(player,{
					$container : $container,
					$control : $control,
					$countdownContainer : $countdownContainer,
					$skipLink : $skipLink,
					$moreLink : $moreLink,
					$adLink : $adLink,
					$copyrightTips : $container.find(tvp.html5skin.elements.loadingAd.copyrightTips),
					$qqvipSkip : $container.find(tvp.html5skin.elements.loadingAd.qqVipSkip)
				});
		}
		var hasInit = false;
		$.extend(tvp.Html5UI.fn,{
			buildloadingAd : function(player, $video, $control, $UILayer){
				if(hasInit){				
					return ;
				}
				hasInit = true;
				//如果不付费视频则不加载广告插件
				if(!player.config.isHtml5ShowLoadingAdOnStart || player.curVideo.getPay()){
					$video.trigger("tvp:loadingad:ended");
					if(player.curVideo.getPay()){
						player.config.isHtml5ShowLoadingAdOnStart = false;
						player.config.isHtml5ShowLoadingAdOnChange = false;
					}
					return ;
				}
				else if(typeof tvp.Html5LoaingAd != "function"){
					var jsurl = FILEPATH + 'plugins/loadingad.js?max_age=86400';
					$.getScript(jsurl, function() {		
						if(typeof tvp.Html5LoaingAd != "function"){
							$video.attr("data-playing-loadingad","0");
							$video.trigger("tvp:loadingad:ended");
						}
						else{
							init(player, $video, $control, $UILayer);
						}
					});	
					return ;
				}
				init(player, $video, $control, $UILayer);
			}
		});
	})(tvp,tvp.$);
	/**
	 * @fileOverview 腾讯视频云播放器 MP4文件地址直接链接
	 *
	 */
	
	
	
	;
	(function(tvp, $) {
		var curVid = "";
		tvp.MP4Skin = {
			html: (function() {
				return [
					'<div style="background:#000000 url(http://i.gtimg.cn/qqlive/images/20121119/i1353305744_1.jpg) center center no-repeat;">',
					'	<a style="width:100%;height:100%;display:block" class="tvp_mp4_link"></a>',
					'</div>'].join("");
			})()
		}
	
		tvp.MP4Link = function(vWidth, vHeight) {
			this.config.width = tvp.$.filterXSS(vWidth);
			this.config.height = tvp.$.filterXSS(vHeight);
			this.$elements = null;
			this.$mp4linker = null;
		};
	
		tvp.MP4Link.fn = tvp.MP4Link.prototype = new tvp.BaseHtml5();
		$.extend(tvp.MP4Link.fn, {
	
			/**
			 * 输出播放器
			 * @override
			 * @param  {[type]} id [description]
			 * @return {[type]}    [description]
			 */
			write: function(id) {
				var el = null,
					t = this;
				if ($.type(id) == "object" && id.nodeType == 1) {
					el = id;
				} else {
					el = tvp.$.getByID(id);
				}
				if (!el) return;
	
				this.playerid = this.config.playerid;
				if (!this.playerid) {
					this.playerid = "tenvideo_video_player_" + (tvp.MP4Link.maxId++);
				}
				this.modId = id;
				this.$mod = $("#" + id);
				this.oninited();
	
				var htmlBuf = tvp.MP4Skin.html;
				videoModId = "mod_" + this.playerid;
	
				var $videomod = $('<div id="' + videoModId + '"></div>').appendTo(t.$mod);
	
				this.$elements = $(htmlBuf).appendTo($videomod)
					.css("width", t.config.width)
					.css("height", t.config.height);
	
				this.videomod = $.getByID(videoModId);
				this.$mp4linker = this.$elements.find(".tvp_mp4_link");
				this.callCBEvent("onwrite");
				this.registerMonitor();
	
				this.play(this.curVideo);
	
				if(this.checkPlayerSize){
					this.checkPlayerSize();
				}
				
			},
			/**
			 * 播放指定视频
			 * @override
			 * @param  {[type]} v [description]
			 * @return {[type]}   [description]
			 */
			play: function(v) {
				var t = this;
	
				if (v instanceof tvp.VideoInfo) {
					isVidChange = (v.getVid() != curVid && curVid != "");
					t.setCurVideo(v);
					if (isVidChange) {
						t.callCBEvent("onchange", t.curVideo.getFullVid());
					}
					curVid = t.curVideo.getFullVid();
				}
	
				t.$mp4linker.trigger("tvp:mp4:ajaxstart", v instanceof tvp.VideoInfo ? v.getVid() : v);
	
				t.curVideo.getMP4Url().done(function(url) {
					t.$mp4linker.trigger("tvp:mp4:ajaxsuc", url);
					t.$mp4linker.attr("href", url);
					t.$mp4linker.trigger("tvp:mp4:src", url);
					t.callCBEvent("onplay", t.curVideo.lastQueryVid, t.curVideo);
					if(window!=top){
						t.$mp4linker.bind($.os.hasTouch?'touchend':'click',function(e){
							e.preventDefault();
							top.location.href = url;
						});
					}	
				}).fail(function(errCode, errContent) {
					t.showError(errCode, errContent);
	
					t.$mp4linker.trigger("tvp:mp4:ajaxerror");
					t.$mp4linker.trigger("tvp:mp4:error", errcode, errcontent);
	
					t.callCBEvent("onerror", errCode, errContent);
				}).always(function() {
					curVid = t.curVideo.lastQueryVid;
				});
			},
			/**
			 * 返回当前视频播放器烈性
			 * @override
			 * @return {[type]} [description]
			 */
			getPlayerType: function() {
				return "mp4";
			},
			/**
			 * 获取总时长
			 * @return {Number} 返回总时长
			 */
			getDuration: function() {
				var dur = this.curVideo.getDuration();
				if (!isNaN(dur) && dur > 0) {
					return dur
				}
				return 0;
			}
		});
	
		tvp.MP4Link.maxId = 0;
	})(tvp, tvp.$);
	(function(tvp, $) {
		$.extend(tvp.MP4Link.fn, {
			buildmonitor: function() {
				if($.isUndefined(tvp.H5Monitor)){
					return;
				}
				var t = this,
					monitor = null;
	
				this.$mp4linker.on("tvp:mp4:ajaxstart", function(e, vid) {
					monitor = null;
					monitor = new tvp.H5Monitor(vid, t);
					monitor.addStep(1011);
				}).on("tvp:mp4:ajaxsuc", function() {
					monitor.reportStep(1011, {
						val1: 1,
						val2: 0
					});
				}).on("tvp:mp4:src", function() {
					monitor.report(4, 1);
				}).on("click",function(){
					if(monitor && $.isFunction(monitor.report)){
						monitor.report(6, 1);	
					}
				});
			}
		});
	})(tvp, tvp.$);
	;
	(function(tvp, $) {
	
		/**
		 * Flash播放器基类
		 *
		 * @class tvp.BaseFlash
		 * @extends tvp.BasePlayer
		 */
		tvp.BaseFlash = function() {
			var $me = this;
	
			this.swfPathRoot = "";
	
			/**
			 * flash对象
			 * @type {Object}
			 */
			this.flashobj = null;
	
			this.flashVarsKeyMapToCfg = {};
		}
	
		if (typeof tvp.BaseFlash.maxId != "number") {
			tvp.BaseFlash.maxId = 0;
		}
		tvp.BaseFlash.prototype = new tvp.BasePlayer();
	
		$.extend(tvp.BaseFlash.prototype, {
			getFlashVar: function() {
				return "";
			},
			/**
			 * 从全局配置项中获取对应的参数值
			 * @param  {Object} config 指定配置项
			 * @return {Object} 获得的参数k-v键值对对象
			 */
			getFlashVarVal: function() {
				var val = {}, config = this.config;
				$.each(this.flashVarsKeyMapToCfg, function(k, v) {
					var cfgKey = v;
					if (cfgKey in config) {
						var valType = $.type(config[cfgKey]);
						if (valType == "boolean") {
							val[k] = config[cfgKey] ? 1 : 0;
						} else if (valType == "number" || valType === "string") {
							val[k] = config[cfgKey];
						}
					} else {
						val[k] = "";
					}
				});
				return val;
			},
			getFlashSwfUrl: function() {
				var swfurl = "";
				//直播
				if (this.config.type == tvp.PLAYER_DEFINE.LIVE) {
					// TODO:这里需要加入验证传入的swf是否是qq.com，paipai.com,soso.com,gtimg.cn
					if ($.isString(this.config.liveFlashUrl) && this.config.liveFlashUrl.length > 0) {
						swfurl = this.config.liveFlashUrl;
					} else {
						// 文件名前缀过滤掉特殊的字符，只允许英文和数字
						swfurl = this.swfPathRoot + this.config.liveFlashSwfType.replace(/[^\w+]/ig, "") + ".swf";
						swfurl += "?max_age=86400&v=" + this.config.flashVersionTag || '20140615';
					}
				} else {
					// TODO:这里需要加入验证传入的swf是否是qq.com，paipai.com,soso.com,gtimg.cn
					if ($.isString(this.config.vodFlashUrl) && this.config.vodFlashUrl.length > 0) {
						swfurl = this.config.vodFlashUrl;
					} else {
						// 文件名前缀过滤掉特殊的字符，只允许英文和数字
						swfurl = this.swfPathRoot + this.config.vodFlashType.replace(/[^\w+]/ig, "") + ".swf";
						swfurl += "?max_age=86400&v="  + this.config.flashVersionTag || '20140615';
					}
					var ua = navigator.userAgent;
					if (ua.indexOf("Maxthon") > 0 && ua.indexOf("Chrome") > 0) { //遨游云浏览器，缓存了flash导致事件注册不上去
						swfurl += (swfurl.indexOf("?") > 0 ? "&" : "?") + "_=" + tvp.$.now();
					}
				}
				swfurl = $.filterXSS(swfurl);
				if (typeof window.console != "undefined" && $.isFunction(window.console.warn) && swfurl.indexOf("TencentPlayer.swf") > 0 && $.inArray(document.location.hostname, ["v.qq.com", "film.qq.com"]) == -1) {
					var msg = "您当前使用的flash播放器是腾讯视频官网专用版，如无必要请使用外贴版本";
					if ($.browser.chrome) {
						window.console.warn("%c" + msg, "background: rgba(252,234,187,1)");
					} else {
						window.console.warn(msg);
					}
				}
				return swfurl;
			},
			getFlashHTML: function() {
	
				var flashvar = this.getFlashVar(),
					swfurl = this.getFlashSwfUrl(),
					width = $.formatSize(this.config.width),
					height = $.formatSize(this.config.height);
	
				if (!this.config.playerid) {
					this.playerid = "tenvideo_flash_player_" + new Date().getTime();
				} else {
					this.playerid = this.config.playerid;
				}
	
				var propStr = [
					'<param name="allowScriptAccess" value="always" />',
					'<param name="movie" value="' + swfurl + '" />',
					'<param name="quality" value="high" />',
					'<param name="allowFullScreen" value="true"/>',
					'<param name="play" value="true" />',
					'<param name="wmode" value="' + $.filterXSS(this.config.flashWmode) + '" />',
					'<param name="flashvars" value="' + flashvar + '"/>',
					'<param name="type" value="application/x-shockwave-flash" />',
					'<param name="pluginspage" value="http://get.adobe.com/cn/flashplayer/" />'
				].join("\n");
				var str = "";
				if ( !! $.browser.ie) {
					if($.browser.version == 11){
						str += '<object data="' + swfurl + '" type="application/x-shockwave-flash" width="' + width + '" height="' + height + '" id="' + this.playerid + '" codebase="http://fpdownload.adobe.com/pub/shockwave/cabs/flash/swflash.cab#version=10,2,0,0">\n';
					}else{
						str += '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="' + width + '" height="' + height + '" id="' + this.playerid + '" codebase="http://fpdownload.adobe.com/pub/shockwave/cabs/flash/swflash.cab#version=10,2,0,0">\n';
					}
					
					str += propStr;
					str += '	<div id="tvp_flash_install" style="line-height:' + height + ';background:#000000;text-align:center"><a href="http://www.adobe.com/go/getflashplayer" target="_blank" style="color:#ffffff;font-size:14px;padding:10px;">点击此处安装播放视频需要的flash插件</a></div>\n';
					str += '</object>';
				}
				// else if ( !! $.os.android) {
				// 	str += '<object type="application/x-shockwave-flash" data="' + swfurl + '" width="' + this.config.width + '" height="' + this.config.height + '" id="' + this.playerid + '" align="middle">\n';
				// 	str += propStr;
				// 	str += '	<div class="tvp_player_noswf">未检测到flash插件或者您的设备暂时不支持flash播放</div>';
				// 	str += '</object>'
				// } 
				else {
					str += '<embed wmode="' + $.filterXSS(this.config.flashWmode) + '" flashvars="' + flashvar + '" src="' + swfurl + '" quality="high" name="' + this.playerid + '" id="' + this.playerid + '" bgcolor="#000000" width="' + width + '" height="' + height + '" align="middle" allowScriptAccess="always" allowFullScreen="true"  type="application/x-shockwave-flash" pluginspage="http://get.adobe.com/cn/flashplayer/"></embed>';
				}
				
				return str;
	
	
			},
			write: function(modId) {
				var el = null;
				if ($.type(modId) == "object" && modId.nodeType == 1) {
					el = modId;
					this.$mod = $("#" + modId.id);
					this.modId = this.$mod.attr("id") || "";
				} else {
					el = tvp.$.getByID(modId);
					this.modId = modId, this.$mod = $(el);
				}
				if (!el) return;
				var str = this.getFlashHTML(),
					startTime = $.now(),
					swfUrl = this.getFlashSwfUrl(),
					cmd = 3544,
					$me = this,
					videoModId = "mod_" + this.playerid;
				this.on(tvp.ACTION.onFlashPlayerInited,function(){
					tvp.report({
						cmd : cmd,
						speed : $.now() - startTime,
						appId : $me.config.appid,
						contentId : $me.config.contentId,
						vid: $me.curVideo.getFullVid() || $me.curVideo.getChannelId(),
						str3: $me.getPlayerType(),
						str4 : swfUrl
					});
				});
				tvp.report({
					cmd : cmd,
					appId : $me.config.appid,
					contentId : $me.config.contentId,
					vid: $me.curVideo.getFullVid() || $me.curVideo.getChannelId(),
					str3: $me.getPlayerType(),
					str4 : swfUrl
				});
				el.innerHTML = '<div id="' + videoModId + '">' + str + '</div>';
				this.flashobj = $.browser.ie ? document.getElementById(this.playerid) : document.embeds[this.playerid];
				this.videomod = $.getByID(videoModId);
	
				var h = this.config.height+"",fl = $.getByID("tvp_flash_install");
				if(h.indexOf("%")>0 && fl){
					fl.style.lineHeight = el.offsetHeight;
				}
	
			},
			/**
			 * 返回真实的播放器
			 */
			getPlayer: function() {
				return this.flashobj;
			}
		})
	
	
	})(tvp, tvp.$);
	/**
	 * @fileOverview 腾讯视频云播放器 Flash直播播放器
	 */
	
	/*
	 * @include "./tvp.define.js"
	 * @include "./tvp.jquery.js"
	 * @include "./tvp.common.js"
	 * @include "./tvp.baseplayer.js"
	 */
	
	;
	(function(tvp, $) {
		/**
		 * Flash直播播放器类
		 *
		 * @class tvp.FlashPlayer
		 * @param {number}
		 *          vWidth 宽度，单位像素
		 * @param {number}
		 *          vHeight 高度，单位像素
		 * @extends tvp.BaseFlash
		 */
		tvp.FlashLivePlayer = function(vWidth, vHeight) {
	
			var $me = this;
			tvp.BaseFlash.maxId++;
			/**
			 * flashvars参数对应全局配置的映射关系
			 * @type {Object}
			 */
			this.flashVarsKeyMapToCfg = {
				"showcfg": "isLiveFlashShowCfg",
				"loadingswf": "loadingswf",
				"share": "share",
				"oid": "oid",
				"apptype": "liveFlashAppType",
				"full": "isLiveflashShowFullBtn",
				"wmark": "liveFlashWatermark",
				"autoplay": "autoplay"
			};
	
	
			this.swfPathRoot = "http://imgcache.qq.com/minivideo_v1/vd/res/";
	
			/**
			 * 宽度
			 *
			 * @public
			 */
			this.config.width = $.filterXSS(vWidth);
			/**
			 * 高度
			 *
			 * @public
			 */
			this.config.height = $.filterXSS(vHeight);
	
			/**
			 * flash播放器登录后的回调
			 */
			this.loginResponse = function() {
				if (!this.flashobj || typeof this.flashobj.loginCallback == "function") {
					this.flashobj.loginCallback(tvp.FlashLivePlayer.flashloginParam);
					tvp.FlashLivePlayer.flashloginParam = {};
				}
			}
	
			window.playerInit = function() {
				$me.trigger(tvp.ACTION.onFlashPlayerInited);
				$me.callCBEvent("oninited");
				// 2013年10月3日 注释掉下面的内容 不在想想playerInit调用play接口，改为直接从flashvars里传入初始视频信息
				// if ($me.config["autoplay"] == 1) {
				// 	$me.play($me.curVideo);
				// } 
				$me.callCBEvent("onplay", $me.curVideo.getChannelId());
			}
	
		}
	
		/*
		 * 从tvp.BaseFlash继承，这句话很关键，谁注释掉谁SB
		 */
		tvp.FlashLivePlayer.prototype = new tvp.BaseFlash();
	
		$.extend(tvp.FlashLivePlayer.prototype, {
			getChannelURl: function(cnlid) {
				return "http://zb.v.qq.com:1863/?progid=" + cnlid;
			},
	
			getPlayerType:function(){
				return "liveflash";
			},		
			/**
			 * 获得播放器的flashvars
			 * @return {[type]} [description]
			 */
			getFlashVar: function() {
				var flashvar = '',
					funPrefix = "TenVideo_FlashLive_",
					varsVal = this.getFlashVarVal(),
					host = window != top ? document.referrer : document.location.href,
					linkChar = "";
	
	
				flashvar += "vid=" + this.curVideo.getChannelId();
				flashvar += "&vurl=" + this.getChannelURl(this.curVideo.getChannelId());
				flashvar += "&sktype=" + ( !! this.curVideo.getIsLookBack() ? "vod" : "live");
				linkChar = "&";
	
	
				// 通过flashvars
				flashvar += linkChar;
				flashvar += "funCnlInfo=" + funPrefix + "GetChannelInfo" // 获取直播节目信息
				flashvar += "&funTopUrl=" + funPrefix + "GetTopUrl"; // 获取当前页面地址，之前加的用意是解决iframe嵌入的问题
				flashvar += "&funLogin=" + funPrefix + "IsLogin"; // 是否登录
				flashvar += "&funOpenLogin=" + funPrefix + "OpenLogin"; // 打开登录框
				flashvar += "&funSwitchPlayer=" + funPrefix + "SwitchPlayer"; // 切换播放器
				flashvar += "&host="+encodeURIComponent(host);
				flashvar += "&txvjsv=2.0"; 
				$.each(varsVal, function(k, v) {
					if (($.isString(v) && v.length > 0) || $.type(v) == "number") {
						flashvar += "&" + k + "=" + $.filterXSS(v);
					}
				});
	
				for (var p in this.config.liveFlashExtVars) {
					flashvar += ["&", encodeURIComponent(p), "=", encodeURIComponent(this.config.liveFlashExtVars[p])].join("");
				}
	
				//autoplay=1时不调用play方法,需要传flashp2p参数
				flashvar += '&p=' + tvp.livehub.g_flashp2p || 0;
	
				return flashvar;
			},
			play: function(video) {
				if (!this.flashobj) {
					return;
				}
	
				video = video || this.curVideo;
	
				if (!video instanceof tvp.VideoInfo) {
					throw new Error("传入的对象不是tvp.VideoInfo的实例");
				}
	
				var islookback = !! video.getIsLookBack(),
					cnild = video.getChannelId(),
					rurl = this.getChannelURl(cnild),
					flashp2p = tvp.livehub.g_flashp2p || 0;
	
				if (cnild == "") {
					return;
				}
	
				if (typeof this.flashobj.setSkinType != "undefined") {
					this.flashobj.setSkinType(islookback ? "vod" : "live");
				}
	
				if (typeof this.flashobj.loadAndPlayVideoFromVID != "undefined") {
					this.flashobj.loadAndPlayVideoFromVID(rurl, cnild, video.getLiveReTime() || "", "", flashp2p);
				}
	
				this.callCBEvent("onplay", video.getChannelId());
	
				this.setCurVideo(video);
				this.callCBEvent("onchange", video.getChannelId());
			},
			stop: function() {
				if (!this.flashobj) {
					return;
				}
	
				if (!$.isUndefined(this.flashobj.stopVideo)) {
					this.flashobj.stopVideo();
				}
			}
	
	
		});
	
		/**
		 * 播放器所在业务枚举
		 *
		 * @type
		 */
		tvp.FlashLivePlayer.ADTYPE = {
			/**
			 * 微电台
			 *
			 * @type String
			 */
			"WEI_DIAN_TAI": "weidiantai",
			/**
			 * 微电视
			 *
			 * @type String
			 */
			"WEI_DIAN_SHI": "weidianshi",
			/**
			 * 腾讯直播
			 *
			 * @type String
			 */
			"LIVE": "live",
			/**
			 * 公司内部直播
			 *
			 * @type String
			 */
			"IN_LIVE": "inlive"
		}
	
		window.TenVideo_FlashLive_GetChannelInfo = function() {
			return tvp.livehub.g_curCnlInfo;
		}
		window.TenVideo_FlashLive_GetTopUrl = function() {
			var href = "";
			try {
				href = top.location.href;
			} catch (err) {
				href = document.location.href;
			}
			return href;
		}
		window.TenVideo_FlashLive_IsLogin = function() {
			return tvp.common.getUin() > 10000;
		}
		window.TenVideo_FlashLive_OpenLogin = function(config) {
			tvp.FlashLivePlayer.flashloginParam = config || {};
			tvp.common.openLogin();
		}
		window.TenVideo_FlashLive_SwitchPlayer = $.noop;
	})(tvp, tvp.$);
	/**
	 * @fileOverview 腾讯视频云播放器 Flash播放器
	 */
	
	/*
	 * @include "./tvp.define.js" @include "./tvp.jquery.js" @include
	 * "./tvp.common.js" @include "./tvp.baseplayer.js"
	 */
	
	// ===========================================================
	/**
	 * flash 播放器播放前一个回调
	 *
	 * @ignore
	 * @type {function}
	 */
	var preplay = tvp.$.noop,
		/**
		 * flash 播放器播放下一个回调
		 *
		 * @ignore
		 * @type {function}
		 */
		nextplay = tvp.$.noop,
		/**
		 * 看点联播回调
		 *
		 * @type
		 */
		attrationstop = tvp.$.noop,
		/**
		 * flash播放器开始播放时回调
		 *
		 * @ignore
		 * @type {function}
		 */
		thisplay = tvp.$.noop,
		/**
		 * flash播放器初始化后的回调
		 *
		 * @ignore
		 * @type {function}
		 */
		playerInit = tvp.$.noop;
	
	// ===============================================================
	
	(function(tvp, $) {
		var curVid = "",
			pauseTime = -1,
			$me = null;
	
		/**
		 * Flash播放器类
		 *
		 * @class tvp.FlashPlayer
		 * @param {number}
		 *          vWidth 宽度，单位像素
		 * @param {number}
		 *          vHeight 高度，单位像素
		 * @extends tvp.BaseFlash
		 */
		tvp.FlashPlayer = function(vWidth, vHeight) {
	
			$me = this;
	
			/**
			 * flashvars参数对应全局配置的映射关系
			 * @type {Object}
			 */
			this.flashVarsKeyMapToCfg = {
				"cid" : "coverId",
				"tpid" : "typeId",
				"showend" : "isVodFlashShowEnd",
				"showcfg" : "isVodFlashShowCfg",
				"searchbar" : "isVodFlashShowSearchBar",
				"loadingswf" : "loadingswf",
				"share" : "isVodFlashShowShare",
				"pic" : "pic", // 同名的也需要列出来，因为config会有很多配置，但不是所有的配置项都要传入到flashvars
				"oid" : "oid",
				"skin" : "vodFlashSkin",
				"shownext" : "isVodFlashShowNextBtn",
				"list" : "vodFlashListType",
				"autoplay" : "autoplay"
			};
	
			this.swfPathRoot = "http://imgcache.qq.com/tencentvideo_v1/player/";
	
			tvp.BaseFlash.maxId++;
	
			/**
			 * 设置当前是否在播放
			 *
			 * @ignore
			 */
			this.isStartPlay = false;
	
			/**
			 * 获取播放器类型
			 */
			this.getPlayerType = function() {
				return "flash";
			}
	
			/**
			 * 宽度
			 *
			 * @public
			 */
			this.config.width = tvp.$.filterXSS(vWidth);
			/**
			 * 高度
			 *
			 * @public
			 */
			this.config.height = tvp.$.filterXSS(vHeight);
	
			window.__flashplayer_ismax = function(ismax) {
				$me.callCBEvent("onfullscreen", ismax);
			};
	
			window.__tenplay_popwin = function() {
				if (tvp.$.isFunction($me.onflashpopup)) {
					$me.callCBEvent("onflashpopup");
				}
			}
	
			window._showPlayer = function() {
				$me.showPlayer();
			}
	
			window._hidePlayer = function() {
				$me.hidePlayer();
			}
		}
	
		/*
		 * 从tvp.BasePlayer继承，这句话很关键，谁注释掉谁SB
		 */
		tvp.FlashPlayer.fn = tvp.FlashPlayer.prototype = new tvp.BaseFlash();
	
		$.extend(tvp.FlashPlayer.fn, {
			        play : function(video) {
	
				        function converVideoInfoToJson(video) {
					        var videoInfo = {
						        vid : video.getVidList() || video.getIdx(),
						        duration : video.getDuration() || "",
						        start : tagstart,
						        end : tagend,
						        history : video.getHistoryStart() || 0,
						        vstart : vstart,
						        vend : vend,
						        title : video.getTitle() || "",
						        exid : extid,
						        pay : video.getPay(),
						        cdntype : video.getCDNType(),
						        bulletid : $.isFunction(video.getBulletId) ? video.getBulletId() : ""
					        };
					        return videoInfo;
				        }
	
				        if (!this.flashobj) {
					        throw new Error("未找到视频播放器对象，请确认flash播放器是否存在");
				        }
				        if ($.isUndefined(video) && typeof this.flashobj.setPlaytime === "function") {
					        if (pauseTime == -1) {
						        if (typeof this.flashobj.loadAndPlayVideoV2 == 'function') {
							        this.flashobj.loadAndPlayVideoV2(converVideoInfoToJson(this.getCurVideo()));
						        }
					        }
					        else {
						        this.flashobj.setPlaytime(pauseTime);
						        pauseTime = -1;
						        this.isStartPlay = true;
					        }
					        return;
				        }
				        if (!video instanceof tvp.VideoInfo) {
					        throw new Error("传入的对象不是tvp.VideoInfo的实例");
				        }
	
				        var isVideChange = curVid != video.getFullVid();
				        this.setCurVideo(video);
				        if (isVideChange) {
					        this.callCBEvent("onchange", this.curVideo.getFullVid());
				        }
				        curVid = this.curVideo.getFullVid();
	
				        this.isStartPlay = false;
				        var vstart = 0,
					        vend = 0,
					        tagstart = 0,
					        tagend = 0;
				        if (video.getIdx() == 0) {
					        vstart = video.getPrefix() || 0;
					        vend = video.getEndOffset() || 0;
				        }
				        else {
					        tagstart = video.getTagStart();
					        tagend = video.getTagEnd();
				        }
				        var extid = video.getIdx() == 0 ? 0 : ("k" + video.getIdx());
				        if (this.curVideo.getVidList() != video.getVidList() || video.getIdx() == 0) {
					        var videoInfo = converVideoInfoToJson(video);
					        if (this.config["starttips"] == 0) {
						        videoInfo["t"] = video.getHistoryStart() || 0;
					        }
					        if (typeof this.flashobj.loadAndPlayVideoV2 == 'function') {
						        this.flashobj.loadAndPlayVideoV2(videoInfo);
					        }
				        }
				        else if (video.getTagEnd() - video.getTagStart() > 0) {
					        this.flashobj.attractionUpdate(video.getTagStart(), video.getTagEnd(), extid);
				        }
				        this.isStartPlay = true;
				        this.callCBEvent("onplay", video.getFullVid());
	
				        if (typeof this.flashobj.setNextEnable == "function") {
					        this.flashobj.setNextEnable(this.callCBEvent("ongetnextenable", this.curVideo.getFullVid()) ? 1 : 0);
				        }
			        },
			        pause : function() {
				        // 没开始播放就别调用pauseVideo
				        if (!$me.isStartPlay)
					        return;
				        // 不要用$.isFunction 因为flash接口在各种浏览器返回的对象并不一致
				        if (!!this.flashobj && typeof this.flashobj.getPlaytime === "function" && typeof this.flashobj.pauseVideo === "function") {
					        pauseTime = this.flashobj.getPlaytime();
					        this.flashobj.pauseVideo();
					        this.isStartPlay = false;
				        }
			        },
			        /**
			         * @override 获得flashvars字符串
			         * @return {string} 处理后的flashvars
			         */
			        getFlashVar : function() {
				        var flashvar = '',
					        varsVal = this.getFlashVarVal();
	
				        flashvar += 'vid=' + this.curVideo.getVidList();
				        // if (this.curVideo.getTypeId() != 0) {
				        // flashvar += "&tpid=" + this.curVideo.getTypeId();
				        // }
				        // if (this.curVideo.getCoverId() != 0) {
				        // flashvar += "&cid=" + this.curVideo.getCoverId();
				        // }
				        if (this.curVideo.getTagEnd() - this.curVideo.getTagStart() > 0) {
					        flashvar += "&attstart=" + tvp.$.filterXSS(this.curVideo.getTagStart());
					        flashvar += "&attend=" + tvp.$.filterXSS(this.curVideo.getTagEnd());
				        }
				        if (this.curVideo.getDuration() > 0) {
					        flashvar += '&duration=' + (this.curVideo.getDuration() || "");
				        }
				        if (this.curVideo.getHistoryStart() > 0) {
					        flashvar += "&history=" + tvp.$.filterXSS(this.curVideo.getHistoryStart());
				        }
	
				        if (this.curVideo.getTstart() > 0) {
					        flashvar += "&t=" + tvp.$.filterXSS(this.curVideo.getTstart());
				        }
				        if (this.curVideo.getIdx() == 0 && (this.curVideo.getPrefix() > 0 || this.curVideo.getTail() > 0)) {
					        var _piantou = this.curVideo.getPrefix(),
						        _endoffset = this.curVideo.getEndOffset();
					        if (_piantou > 0 || _endoffset) {
						        flashvar += "&vstart=" + tvp.$.filterXSS(_piantou);
						        flashvar += "&vend=" + tvp.$.filterXSS(_endoffset);
					        }
				        }
	
				        tvp.$.each(varsVal, function(k, v) {
					                if (($.isString(v) && v.length > 0) || $.type(v) == "number") {
						                flashvar += "&" + k + "=" + tvp.$.filterXSS(v);
					                }
				                });
	
				        if (!!this.curVideo.getPay()) {
					        flashvar += "&pay=" + ($.isTrue(this.curVideo.getPay()) ? 1 : 0);
				        }
	
				        // 增加标记看点的统计上报参数
				        if (!!this.curVideo.getIdx()) {
					        flashvar += "&exid=k" + tvp.$.filterXSS(this.curVideo.getIdx());
				        }
	
				        if (this.curVideo.getCDNType() > 0) {
					        flashvar += "&cdntype=" + this.curVideo.getCDNType();
				        }
	
				        for (var p in this.config.vodFlashExtVars) {
					        flashvar += ["&", encodeURIComponent(p), "=", encodeURIComponent(this.config.vodFlashExtVars[p])].join("");
				        }
	
				        if ($.isFunction(this.curVideo.getBullet) && this.curVideo.getBullet() === true) {
					        flashvar += "&bullet=1";
					        if ($.isFunction(this.curVideo.getBulletId)) {
						        flashvar += "&bulletid=" + this.curVideo.getBulletId();
					        }
				        }
	
				        // 将title放到最后，防止title编码后过长将其他参数截断--by walkerwang
				        if (this.curVideo.getTitle().length > 0) {
					        flashvar += "&title=" + encodeURIComponent(this.curVideo.getTitle());
				        }
	
				        return flashvar;
			        },
			        getPlaytime : function() {
				        if (!!this.flashobj && typeof this.flashobj.getPlaytime === "function") {
					        return this.flashobj.getPlaytime();
				        }
				        return -1;
			        },
	
			        /**
			         * 设置播放时间
			         * @param {[Number]} time [要播放的时间点]
			         * @param {Object} opt 额外的参数对象
			         */
			        setPlaytime : function(time, opt) {
				        if (!!this.flashobj && typeof this.flashobj.setPlaytime === "function") {
					        return this.flashobj.setPlaytime(time, opt);
				        }
			        },
			        /**
			         * 显示播放器
			         */
			        showPlayer : function() {
				        if (!this.flashobj)
					        return;
				        var width = "" + this.config.width,
					        height = "" + this.config.height;
				        if (width.indexOf("px") < 0) {
					        width = parseInt(width) + "px";
				        }
				        if (height.indexOf("px") < 0) {
					        height = parseInt(height) + "px";
				        }
				        this.flashobj.style.width = width;
				        this.flashobj.style.height = height;
			        },
	
			        hidePlayer : function() {
				        if (!this.flashobj)
					        return;
				        this.flashobj.style.width = "1px";
				        this.flashobj.style.height = "1px";
			        }
		        });
	
		// ===============开始注册全局接口给flash调用=====================
		/**
		 * @public
		 * 与flash播放器的通信方法，目前有注册播放和暂停消息
		 * @param {String} playerId 当前播放器id
		 * @param {Number} act 消息代码
		 */
		window.__tenplay_onMessage = function(playerId, act) {
			if (tvp.Player && tvp.Player.instance && playerId) {
				var curPlayer = tvp.Player.instance[playerId] || {};
				var fnName = '';
				switch (parseInt(act, 10)) {
					// case 0 : {//播放第一帧时触发，因为同时会触发thisplay，所以这里不做处理
					// fnName = 'onplaying';
					// break;
					// }
					case 1 : {// 暂停
						fnName = 'onpause';
						break;
					}
					case 3 : {// 恢复播放
						fnName = 'onresume';
						break;
				}
				}
				if (fnName && typeof curPlayer.callCBEvent == 'function') {
					curPlayer.callCBEvent(fnName);
				}
			}
		};
	
		/**
		 * 视频开始播放时flash会调用这个回调
		 * @param {String} 当前播放的视频id
		 * @param {Object} 额外参数对象，包含播放器id和pid(上报用的)
		 */
		window.thisplay = function(vid, obj) {
			var curPlayer;
			if (obj && obj.id && tvp.Player && tvp.Player.instance) {
				curPlayer = tvp.Player.instance[obj.id] || {};
				curPlayer.isStartPlay = true;
				curPlayer.instance && (curPlayer.instance.isStartPlay = true);
				if (typeof curPlayer.callCBEvent == 'function') {
					curPlayer.callCBEvent("onplaying", curPlayer.getCurVid(), obj);
				}
			}
		};
		
		/**
		 * flash播放器完成初始化工作后触发的回调
		 * @param {String} 当前播放器id
		 */
		window.playerInit = function(playerId) {
			var curPlayer,isShowNext,curFullVid;
			if (playerId && tvp.Player && tvp.Player.instance) {
				curPlayer = tvp.Player.instance[playerId];
				if(!curPlayer){
					return ;
				}
				curFullVid = curPlayer.curVideo.getFullVid();
				isShowNext = curPlayer.callCBEvent("ongetnextenable", curFullVid) ? 1 : 0;
				curPlayer.execFlashMethod('setNextEnable',isShowNext);
				curPlayer.trigger(tvp.ACTION.onFlashPlayerInited);
				curPlayer.callCBEvent("oninited");
				curPlayer.callCBEvent("onplay", curFullVid);
			}
		};
		
		/**
		 * 当前视频播放结束后flash播放器触发的回调
		 * @param {String} 当前播放的视频id
		 * @param {Object} 额外参数对象，包含播放器id
		 */
		window.attrationstop = window.nextplay = function(vid, obj) {
			var curPlayer, _id;
			if (obj && obj.id && tvp.Player && tvp.Player.instance) {
				curPlayer = tvp.Player.instance[obj.id] || {};
			}else if(tvp.Player && tvp.Player.instance){
				for (_id in tvp.Player.instance) {
					if(tvp.Player.instance.hasOwnProperty(_id)){
						curPlayer = tvp.Player.instance[ _id ];
						break;
					}
				}
			}
			if(!(curPlayer instanceof tvp.Player)){
				return ;
			}
			curPlayer.callCBEvent("onended", vid);
			var video = curPlayer.callCBEvent("ongetnext", vid);
			if (!video) {
				curPlayer.callCBEvent("onallended");
				return;
			}
			curPlayer.play(video);
		}
	})(tvp, tvp.$);
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
	/**
	 * @fileOverview  腾讯视频移动端App下载提示banner
	 * @author popotang
	 * @copyright TencentVideo Web Front-end Team
	 */
	
	
	;
	(function(tvp, $) {
	
		var defaultConfig = {
			pluginName: 'AppBanner',
			//下方banner创建后直接上报,默认为true;暂停和结束banner只有显示出来才上报,默认为false
			isAutoReport: true,
			isAndroid: /android/i.test(navigator.userAgent.toLowerCase()),
			// text1: '腾讯视频客户端',
			// text2: "可观看更多视频",
			btnTexts: ['下载', '打开', '升级'],
			btnText: "下载腾讯视频，观看更多",
			style: 'none',
			isResetWords : false,
			// 默认开启手Q和微信的下载器
			// 需要配合一下3个参数：downloader,range,downloaderCallback
			downloader: true,
			range: [1,2],
			// downloaderCallback: 'transferDownloadState',
			tpl: '<div class="tvp_promote_banner tvp_promote_banner_v2" data-role="appbannerbox">\
					<a class="tvp_promote_attention_right tvp_promote_download" data-action="applink" data-role="appbannerlink" data-status="down" href="${url}" data-url="${openUrl}" ${iframe}>\
						<p class="tvp_promote_progress" data-role="appbannerbtnprogress"></p>\
						<span class="tvp_promote_text" data-role="appbannerbtntext">${btnText}</span>\
					</a>\
				</div>'
		};
	
		function AppBanner(config) {
			var curVideo = config.t?config.t.curVideo:false;
			var op = $.extend({
				//直播id
				lid:curVideo?curVideo.getChannelId():"",
				//页面传入的文案
				pageText2:config.text2
			}, defaultConfig, config);
			this.op = op;
			this.init(op);
			return this;
		}
	
		$.extend(AppBanner.prototype, {
			init: function(op) {
				var me = this;
				this.initStyle(op);
				this.getAppInfo(op).done(function(){
					me.initRoles(op);
					me.fixTextAndUrl(op);
				});
				
			},
			initStyle: function(op) {
				//style为none时不需要默认样式
				if (op.style != 'none') {
					$("head").append(op.style);
				}
			},
			initRoles: function(op) {
				var $mod = op.modId ? $("#" + op.modId) : op.mod;
				this.$mod = $mod;
				this.fixTpl();
				this.$box = $mod.find("[data-role=appbannerbox]");
				this.$text1 = $mod.find("[data-role=appbannertext1]");
				this.$text2 = $mod.find("[data-role=appbannertext2]");
				this.$btn = $mod.find("[data-role=appbannerlink]");
				this.$btnText = $mod.find("[data-role=appbannerbtntext]");
				this.$progress = $mod.find("[data-role=appbannerbtnprogress]");
				this.$btn.attr('data-promotionId',op.promotionId || 140);
				this.fixStyle();
				this.$box.show();
			},
			getAppInfo:function(op){
				if(op.loadAppInfoDefer){
					return op.loadAppInfoDefer;
				}
				var defer = $.Deferred();
				op.loadAppInfoDefer = defer;
				function extendText(name){
					name = name || tvp.app.config.defaultName;
					var packageInfo = tvp.app.getPackageInfo();
					op = $.extend(op,{
						appName:name,
						logoClass:packageInfo[name].logoClass,
						text1:packageInfo[name].text1,
						text2:packageInfo[name].text2
					});				
				}
				
				
				//指明了是好莱坞付费和专辑id就不需要反查了
				if(op.pay && op.cid){
					extendText(op.appName);
					defer.resolve();
				}
				//或者比如指明了是weishi且开启了extraApp 也不需要查询
				else if(op.appName && op.extraApp){
					extendText(op.appName);
					defer.resolve();
				}
				else if(op.lid){
					extendText(op.appName);
					defer.resolve();
				}
				else if(op.vid){
					op.appName = '';
					extendText(op.appName);
					defer.resolve();
					// var url = 'http://data.video.qq.com/fcgi-bin/video/player_vinfo?otype=json&vid='+op.vid;
					// $.ajax({
					// 	url:url,
					// 	dataType:'jsonp'
					// }).then(function(rs){
					// 	if(rs){
					// 		op = $.extend(op,{
					// 			cid:rs.cid,
					// 			pay:rs.pay,
					// 			appName:rs.weishi?'weishi':''
					// 		});
					// 	}
					// 	if(!op.extraApp){
					// 		op.appName = '';
					// 	}
					// 	extendText(op.appName);
					// 	defer.resolve();
					// });
				}
				
				return defer;
			},
			/**
			 * 检测是否安装app并做相关处理
			 */
			fixResult: function() {
				var op = this.op;
				var self = this;
				var speedtime = [];
				var defer = $.Deferred();
				this.getAppInfo(op).done(function(){
					speedtime[0] = new Date().getTime();
					tvp.app.check(op).done(function(rs) {
						speedtime[1] = new Date().getTime();
						self.info = rs;
						self.info.speed = speedtime.length > 1 ? speedtime[1] - speedtime[0] : 0;
						self.showtips();
						self.bindTap();
						defer.resolve();
					});
				});
				return defer;
			},
	
			/**
			 * 初始渲染banner
			 */
			fixTpl: function() {
				var self = this;
				var op = this.op;
				//op.text2 = op.text2 || defaultConfig.text2;
				var tpl = $.formatTpl(op.tpl, {
					"text1": $.filterXSS(op.btnText + op.text1),
					"text2": $.filterXSS(op.pageText2 || op.text2),
					"btnText": $.filterXSS(op.btnText),
					"url": "javascript:;",
					"iframe": window != top ? 'target="_parent"' : ""
				});
				this.$mod.append(tpl);
			},
	
			fixStyle: function() {
				if (($.os.android && window.screen.width > 480) || ($.os.iphone && window.screen.width <= 320)) {
					this.$box.addClass("tvp_fixRight");
				}
				if(this.op.appName && this.op.logoClass){
					this.$box.addClass(this.op.logoClass);
				}
				// 如果下载banner跟屏幕宽度一样，缩小30px，防止贴边了
				// 只针对在播放器下的banner，排除暂停banner
				if(this.$text1.length===0 
					&& this.$btn.width() === window.innerWidth ){
					this.$btn.css({
						width: (this.$btn.width()-30) + 'px',
						margin: '0 auto'
					});
				}
			},
	
			report: function(action) {
				var self = this;
				var op = this.op;
				//新boss上报
				var int5 = op.reportParams ? op.reportParams.int5 : 0;
	
				var newop = {
					cmd: action == 0 ? 3534 : 3535,
					vid: op.vid,
					//别名：appid业务id
					appId: op.appId,
					//业务内容id
					contentId: op.contentId,
					val:op.contentType,
					//测速单位毫秒
					speed: self.info.speed,
					//是结束还是暂停
					int5: int5 || 0,
					//打开安装升级
					ctype: self.info.hasApp,
					//安装的渠道号
					int6: op.promotionId || 140,
					//uv统计
					str7:$.getUrlParam('mmuin'),
					//网络类型
					str8:op.t?op.t.config.nettype:0,
					_: new Date().getTime()
	
				};
				tvp.report(newop);
			},
	
			/**
			 * 下载步骤上报
			 * @param  {[type]} step   [description]
			 * @param  {[type]} config [description]
			 * @return {[type]}        [description]
			 */
			stepReport: function(step, config) {
				var self = this;
				if(!self.info.hasApp){
					return;
				}
				var op = {
					cmd : 3537,
					int5 : step,
					str4 : 3,
					str8 : $.getUrlParam('mmuin'),
					val : 1
				};
				var t = config.t;
				op.int6 = this.getCurPromotionId(config);
				tvp.app.report(op, t);
			},
			/**
			 * 获取当前下载文件的渠道号
			 */
			getCurPromotionId: function(config){
				var id;
				var t = config.t;
				// if(tmpDownloadInfo && tmpDownloadInfo.downloadUrl){
				// 	id = tvp.$.getUrlParam('confid',tmpDownloadInfo.downloadUrl);
				// }
				if(!id && config.downloadBtn){
					id = config.downloadBtn.attr('data-promotionId');
				}
				if (!id && t && t.AppBanner && t.AppBanner.op) {
					id = t.AppBanner.op.promotionId;
				}
				return id || 140;
			},
			/**
			 * 拿到检测结果后修改相关文字和链接
			 */
			showtips: function() {
				var op = this.op;
				var info = this.info;
				info.hasApp > 0 ? op.btnText = op.btnTexts[info.hasApp] : "";
				op.text1 = op.btnText + op.text1;
				this.$text1.text(op.text1);
				this.$btnText.text(op.btnText);
				this.$btn.attr('href', info.url);
				this.$btn.attr('data-url', info.openUrl);
				//isAutoReport设置为true时认为一旦创建完毕就上报,默认为true
				if (op.isAutoReport) {
					this.report(0);
				}
				//如果是打开则显示绿色
				if (info.hasApp == 1) {
					this.fixDownloadStatus(5);
				}
			},
			/**
			 * 改变banner 打开/下载文字
			 * @param  {[type]} flag [description]
			 * @return {[type]}      [description]
			 */
			rewriteText:function(flag){
				var op = this.op,
					text = flag?op.btnTexts[1]:op.btnTexts[0],
					$text1 = this.$text1,
					$btnText = this.$btnText;
				$text1.html(text+op.text1);
				$btnText.html(text);
			},
			
			/**
			 * 修正下载过程中的文案
			 * @param {Number} 下载状态值
			 */
			fixDownloadStatus : function(type) {
				var name = "下载";
				switch(type) {
					case 1 :
						name = "下载";
						this.$btn.attr('data-status', 'down');
						break;
					case 2 :
						name = "正在下载";
						this.$btn.attr('data-status', 'downloading');
						if($.browser.MQQClient) {
							this.$box.addClass('tvp_promote_banner_noauto');
						}
						break;
					case 3 :
						name = "继续下载";
						this.$btn.attr('data-status', 'pause');
						break;
					case 4 :
						name = "安装";
						this.$btn.attr('data-status', 'install');
						break;
					case 5 :
						name = "打开";
						this.$btn.attr('data-status', 'open');
						// 设置打开链接
						this.$btn.attr('href', this.$btn.attr('data-url'));
						this.$progress.css('width', '100%');
						break;
				}
				name += "腾讯视频，观看更多";
				if(type > 1 && this.op.isResetWords) {
					this.$btnText.html(name);
				}
				else if(type === 1){
					this.$btnText.html(this.op.btnText);
				}
			},
			/**
			 * 绑定下载按钮的上报和下载器事件
			 */
			bindTap: function() {
				var self = this;
				var op = this.op;
				this.$btn.on($.os.hasTouch ? 'touchend' : 'click', function(e) {
					self.report(1);
					self.stepReport(7, op);
				});
	
				if(self.info.hasApp==1){
					return;
				}
	
				//绑定伪协议拉起app
				if(tvp.app.bindTryOpenAppBanner){
					tvp.app.bindTryOpenAppBanner(self);
				}				
	
				//andriod没有传入渠道号或者没有传入下载地址都走默认地址
				if($.os.android && !op.downloadUrl){
					op.downloadUrl = tvp.app.getDownloadUrl(false,op.appName);
				}
	
				//只微信才需要md5
				//$.browser.WeChat &&
				if($.os.android){
					tvp.app.getAppMd5(op.promotionId,op.appName).done(function(json){
						if(json && json.md5){
							op.md5 = json.md5;
							json.url?op.downloadUrl = json.url:"";
							//此处要重设一下下载地址
							json.url && self.$btn.attr('href', json.url);
							_cb();
						}
					});
				}
				// else{
				// 	op.md5 = 1;
				// 	_cb();
				// }
			
	
				function _cb(){
					tvp.app.checkCanDownloader(self.info.hasApp, op, {
						t:op.t,
						// 调用下载器的实例对象
						downloadInstance : self,
						downloadBox: self.$box,
						downloadBtn: self.$btn,
	                    downloadProgress:self.$progress,
						downloaderCallback: op.downloaderCallback,
						//下载器生效范围
						range: op.range,
						appName:op.appName,
						downloadMd5: op.md5
					});
					$.each(['tvp:appdownload:downloading','tvp:appdownload:complete','tvp:appdownload:fail','tvp:appdownload:pause','tvp:appdownload:afterInstall'],function(key,evtName){
						self.$btn && $.isFunction(self.$btn.on) && self.$btn.on(evtName,function(){
							op.t.$video && $.isFunction(op.t.$video.trigger) && op.t.$video.trigger(evtName);
						});
					});
				}
	
			},
			/**
			 * 页面调用时没有传入text的话则从server拉取覆盖
			 */
			// fixText: function() {
			// 	var self = this;
			// 	$.ajax({
			// 		url: "http://sns.video.qq.com/fcgi-bin/dlib/dataout_ex?auto_id=906",
			// 		data: {
			// 			vid: self.op.vid,
			// 			otype: 'json'
			// 		},
			// 		dataType: "jsonp"
			// 	}).done(function(data) {
			// 		if (data && data.text2) {
			// 			self.op.text2 = data.text2;
			// 			self.$text2.html(data.text2);
			// 		}
			// 	})
			// },
			// loadTextAndUrl:function(op){
			// 	var defer = $.Deferred();
	
			// },
			checkDoQQliveConfig:function(appid){
				var arr = [tvp.APPID.wechatPublic];
				if(arr.indexOf(appid)>-1){
					return true;
				}
				return false;
			},
			fixTextAndUrl:function(op){
				//检测是否需要拉取qqlive配置
				var doQQliveConfig = this.checkDoQQliveConfig(op.appId);
				if(!doQQliveConfig){
					return;
				}
				//非视频app不处理
				if(op.appName!==tvp.app.config.defaultName){
					return;
				}
				//直播没有配置文案和跳转方式
				if(op.lid || !op.vid){
					return;
				}
				
				var indexUrl = 'http://v.qq.com/json/tvp/appbanner/index/'+op.vid.substr(0,1)+'.js';
				indexUrl += '?time='+new Date().valueOf();
				var detailUrl = 'http://v.qq.com/json/tvp/appbanner/'+op.vid+'.js';
				detailUrl += '?time='+new Date().valueOf();
				var self = this;
				var defer = $.Deferred();
				
				$.ajax({
					url:indexUrl,
					dataType:'jsonp',
					jsonpCallback:'appbannerCallback'
				}).done(function(rs){
					var flag = false;
					if($.isArray(rs) && rs.indexOf && rs.indexOf(op.vid)>-1){
						flag = true;
					}
					defer.resolve(flag);
				});
				defer.done(function(flag){
					if(!flag){
						return;
					}
					$.ajax({
						url:detailUrl,
						dataType:'jsonp',
						jsonpCallback:'appbannerDetailCallback'
					}).done(function(data){
						if(!data){
							return;
						}
						//覆盖第二行文字
						if (!op.pageText2 && data.text2) {
							self.op.text2 = data.text2;
							self.$text2.html(data.text2);
						}
	
						//覆盖第一行文字
						if(data.text1 && data.text1.substr(0,2)!==defaultConfig.btnTexts[0] && data.text1.substr(0,2)!==defaultConfig.btnTexts[1]){
							self.op.text1 = data.text1;
							self.$text1.html(data.text1);						
						}
	
						if(!data.type){
							return;
						}
	
						//页面如果传入了好莱坞参数
						if(op.pay && op.cid){
							return;
						}
	
						//fix url
						var params = {
							appName:op.appName,
							openType:parseInt(data.type)
						};	
	
						//付费的就不用处理了
						// if(params.openType == 4){
						// 	self.noTryOpen = true;
						// }
	
						switch (params.openType) {
							//专辑详情页
							case 6:
								params.cid = data.jumpid;
								params.vid2 = data.vid2
								break;
							//自定义打开地址
							case 5:
								params.openUrl = data.url;
								break;
							//好莱坞付费
							case 4:
								params.cid = data.jumpid;
								params.pay = true;
								break;
							//极目专题页
							case 3:
								params.tid = data.tid;
								break;
							//全屏播放
							case 2:
								params.vid = data.vid2 || op.vid;
								break;	
							//单视频详情
							case 1:
								params.vid = data.vid2 || op.vid;
								break;																				
						}				
						
						tvp.app.check(op).done(function(rs) {
							params.version = rs.version;
							var openUrl = tvp.app.getOpenUrl(params);
							if(!openUrl){
								return;
							}						
							self.$btn.attr('data-url', openUrl);
							if(rs.hasApp==1){
								self.$btn.attr('href', openUrl);
							}
							//是好莱坞付费且是iphone
							else if($.os.iphone && params.pay &&params.cid){
								self.$btn.attr('href', openUrl);
							}
						});							
						
					});
				});
			}
		});
	
	
		$.extend($, {
			createAppBanner: function(config) {
				config.appId = config.appId || config.appid;
				if(!config.appId && config.t && config.t.config){
					config.appId = config.t.config.appid || config.t.config.appId;
				}
				config.promotionId = config.promotionId || 140;
				var defer = $.Deferred();
				var banner = new AppBanner(config);
				//把下方banner实例保存住方便其它地方使用
				if (config.t && config.appBannerType == 1) {
					config.t.AppBanner = banner;
				}
				banner.fixResult().done(function() {
					banner.stepReport(6, config);
					defer.resolve(banner);
				});
				return defer;
			}
		});
	})(tvp, tvp.$);
	
	
	;
	(function(tvp, $) {
		$.extend(tvp.Player.fn, {
			/**
			 * 创建腾讯视频App下载banner
			 */
			buildAppBanner: function(config) {
				// disable for windows phone
				if(tvp.$.browser.IEMobile){
					return;
				}
	
				//不支持app的平台
				if( !tvp.app || !tvp.app.isSupportApp){
					return;
				}
	
				//如果配置了关注
				if(this.config.plugins && this.config.plugins.AppFollow){
					//根据用户名灰度
					// var uin = '';
					// var enable = false;
					// if ($.browser.WeChat) {
					// 	uin = $.getUrlParam('mmuin');
					// }
					// if ($.browser.MQQClient) {
					// 	uin = tvp.common.getUin();
					// }
					// uin = uin.toString();
					// if(uin && uin.length>2 && (uin[uin.length-3]==2 || uin[uin.length-3]==7)){
					// 	enable = true;
					// }
					// if($.getUrlParam('testUin')==1){
					// 	enable = true;
					// }	
					// //如果没获取到uin 或者不在灰度范围内
					// if(enable){
					// 	return;
					// }
					return;							
				}
	
	
				var t = this,
					$mod = t.$mod,
					$videomod = $(t.videomod),
					modId = "mod_down_" + t.playerid;
				if (t.AppBanner) {
					return;
				}
				$mod.append('<div id="' + modId + '"></div>');
				$videomod.bind('tvp:resize',function(){
					$mod.find("#"+modId).width($.formatSize(config.width || t.config.width));
				});
				//增高外层mod
				//$mod.css('min-height',parseInt($mod.height()) + 65);
				$videomod.trigger('tvp:resize');
				
				config = $.extend(config, {
					t: t,
					//标识是下方banner
					appBannerType: 1,
					modId: modId,
					vid: t.curVideo.getVid(),
					//下载banner的app名字
					appName:config.appName,
					openId:config.openId,
					extraApp:config.extraApp,
					text2: config.text || config.downloadText,
					appId: t.config.appid || t.config.appId,
					contentId: t.config.contentId,
					contentType:t.config.contentType||window.newsType ||0,
					isResetWords : true,
					isAutoReport: true
				});
				$.createAppBanner(config);
			}
		});
	})(tvp, tvp.$);
	/**
	 * @fileOverview  腾讯视频移动端暂停/结束时显示App下载提示banner(需要自定义皮肤)
	 * @author jarvanxing
	 * @copyright TencentVideo Web Front-end Team
	 */
	
	
	;
	(function(tvp, $) {
		var defaultConfig = {
			pluginName: 'AppBannerOnPause',
			pauseClass:'tvp_onpause',
			// 默认开启手Q和微信的下载器
			// 需要配合一下3个参数：downloader,range,downloaderCallback
			downloader: true,
			range: [1,2],
			// downloaderCallback: 'transferDownloadState',
			bannerTpl: [
				'<div style="z-index:10" data-role="appbannerbox" class="tvp_app_download_onpause" style="display:none">',
				'   <a data-action="applink" data-role="appbannerlink" class="tvp_download_app" href="${url}" ${iframe}>',
				'		<i class="tvp_icon_logo"></i>',
				'		<span class="tvp_download_app_wording">',
				'			<span data-role="appbannertext1" class="tvp_download_app_title">${text1}</span>',
				'			<span data-role="appbannertext2" class="tvp_download_app_desc">${text2}</span>',
				'		</span>',
				'		<span class="tvp_btn_download_btn" data-role="appbannerbox">',
				'			<i class="tvp_btn_progress" data-role="appbannerbtnprogress" style="width:0px"></i>',
				'			<span data-role="appbannerbtntext" class="tvp_btn_download_btn_text">${btnText}</span>',
				'		</span>',
				'	</a>',
				'</div>'
			].join('')
		};
	
		function AppBannerOnPause(op) {
			this.userop = op;
			var newop = $.extend({}, defaultConfig, op);
			this.op = newop;
			this.init(newop);
			return this;
		}
	
		$.extend(AppBannerOnPause.prototype, {
			init: function(op) {
				var t = op.t,
					self = this;
				this.op = $.extend(op, {
					$mod: t.$UILayer,
					eventType: 'pause',
					//ios直接从全屏切回普通状态时，currentTime总是为0,
					//此处自己根据timeupdate记录当前播放时间							
					currentTime: 0,
					pausetime: op.pausetime ? parseInt(op.pausetime) : 5
				});
	
				$.when(self.getCss(), self.getAppBanner()).done(function() {
					self.fillBanner();
				});
			},
			fixUI: function() {
				var op = this.op;
				var t = op.t;
				var $mod = op.$mod;
			},
	
			checkShow:function(){
				var self = this,
					op = this.op,
					t = op.t,
					$video = t.$video,
					$videotag = $video[0],				
					duration = parseInt(t.getDuration(),10),
					curTime = parseInt(Math.max(op.currentTime,$videotag.currentTime),10);
				tvp.debug('curTime:' + curTime);
				tvp.debug('duration:' + duration);
				tvp.debug('op.pausetime:' + op.pausetime);
				//默认前5s和最后5s不出暂停
				if (curTime > op.pausetime && (duration - curTime) > 5) {
					return true;
				}
				else {
					return false;
				}
			},
	
			initEvent: function() {
				var self = this,
					op = this.op,
					t = op.t,
					$video = t.$video,
					$videotag = $video[0],
					$mod = op.$mod,
					hideTimer = null,
					$play = $mod.find(tvp.html5skin.elements.play);
				function hide(){
					clearTimeout(hideTimer);
					self.fixShow(0);
					t.showControl && t.showControl();
					t.control && $.isFunction(t.control.beginHide) && t.control.beginHide(5e3);
				}
				
				function showRecommend(){
					// ios下，点击暂停，立即出现下载banner后会触发打开腾讯视频的bug
					var showAfterTime = $.os.ios ? 400 : 30;
					setTimeout(function(){
		            	if($videotag.paused && self.checkShow()){
		            		self.fixShow(1);
	            		}
	            	},showAfterTime);
				}
				this.AppBanner.$btn.on('touchend',function(){
					clearTimeout(hideTimer);
				});
				//暂停就出现
				$video.on('pause paused', function(e) {
					var isTouching = t.instance 
						&& t.instance.control
						&& t.instance.control.isTouching;
					//如果当前是正在拖动控制栏，也会触发pause
					if ( !! isTouching) {
						return;
					}
	            	showRecommend();
				});
					
	            //ios在非用户主动触发暂停结束事件时会自动把currentTime设为0.......
	            //此处把播放时间存储起来
				$video.on('timeupdate', function() {
					if ($videotag.currentTime) {
						op.currentTime = $videotag.currentTime;
					}
				});
	
				//播放中隐藏banner
				$video.on('play playing', function() {
					clearTimeout(hideTimer);
					self.fixShow(0);
				});
	
			},
	
	
			fixShow: function(isShow) {
				tvp.debug('call fixShow:' + isShow);
				var self = this,
					op = this.op, 
					$mod = op.$mod;
				if(typeof op.t.hasDurationLimit == 'function' && op.t.hasDurationLimit()){//如果当前有限播，就不出暂停banner了
					return ;
				}
				if (isShow) {
					$mod.addClass(op.pauseClass);
					//此时appbanner才显示,则进行曝光上报
					if (self.AppBanner) {
						self.AppBanner.report(0);
					}
	
					//延迟0.5s后设置真实url,免得点击控制栏时重叠触发
					if($.os.android && this.AppBanner && this.AppBanner.$btn){
						var btn = this.AppBanner.$btn,
							url = btn.attr('href');
						btn.attr('href','javascript:;');
						setTimeout(function(){
							btn.attr('href',url);
						},500);
					}
				} else {
					$mod.removeClass(op.pauseClass);
				}
				if($.browser.MQQ && $.browser.version >= 5.4){
					if(isShow){
						op.t.hidePlayer();
					}
					else{
						op.t.showPlayer();
					}
				}
			},
	
			/**
			 * 加载插件css
			 * @return defer
			 */
			getCss: function() {
				var defer = $.Deferred();
				$.loadPluginCss(defaultConfig.pluginName).done(function() {
					defer.resolve();
				});
				return defer;
			},
	
			/**
			 * 加载appBanner插件
			 * @return defer
			 */
			getAppBanner: function() {
				var t = this.op.t;
				var url = t.config.libpath + t.config.pluginUrl['AppBanner'];
				var defer = $.Deferred();
				if ($.createAppBanner) {
					defer.resolve();
				} else {
					$.getScript(url, function() {
						defer.resolve();
					});
				}
				return defer;
			},
	
			/**
			 * 初始化banner并执行回调
			 */
			fillBanner: function() {
				var self = this;
				var op = this.op;
				var params = $.extend({}, self.userop, {
					//禁止appbanner插件使用自己默认的style
					style: 'none',
					//禁止appbanner自动上报曝光
					isAutoReport: false,
					//区分是微信暂停推荐
					reportParams: {
						//int2: 2,
						int5: 2
					},
					t: op.t,
					vid: op.vid,
					tpl: op.bannerTpl,
					btnText : "下载",
					mod: op.$mod
				});
				$.createAppBanner(params).done(function(banner) {
					self.AppBanner = banner;
					self.fixUI();
					self.initEvent();
				});
	
			}
		});
	
		$.extend($, {
			createAppBannerOnPause: function(config) {
				var defer = $.Deferred(),
					appBannerOnPause = new AppBannerOnPause(config);
				defer.resolve(appBannerOnPause);
				return defer;
			}
		});
	
	})(tvp, tvp.$);
	
	
	;
	(function(tvp, $) {
		$.extend(tvp.Player.fn, {
			/**
			 * 创建腾讯视频暂停后的banner提示
			 */
			buildAppBannerOnPause: function(config) {
				// disable for windows phone
				if(tvp.$.browser.IEMobile){
					return;
				}
				//disable for flash
				if (this.flashobj) {
					return;
				}
				//不支持app的平台
				if (tvp.app && !tvp.app.isSupportApp) {
					return;
				}
				// disable for mp4link
				if (!this.$videomod) {
					return;
				}
	
				//andriod下qq浏览器自带皮肤,微信里的手Q浏览器特殊处理
				if ($.os.android && $.browser.MQQ && !$.browser.WeChat) {
					return;
				}
	
				//此插件仅对自定义皮肤的有效
				if(!this.config.isHtml5UseUI){
					return;
				}
	
				var me = this,
					cfg = $.extend({}, config || {}, {
						t: me,
						vid: me.curVideo.getVid(),
						lid: me.curVideo.getChannelId()
					});
				$.createAppBannerOnPause(cfg);
			}
		});
	})(tvp, tvp.$);
	/**
	 * @fileOverview  腾讯视频移动端暂停/结束时显示App下载提示banner和微信推荐视频
	 * @author jarvanxing
	 * @copyright TencentVideo Web Front-end Team
	 */
	
	
	;
	(function(tvp, $) {
		var defaultConfig = {
			pluginName : 'AppRecommend',
			text1 : "查看公众号更多视频",
			picCgi : 'http://like.video.qq.com/fcgi-bin/rmd_mobile',
			navCurrentClass : 'current',
			// 默认开启手Q和微信的下载器
			// 需要配合一下3个参数：downloader,range,downloaderCallback
			downloader: true,
			range: [1,2],
			downloaderCallback: 'transferDownloadState',
			tpl : [
				'<div style="display:none;" data-role="relatebox" class="tvp_related" id="${relateid}">',
				'   <div data-role="relatemove" class="tvp_related_inner">',
				'		<% for(var i=0;i<list.length;i++) {%>',
				'			<% if(i==0) {%>',
				'			<ul class="${listclass}">',
				'			<% }%>',
				'			<% if(i>0 && i%3==0) {%>',
				'			</ul>',
				'			<ul class="${listclass}">',
				'			<% }%>',
				'			<li class="tvp_item">',
				'				<a data-action="applink" ${iframe} data-role="relatelink" data-url="#" href="#" data-vid="<%=list[i].id%>" class="tvp_related_link"><img class="tvp_figure" src="<%=list[i].picurl%>" /><strong class="tvp_title"><%=list[i].title%></strong></a>',
				'			</li>',
				'			<% if(i==list.length-1) {%>',
				'			</ul>',
				'			<% }%>',
				'		<% }%>',
				'   </div>',
				'	<% if(list.length>3) {%>',
				'	<div class="tvp_related_nav">',
				'	<% for(var i=0;i<list.length;i++) {%>',
				'		<% if(i%3==0) {%>',
				'			<i data-role="relatetrigger" class="dot"></i>',
				'		<% }%>',
				'	<% }%>',
				'   </div>',
				'	<% }%>',
				'</div>',
				'{downloadLayer}',
				'<div style="display:none;" data-role="replay" class="tvp_replay"><i class="tvp_icon_replay"></i>重新播放</div>'
			].join(''),
			bannerTpl : [
				'<div data-role="appbannerbox" class="tvp_app_download" style="display:none">',
				'   <a data-action="applink" data-role="appbannerlink" class="tvp_download_app" href="${url}" ${iframe}>',
				'		<i class="tvp_icon_logo"></i>',
				'		<span class="tvp_download_app_wording"><span class="tvp_download_app_title" data-role="appbannertext1">${text1}</span><span data-role="appbannertext2" class="tvp_download_app_desc">${text2}</span></span>',
				'		<span data-role="appbannerbtntext" class="tvp_app_btn_em">${btnText}</span>',
				'	</a>',
				'</div>'
			].join(''),
			downLoadLayer : '<div class="tvp_download_layer" data-role="download-layer" style="display:none;">\
								<div class="tvp_promote_text" data-role="promote-text">正在下载腾讯视频，马上就能观看哟</div>\
								<div class="tvp_promote_download" data-status="downloading">\
									<div class="tvp_promote_progress" data-role="appbannerbtnprogress"></div>\
								</div>\
								<div class="tvp_dowanload_finish tvp_none" data-role="finish">\
									<span class="tvp_icon_finish"></span>\
									<span class="tvp_btn">下载已完成，点击安装</span>\
								</div>\
							</div>',
			 installedTips : '<div class="tvp_install_success">\
										<div class="tvp_tips">安装已完成，<br>点击可直接播放</div>\
										<span class="tvp_arrow"></span>\
									</div>'	
		};
		var hasApp = false;
	
		function AppRecommend(op) {
			this.userop = op;
			var newop = $.extend({}, defaultConfig, op);
			this.op = newop;
			this.init(newop);
			return this;
		}
	
	
		$.extend(AppRecommend.prototype, {
			init : function(op) {
				var t = op.t;
				var self = this;
				this.op = $.extend(op, {
					$mod : t.$UILayer || t.$videomod,
					currentIndex : 0,
					relateid : "tvp_related_" + t.playerid,
					eventType : $.os.hasTouch ? 'touchend' : 'click',
					//ios直接从全屏切回普通状态时，currentTime总是为0,
					//此处自己根据timeupdate记录当前播放时间				
					currentTime : 0,
					replayClicked : false,
					//拿到推荐列表后返回的算法id参数,好上报
					tjReportParams : "",
					//滑动，记录哪些条目已经上报曝光过了
					tjReportFlag : [],
					//是否是微信中嵌入iframe的情况
					isWechatIframe : (op.type == 2 ? true : false),
					//微信推荐热门视频vid集合
					vidArray : []
				});
				//拿到微信url中的账号相关参数
				this.fixParams(op);
	
				this.initFirstEvent(op).done(function() {
					//只有拿到推荐数据才处理
					self.getList(op).done(function(dataList) {
						if(dataList) {
							$.loadPluginCss(defaultConfig.pluginName).done(function() {
								self.initRoles(dataList);
								self.fixVideoUrl(op);
								self.fixVideoUrlEvent(op);
								self.initEvent(op);
								// if (op.isWechatIframe) {
								// 	self.fillBanner(op);
								// }
							});
						}
					});
				});
	
			},
	
			initRoles : function(dataList) {
				this.fixUI();
				var op = this.op;
				var $mod = op.$mod;
				var tpl = defaultConfig.tpl;
				var listclass = 'tvp_related_list tvp_related_list_v2';
				// if (op.isWechatIframe) {
				// 	listclass = 'tvp_related_list';
				// }
				tpl = tpl.replace('{downloadLayer}',defaultConfig.downLoadLayer);
				//先替换样式
				tpl = $.formatTpl(tpl, {
					relateid : op.relateid,
					listclass : listclass,
					//listitem: dataHtml,
					iframe : window != top ? 'target="_parent"' : ""
				});
	
				//再替换数据
				var render = $.tmpl(tpl);
				var html = render({
					"list" : dataList
				});
	
				$mod.append(html);
				this.$relateBox = $mod.find('[data-role=relatebox]');
				this.$replay = $mod.find('[data-role=replay]');
				this.$links = $mod.find('[data-role=relatelink]');
				this.$triggers = $mod.find('[data-role=relatetrigger]');
				this.$mover = $mod.find('[data-role=relatemove]');
	
				//为了解决android下的样式问题
				this.$lists = $mod.find('.tvp_related_list');
				// this.$lists.width($mod.width());
	
				this.fixTrigger();
				if(op.t.$mod && $.isFunction(op.t.$mod.children) && op.t.$mod.children().size() == 2){ //如果页面本身有下载banner就不需要出现结束推荐的下载状态了
					return ;
				}
				var $downloadLayer = $mod.find('div.tvp_download_layer'),
					$downloadFinish = $downloadLayer.find('.tvp_dowanload_finish');
				op.t.$video.on('tvp:appdownload:downloading',function(){
					$downloadFinish.addClass('tvp_none');
					$downloadLayer.find('.tvp_promote_download').attr('data-status','downloading');
					$downloadLayer.show();
				}).on('tvp:appdownload:complete',function(){
					$downloadFinish.removeClass('tvp_none');
	
					if($.downloadClick_wechat){
						$.downloadClick_wechat.bindDownloader($downloadFinish.find('.tvp_btn'));
					}
					else if($.downloadClick_mqq){
						$.downloadClick_mqq.bindDownloader($downloadFinish.find('.tvp_btn'));
					}
					op.t.$video.one('tvp:appdownload:afterInstall',function(){
						var $container = $downloadLayer.parent();
						$downloadLayer.hide();
						$container.append(defaultConfig.installedTips);
						$container.find('.tvp_install_success').one('click',function(){
							$container.find('.tvp_install_success').remove();
						});
						setTimeout(function(){
							$container.find('.tvp_install_success').remove();
						},3000);
					});
					$downloadLayer.show();
				}).on('tvp:appdownload:fail',function(){
					$downloadLayer.hide();
				}).on('tvp:appdownload:pause',function(){
					$downloadLayer.find('.tvp_promote_download').attr('data-status','pause');
				});
			},
	
			//没有用h5皮肤时
			fixUI : function() {
				var op = this.op;
				var t = op.t;
				var $mod = op.$mod;
				if(!t.$UILayer) {
					$mod.addClass('tvp_container');
					var shadow = $mod.find('.tvp_shadow');
					if(!shadow.length) {
						shadow = $('<div class="tvp_shadow"></div>').appendTo($mod);
						shadow.hide();
					}
					this.$shadow = shadow;
				}
			},
	
			fixShow : function(isShow) {
				var self = this;
				var op = this.op;
				var t = op.t;
				var $mod = op.$mod;
				var $shadow = this.$shadow;
				var $relateBox = this.$relateBox;
				var $replay = this.$replay;
				var $videotag = op.t.$video[0];
				if(typeof op.t.hasDurationLimit == 'function' && op.t.hasDurationLimit()) {//如果当前有限播，就不出了
					return;
				}
				if(isShow) {
					t.hidePlayer($videotag);
					//没有用h5皮肤时
					if(!t.$UILayer) {
	
						$mod.addClass('tvp_finished');
						$shadow.show();
					} else {
						t.hideControl();
						//self.fixControl(1);
					}
	
					$relateBox.show();
	
					$replay.show();
					//广告显示出来上报,结束的时候会同时触发(end和pause事件,为避免多次上报,此处加个标识)
					if(op.vidArray.length > 0 && !self.hasReport) {
						self.hasReport = true;
						self.tjreport(op.vid, 0, op.vidArray.slice(0, 3));
						if(!op.isWechatIframe) {
							return;
						}
						//此时appbanner才显示,则进行曝光上报
						if(self.AppBanner) {
							self.AppBanner.report(0);
						}
					}
				} else {
					self.hasReport = false;
					if(!op.replayClicked) {
						$relateBox.hide();
						$replay.hide();
						t.showPlayer($videotag);
						//没有用h5皮肤时
						if(!t.$UILayer) {
							$mod.removeClass('tvp_finished');
							$shadow.hide();
	
						} else {
							//self.fixControl(0);
						}
	
					}
				}
			},
	
			getList : function(op) {
				var defer = $.Deferred();
				var self = this;
				var cgi = defaultConfig.picCgi;
				var params = {
					otype : 'json',
					size : op.size || 9,
					id: op.vid
				};
				if(op.isWechatIframe) {
					cgi = 'http://like.video.qq.com/fcgi-bin/rmd_weixin';
					cgi = 'http://like.video.qq.com/fcgi-bin/like';
					params = $.extend(params, {
						uin: 0,
						playright: 2,
						pidx: 0,
						msgtype: 59,
						tablist: 10,
						account: 'MjM5MjMwMzA0MA==',
					});
				} else {
					params = $.extend(params, {
						tablist : 9,
						playright : 7
					});
				}
	
				//有些android机器uc/qq浏览器滑动有问题,本次版本暂时屏蔽		
				if($.os.android && !($.browser.WeChat || $.browser.MQQClient)) {
					params.size = 3;
				}
	
				$.ajax({
					url : cgi,
					data : params,
					dataType : "jsonp",
					jsonCache : 600
				}).done(function(json) {
					//为了得到上报时需要的cgi算法参数
					op.tjReportParams = json;
					var data = false;
					var cgiError = false;
	
					//for rmd_mobile
					if(cgi.indexOf('rmd_mobile') !==-1 
						&& json 
						&& json.tablist 
						&& json.tablist.length){
						$.each(json.tablist, function(i, o) {
							if(o.tabid == 9) {
								op.tjReportParams = o;
								data = o.cover_info;
								data = data.length ? data : false;
								return;
							}
						});
					}
					// for like cgi
					if(json 
						&& json.tablist 
						&& json.tablist.length === 1 
						&& json.tablist[0] 
						&& json.tablist[0].media_info
						&& json.tablist[0].media_info.length){
						data = json.tablist[0].media_info;
						op.tjReportParams = json.tablist[0];
					}
	
					if(data){
						$.each(data, function(i, obj){
							op.vidArray.push(obj.id);
							if(op.isWechatIframe){
								if(!obj.id || !obj.pic3url || !obj.title){
									cgiError = true;
									return true;
								}
								obj.picurl = obj.pic3url;
							}
						});
						if(cgiError){
							// defer.resolve([]);
						}else{
							defer.resolve(data);
						}
					}else{
						defer.resolve();
					}
				}).fail(function() {
					defer.resolve();
				});
	
				return defer;
			},
	
			/**
			 * [getAppBanner 加载appBanner,为能拿到appbanner里面判断app安装状态的方法]
			 * @return {[type]} [description]
			 */
			getAppBanner : function() {
				var t = this.op.t;
				var defer = $.Deferred();
				if($.createAppBanner) {
					defer.resolve();
				} else {
					var url = t.config.libpath + t.config.pluginUrl['AppBanner'];
					$.getScript(url, function() {
						defer.resolve();
					});
				}
	
				return defer;
			},
			fixUrl : function(url, vid) {
				if(vid) {
					url = url.replace('${vid}', vid);
				}
				return url + '&from=' + this.op.appmsgid + '&extend=' + this.op.biz;
			},
			/**
			 * [fixUrl 根据是否安装腾讯视频app处理推荐视频的链接]
			 * @return {[type]} [description]
			 */
			fixVideoUrl : function() {
				var self = this;
				var op = this.op;
				var $links = this.$links;
				var _op = $.extend({}, op);
				//此处为了获得打开地址的模板
				_op.vid = '';
				tvp.app.check(_op).done(function(rs) {
					if(rs && rs.url) {
						$links.each(function(i, o) {
							var vid = $(o).data('vid');
							o.href = self.fixUrl(rs.url, vid);
							$(o).attr('data-url', self.fixUrl(rs.openUrl, vid));
						});
						hasApp = rs.hasApp;
					}
				});
			},
			fixControl : function(isShow) {
				var op = this.op;
				var t = op.t;
				var _index = 5;
				var control = t.control.$control;
				//如果是全屏状态且使用伪全屏
				var state = t.instance.isFullScreen && t.config.isHtml5UseFakeFullScreen;
				var relateBox = this.$relateBox;
				if(isShow == 1 && state) {
					var index = relateBox.css('z-index');
					control.css('z-index', index + 1);
					t.showControl();
				}
				//控制栏恢复原状
				if(isShow !== 1) {
					control.css('z-index', _index);
				}
				//如果非全屏状态且结束推荐显示了出来
				if(isShow == 2 && relateBox.is('not:hidden')) {
					t.hideControl();
				}
			},
	
			fixVideoUrlEvent : function(op) {
				var self = this;
				var a = this.$links;
				//如果开启了下载器
				if(op.downloader) {
					this.$relateBox.attr('data-downloadurl', op.downloadUrl);
					if($.downloadClick_wechat && $.downloadClick_wechat.hasDownloader) {
						$.downloadClick_wechat.bindDownloader(this.$relateBox,'click');
						tvp.app.getAppMd5(op.promotionId || 236).done(function(json){
							if(json && json.md5){
								self.$relateBox.attr('data-downloadmd5', json.md5);
							}
						});
					}
					if($.downloadClick_mqq && $.downloadClick_mqq.hasDownloader) {
						$.downloadClick_mqq.bindDownloader(this.$relateBox,'click');
					}
				}
				a.on(op.eventType, function(e) {
					var vid = $(e.currentTarget).data('vid');
					self.tjreport(op.vid, 1, vid);
				});
			},
	
			//推荐上报
			tjreport : function(vid, action, _vid) {
				var op = this.op;
	
				function getItype() {
					var rs = 0;
					if($.browser.WeChat) {
						rs = 2;
					}
					if($.browser.MQQClient) {
						rs = 4;
					}
					return rs;
				}
	
				var int1 = 0,
					int2 = 0,
					int3 = 0,
					int4 = 0,
					int5 = 0,
					itype = getItype(),
					ctype = 0,
					val2 = 0;
				//微信热门
				if(op.isWechatIframe) {
					int1 = op.tjReportParams && op.tjReportParams.int1 ? op.tjReportParams.int1 : 640000;
					ctype = 10;
					val2 = op.tjReportParams && op.tjReportParams.tab_id ? op.tjReportParams.tab_id : 11;
				} else {
					int1 = op.tjReportParams && op.tjReportParams.algfilever ? op.tjReportParams.algfilever : int1;
					int2 = op.tjReportParams && op.tjReportParams.algver ? op.tjReportParams.algver : int2;
					int3 = op.tjReportParams && op.tjReportParams.algsubver ? op.tjReportParams.algsubver : int3;
					ctype = 13;
					val2 = op.tjReportParams && op.tjReportParams.tabid ? op.tjReportParams.tabid : 23;
				}
	
				int4 = tvp.common.getDeviceId();
				int5 = hasApp ? 1 : 0;
	
				tvp.report({
					vid : vid,
					itype : itype,
					ctype : ctype,
					cmd : action == 0 ? 1801 : 1802,
					int1 : int1,
					int2 : int2,
					int3 : int3,
					int4 : int4,
					int5 : int5,
					val : 1,
					str1 : op.biz,
					val2 : val2,
					host : $.getHost(),
					str2 : action == 0 ? _vid.join('+') : _vid,
					_ : new Date().getTime()
				});
			},
			/**
			 * 滑动时上报
			 * @return {[type]} [description]
			 */
			swipeReport : function(direction, toIndex) {
				var op = this.op;
				var tjReportFlag = op.tjReportFlag;
				var hasReport = false;
				var ids = 0;
				tvp.report({
					cmd : 3556,
					val : direction,
					val2 : toIndex
				});
	
				//首次已经上报过了
				if(toIndex == 0) {
					return;
				}
	
				ids = op.vidArray.slice(toIndex * 3, (toIndex + 1) * 3);
				$.each(tjReportFlag, function(i, obj) {
					if(obj == toIndex) {
						hasReport = true;
					}
				});
				if(!hasReport) {
					this.tjreport(op.vid, 0, ids);
					op.tjReportFlag.push(toIndex);
				}
	
			},
	
			/**
			 * [fixParams 拿到公众账号id]
			 * @return {[type]} [description]
			 */
			fixParams : function() {
				var curl = window != top ? document.referrer : document.location.href;
				var op = this.op;
	
				function get(key) {
					var v = $.getUrlParam(key, curl);
					if(v) {
						v = decodeURIComponent(v);
						v = $.filterXSS(v);
					}
					return v;
				}
	
				op.biz = get('__biz');
				op.appmsgid = get('appmsgid');
	
			},
	
			move : function(direction) {
				var op = this.op,
					toIndex = 0,
					fromIndex = op.currentIndex,
					distance = 0,
					width = op.$mod.width(),
					length = Math.ceil(op.vidArray.length / 3) - 1;
				if(direction == 'left') {
					toIndex = fromIndex + 1;
				}
				if(direction == 'right') {
					toIndex = fromIndex - 1;
				}
	
				if(!direction) {
					toIndex = fromIndex;
				}
	
				this.swipeReport(direction, toIndex);
	
				if(toIndex < 0 || toIndex > length) {
					return;
				}
	
				distance -= toIndex * width;
	
				//tvp.log(distance);
	
				this.$mover.css({
					//"-webkit-transition": "0.5s ease-out",
					"-webkit-transform" : "translateX(" + distance + "px)"
				});
				op.currentIndex = toIndex;
				this.fixTrigger();
			},
	
			/**
			 * [fillBanner 初始化banner提示,for 微信+iframe]
			 * @return {[type]} [description]
			 */
			fillBanner : function(op) {
				var self = this;
				var params = $.extend({}, self.userop, {
					//禁止appbanner插件使用自己默认的style
					style : 'none',
					//禁止appbanner自动上报曝光
					isAutoReport : false,
					//区分是微信结束推荐
					reportParams : {
						//int2: 1,
						int5 : 1
					},
					t : op.t,
					vid : op.vid,
					tpl : defaultConfig.bannerTpl,
					modId : op.relateid
				});
				// if (op.isWechatIframe) {
				// 	params.text1 = defaultConfig.text1;
				// }
				this.getAppBanner().done(function() {
					$.createAppBanner(params).done(function(banner) {
						//把appbanner实例保存当当前apprecommend实例
						self.AppBanner = banner;
						var a = banner.$btn;
						var href = a.attr('href');
						a.attr('href', self.fixUrl(href));
					});
				});
			},
			fixTrigger : function() {
				if(this.$triggers.length) {
					var index = this.op.currentIndex,
						op = this.op;
					this.$triggers.removeClass(op.navCurrentClass).eq(index).addClass(op.navCurrentClass);
				}
			},
			initFirstEvent : function(op) {
				var t = op.t;
				var self = this;
				var $video = t.$video;
				var $videoTag = $video[0];
				var hasData = false;
				var defer = $.Deferred();
	
				$video.on('timeupdate', function() {
					//ios在非用户主动触发暂停结束事件时会自动把currentTime设为0.......
					if($videoTag.currentTime) {
						op.currentTime = $videoTag.currentTime;
					}
					if(!hasData && ((parseInt(t.getDuration()) - parseInt(op.currentTime)) < 7)) {
						hasData = true;
						defer.resolve();
					}
				});
				return defer;
			},
	
			/**
			 * 结束推荐滑动事件
			 */
			recommendSwipe: function(){
				var self = this;
				var isTouching =false, tx1 = 0, tx2 = 0,
					ty1 = 0, ty2 = 0;
				var elem;
				this.$relateBox.off('touchstart')
				.off('touchmove')
				.off('touchend')
				.on('touchstart', function(e){
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();
					isTouching = true;
					if(!(e && e.touches && e.touches.length)){
						return;
					}
					var evt = e.touches[0];
					elem = evt.target;
					tx1 = evt.pageX;
					ty1 = evt.pageY;
					return false;
				})
				.on('touchend', function(e){
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();
					return;
					if(!isTouching){
						return;
					}
					if(!(e && e.changedTouches && e.changedTouches.length)){
						return;
					}
					var evt = e.changedTouches[0];
					tx2 = evt.pageX, ty2 = evt.pageY;
					isTouching = false;
					var x = tx2-tx1, y = ty2 - ty1;
					var m = Math.max(Math.abs(x),Math.abs(y));
					var d = (Math.abs(x) > Math.abs(y))?x:y;
					if(m<25){
						// $(elem).trigger('click');
						// try{
						// 	evt.preventDefault();
						// 	evt.stopPropagation();
						// 	evt.stopImmediatePropagation();
						// }catch(e){tvp.log(e)}
						evt = null;
						e = null;
						return false;
					}
					if(d<0){
						self.move('left');
					}else{
						self.move('right');
					}
					return false;
				});
			},
	
	
			initEvent : function(op) {
				var t = op.t;
				var self = this;
				var $video = t.$video;
				var $videoTag = $video[0];
				var $replay = this.$replay;
	
				$replay.on(op.eventType, function(e) {
					op.replayClicked = true;
					setTimeout(function() {
						op.replayClicked = false;
						//$('body').append('<div>ended-PLAY</div>');
						//最后5s的话直接重新播放
						$videoTag.play();
						if((parseInt(t.getDuration()) - parseInt(op.currentTime)) < 6) {
							$videoTag.load();
						}
						$videoTag.play();
					}, 500);
				});
				$video.on('pause paused', function(e) {
					//$('body').append('<div>pause</div>');
					//如果当前是正在拖动控制栏，也会触发pause
					if(!!t.isTouching) {
						return;
					}
					var duration = parseInt(t.getDuration());
					var curTime = parseInt($.os.iphone ? op.currentTime : $videoTag.currentTime);
					//只有最后5s才显示广告
					if((duration - curTime) > 5) {
						self.fixShow(0);
						return;
					}
					// 点击暂停，立即出现结束推荐后会触发打开腾讯视频的bug
					setTimeout(function(){
						self.fixShow(1);
					}, 400);
				});
	
				$video.on('ended', function() {
					//$('body').append('<div>ended</div>');
					self.fixShow(1);
				});
	
				$video.on('play playing', function() {
					//$('body').append('<div>play</div>');
					self.fixShow(0);
				});
	
				this.$relateBox.on('swipeLeft', function(e) {
					e.preventDefault();
					self.move('left');
				});
	
				this.$relateBox.on('swipeRight', function(e) {
					e.preventDefault();
					self.move('right');
				});
	
				// this.recommendSwipe();
	
				// 监听结束推荐屏幕旋转的问题
				this.op.t.$mod
				.off('tvp:recommend:orientationchange')
				.on('tvp:recommend:orientationchange', function(){
					self.move();
					try{
						$(top).off('orientationchange.recommend');
					}catch(e){}
				});
				try{
					$(top).off('orientationchange.recommend')
					.on('orientationchange.recommend', function(){
						setTimeout(function(){
							self.move();
						},400);
					});
				}catch(e){}
	
				if(t.control) {
					var $control = t.control.$control;
					var $fullscreen = $control.find(tvp.html5skin.elements.fullscreen);
					$fullscreen.on(op.eventType, function() {
						//self.fixControl(2);
						//全屏切换时要重新设置下滑动内容的宽度
						// self.$lists.width(op.$mod.width());
						//重新定位下位移
						self.move();
					});
				}
	
			}
		});
	
		$.extend($, {
			createAppRecommend : function(config) {
				var defer = $.Deferred();
				var appRecommend = new AppRecommend(config);
	
				//把appRecommend实例保存住方便其它地方使用
				if(config.t) {
					config.t.AppRecommend = appRecommend;
				}
				defer.resolve(appRecommend);
				return defer;
			}
		});
	})(tvp, tvp.$);
	
	
	;
	(function(tvp, $) {
		$.extend(tvp.Player.fn, {
			/**
			 * 创建腾讯视频暂停/结束后的推荐视频和banner
			 */
			buildAppRecommend : function(config) {
				var self = this;
				//unable for flash
				if(this.flashobj) {
					return;
				}
				// disable for windows phone
				if(tvp.$.browser.IEMobile){
					return;
				}
				// unable for mp4link
				if(!this.$videomod) {
					return;
				}
				//不支持app的平台
				if(tvp.app && !tvp.app.isSupportApp) {
					return;
				}
				//检查是否是限播视频,如果是限播的话就不再显示结束推荐了
				setTimeout(function() {
					//这里限播实例挂载在内核上了
					if(self.instance && self.instance.DurationLimitInstance && self.instance.DurationLimitInstance.enable) {
						return;
					}
					config = config || {};
					config.t = self;
					config.vid = self.curVideo.getVid();
					$.createAppRecommend(config);
				}, 5000);
	
			}
		});
	})(tvp, tvp.$);
;

/**
 * 当前JS文件名
 * @type {String}
 */
tvp.filename = "tvp.player_v2_mobile.js"; //呵呵，这个为啥是通配符？在grunt里wrap的时候修改的，因为打包的多个JS版本每个JS的值都不一样，用于统计每个JS版本的引用次数


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