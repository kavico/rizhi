/* InstantClick 3.1.0 | (C) 2014-2015 Alexandre Dieulot | http://instantclick.io/license */

var instantClick
  , InstantClick = instantClick = function(document, location, $userAgent) {
  // Internal variables
  var $isChromeForIOS = $userAgent.indexOf(' CriOS/') > -1
    , $currentLocationWithoutHash
    , $urlToPreload
    , $preloadTimer
    , $lastTouchTimestamp
    , $preloadCacheTimeLimit = 30000 //how long to cache preloaded pages for
    , $preloadTimeDict = {} //dict of last time a url was preloaded
    , $xhrDict = {} //cache of preloaded xhr objects

  // Preloading-related variables
    , $history = {}
    , $xhr
    , $url = false
    , $title = false
    , $mustRedirect = false
    , $body = false
    , $timing = {}
    , $isPreloading = false
    , $isWaitingForCompletion = false
    , $trackedAssets = []

  // Variables defined by public functions
    , $preloadOnMousedown
    , $delayBeforePreload
    , $eventsCallbacks = {
        fetch: [],
        receive: [],
        wait: [],
        change: [],
        restore: []
      }


  ////////// HELPERS //////////


  function removeHash(url) {
    var index = url.indexOf('#')
    if (index < 0) {
      return url
    }
    return url.substr(0, index)
  }

  function getLinkTarget(target) {
    while (target && target.nodeName != 'A') {
      target = target.parentNode
    }
    return target
  }

  function isBlacklisted(elem) {
    do {
      if (!elem.hasAttribute) { // Parent of <html>
        break
      }
      if (elem.hasAttribute('data-instant')) {
        return false
      }
      if (elem.hasAttribute('data-no-instant')) {
        return true
      }
    }
    while (elem = elem.parentNode)
    return false
  }

  function isPreloadable(a) {
    var domain = location.protocol + '//' + location.host

    if (a.target // target="_blank" etc.
        || a.hasAttribute('download')
        || a.href.indexOf(domain + '/') != 0 // Another domain, or no href attribute
        || (a.href.indexOf('#') > -1
            && removeHash(a.href) == $currentLocationWithoutHash) // Anchor
        || isBlacklisted(a)
       ) {
      return false
    }
    return true
  }

  function triggerPageEvent(eventType, arg1, arg2, arg3) {
    var returnValue = false
    for (var i = 0; i < $eventsCallbacks[eventType].length; i++) {
      if (eventType == 'receive') {
        var altered = $eventsCallbacks[eventType][i](arg1, arg2, arg3)
        if (altered) {
          /* Update args for the next iteration of the loop. */
          if ('body' in altered) {
            arg2 = altered.body
          }
          if ('title' in altered) {
            arg3 = altered.title
          }

          returnValue = altered
        }
      }
      else {
        $eventsCallbacks[eventType][i](arg1, arg2, arg3)
      }
    }
    return returnValue
  }

  function changePage(title, body, newUrl, scrollY, pop) {
    document.documentElement.replaceChild(body, document.body)
    /* We cannot just use `document.body = doc.body`, it causes Safari (tested
       5.1, 6.0 and Mobile 7.0) to execute script tags directly.
    */
    if (newUrl) {
      if (location.href !== newUrl){
          history.pushState(null, null, newUrl)
      }
      var hashIndex = newUrl.indexOf('#')
        , hashElem = hashIndex > -1
                     && document.getElementById(newUrl.substr(hashIndex + 1))
        , offset = 0

      if (hashElem) {
        while (hashElem.offsetParent) {
          offset += hashElem.offsetTop

          hashElem = hashElem.offsetParent
        }
      }
      scrollTo(0, offset)

      $currentLocationWithoutHash = removeHash(newUrl)
    }
    else {
      scrollTo(0, scrollY)
    }

    if ($isChromeForIOS && document.title == title) {
      /* Chrome for iOS:
       *
       * 1. Removes title on pushState, so the title needs to be set after.
       *
       * 2. Will not set the title if it's identical when trimmed, so
       *    appending a space won't do; but a non-breaking space works.
       */
      document.title = title + String.fromCharCode(160)
    }
    else {
      document.title = title
    }

    instantanize()
    if (pop) {
      triggerPageEvent('restore')
    }
    else {
      triggerPageEvent('change', false)
    }
  }

  function setPreloadingAsHalted() {
    $isPreloading = false
    $isWaitingForCompletion = false
  }

  function removeNoscriptTags(html) {
    /* Must be done on text, not on a node's innerHTML, otherwise strange
     * things happen with implicitly closed elements (see the Noscript test).
     */
    return html.replace(/<noscript[\s\S]+?<\/noscript>/gi, '')
  }


  ////////// EVENT LISTENERS //////////


  function mousedownListener(e) {
    if ($lastTouchTimestamp > (+new Date - 500)) {
      return // Otherwise, click doesn't fire
    }

    var a = getLinkTarget(e.target)

    if (!a || !isPreloadable(a)) {
      return
    }

    preload(a.href)
  }

  function mouseoverListener(e) {
    if ($lastTouchTimestamp > (+new Date - 500)) {
      return // Otherwise, click doesn't fire
    }

    var a = getLinkTarget(e.target)

    if (!a || !isPreloadable(a)) {
      return
    }

    a.addEventListener('mouseout', mouseoutListener)

    if (!$delayBeforePreload) {
      preload(a.href)
    }
    else {
      $urlToPreload = a.href
      $preloadTimer = setTimeout(preload, $delayBeforePreload)
    }
  }

  function touchstartListener(e) {
    $lastTouchTimestamp = +new Date

    var a = getLinkTarget(e.target)

    if (!a || !isPreloadable(a)) {
      return
    }

    if ($preloadOnMousedown) {
      a.removeEventListener('mousedown', mousedownListener)
    }
    else {
      a.removeEventListener('mouseover', mouseoverListener)
    }
    preload(a.href)
  }

  function clickListener(e) {
    var a = getLinkTarget(e.target)

    if (!a || !isPreloadable(a)) {
      return
    }

    if (e.which > 1 || e.metaKey || e.ctrlKey) { // Opening in new tab
      return
    }
    e.preventDefault()
    display(a.href)
  }

  function mouseoutListener() {
    if ($preloadTimer) {
      clearTimeout($preloadTimer)
      $preloadTimer = false
      return
    }

    if (!$isPreloading || $isWaitingForCompletion) {
      return
    }
    
    $xhr.abort()
    setPreloadingAsHalted()
  }

  function cloneXhr(xhr) {
    var clone = {};
    var responseHeader = xhr.getResponseHeader('Content-Type')

    clone.isFromCache = true; //variable to identify cached Xhr
    clone.readyState = xhr.readyState;
    clone.status = xhr.status;
    clone.responseText = xhr.responseText;
    clone.getResponseHeader = function(arg) {
      return responseHeader;
    }

    return clone;
  }

  function readystatechangeListener(xhr) {
    if (xhr.readyState < 4) {
      return
    }
    if (xhr.status == 0) {
      /* Request aborted */
      return
    }

    $timing.ready = +new Date - $timing.start

    if (!xhr.isFromCache) {
      $xhrDict[$url] = cloneXhr(xhr);
      $preloadTimeDict[$url] = new Date().getTime();
    }
    
    if (xhr.getResponseHeader('Content-Type').match(/\/(x|ht|xht)ml/)) {
      var doc = document.implementation.createHTMLDocument('')
      doc.documentElement.innerHTML = removeNoscriptTags(xhr.responseText)
      $title = doc.title
      $body = doc.body

      var alteredOnReceive = triggerPageEvent('receive', $url, $body, $title)
      if (alteredOnReceive) {
        if ('body' in alteredOnReceive) {
          $body = alteredOnReceive.body
        }
        if ('title' in alteredOnReceive) {
          $title = alteredOnReceive.title
        }
      }

      var urlWithoutHash = removeHash($url)
      $history[urlWithoutHash] = {
        body: $body,
        title: $title,
        scrollY: urlWithoutHash in $history ? $history[urlWithoutHash].scrollY : 0
      }

      var elems = doc.head.children
        , found = 0
        , elem
        , data

      for (var i = 0; i < elems.length; i++) {
        elem = elems[i]
        if (elem.hasAttribute('data-instant-track')) {
          data = elem.getAttribute('href') || elem.getAttribute('src') || elem.innerHTML
          for (var j = 0; j < $trackedAssets.length; j++) {
            if ($trackedAssets[j] == data) {
              found++
            }
          }
        }
      }
      if (found != $trackedAssets.length) {
        $mustRedirect = true // Assets have changed
      }
    }
    else {
      $mustRedirect = true // Not an HTML document
    }

    if ($isWaitingForCompletion) {
      $isWaitingForCompletion = false
      display($url)
    }
  }

  function popstateListener() {
    var loc = removeHash(location.href)
    if (loc == $currentLocationWithoutHash) {
      return
    }

    if (!(loc in $history)) {
      location.href = location.href
      /* Reloads the page while using cache for scripts, styles and images,
         unlike `location.reload()` */
      return
    }

    $history[$currentLocationWithoutHash].scrollY = pageYOffset
    $currentLocationWithoutHash = loc
    changePage($history[loc].title, $history[loc].body, false, $history[loc].scrollY, true)
  }


  ////////// MAIN FUNCTIONS //////////


  function instantanize(isInitializing) {
    document.body.addEventListener('touchstart', touchstartListener, true)
    if ($preloadOnMousedown) {
      document.body.addEventListener('mousedown', mousedownListener, true)
    }
    else {
      document.body.addEventListener('mouseover', mouseoverListener, true)
    }
    document.body.addEventListener('click', clickListener, true)

    if (!isInitializing) {
      var scripts = document.body.getElementsByTagName('script')
        , script
        , copy
        , parentNode
        , nextSibling

      for (var i = 0, j = scripts.length; i < j; i++) {
        script = scripts[i]
        if (script.hasAttribute('data-no-instant')) {
          continue
        }
        copy = document.createElement('script')
        if (script.src) {
          copy.src = script.src
        }
        if (script.innerHTML) {
          copy.innerHTML = script.innerHTML
        }
        parentNode = script.parentNode
        nextSibling = script.nextSibling
        parentNode.removeChild(script)
        parentNode.insertBefore(copy, nextSibling)
      }
    }
  }

  function preload(url) {
    if (!$preloadOnMousedown
        && 'display' in $timing
        && +new Date - ($timing.start + $timing.display) < 100) {
      /* After a page is displayed, if the user's cursor happens to be above
         a link a mouseover event will be in most browsers triggered
         automatically, and in other browsers it will be triggered when the
         user moves his mouse by 1px.
         Here are the behavior I noticed, all on Windows:
         - Safari 5.1: auto-triggers after 0 ms
         - IE 11: auto-triggers after 30-80 ms (depends on page's size?)
         - Firefox: auto-triggers after 10 ms
         - Opera 18: auto-triggers after 10 ms
         - Chrome: triggers when cursor moved
         - Opera 12.16: triggers when cursor moved
         To remedy to this, we do not start preloading if last display
         occurred less than 100 ms ago.
      */

      return
    }

    if ($preloadTimer) {
      clearTimeout($preloadTimer)
      $preloadTimer = false
    }

    if (!url) {
      url = $urlToPreload
    }
    
    if ($isPreloading && (url == $url || $isWaitingForCompletion)) {
      return
    }
    $isPreloading = true
    $isWaitingForCompletion = false

    $url = url

    $body = false
    $mustRedirect = false
    $timing = {
      start: +new Date
    }
    triggerPageEvent('fetch')

    if ($xhrDict[$url] && $preloadTimeDict[$url] + $preloadCacheTimeLimit > new Date().getTime()) {
      readystatechangeListener($xhrDict[$url])
    } else {
      $xhr.open('GET', url)
      $xhr.send()
    }
  }

  function display(url) {
    if (!('display' in $timing)) {
      $timing.display = +new Date - $timing.start
    }
    if ($preloadTimer || !$isPreloading) {
      /* $preloadTimer:
         Happens when there's a delay before preloading and that delay
         hasn't expired (preloading didn't kick in).
         !$isPreloading:
         A link has been clicked, and preloading hasn't been initiated.
         It happens with touch devices when a user taps *near* the link,
         Safari/Chrome will trigger mousedown, mouseover, click (and others),
         but when that happens we ignore mousedown/mouseover (otherwise click
         doesn't fire). Maybe there's a way to make the click event fire, but
         that's not worth it as mousedown/over happen just 1ms before click
         in this situation.
         It also happens when a user uses his keyboard to navigate (with Tab
         and Return), and possibly in other non-mainstream ways to navigate
         a website.
      */
      if ($preloadTimer && $url && $url != url) {
        /* Happens when the user clicks on a link before preloading
           kicks in while another link is already preloading.
        */

        location.href = url
        return
      }

      preload(url)
      triggerPageEvent('wait')
      $isWaitingForCompletion = true // Must be set *after* calling `preload`
      return
    }
    if ($isWaitingForCompletion) {
      /* The user clicked on a link while a page was preloading. Either on
         the same link or on another link. If it's the same link something
         might have gone wrong (or he could have double clicked, we don't
         handle that case), so we send him to the page without pjax.
         If it's another link, it hasn't been preloaded, so we redirect the
         user to it.
      */
      location.href = url
      return
    }
    if ($mustRedirect) {
      location.href = $url
      return
    }
    if (!$body) {
      triggerPageEvent('wait')
      $isWaitingForCompletion = true
      return
    }
    $history[$currentLocationWithoutHash].scrollY = pageYOffset
    setPreloadingAsHalted()
    changePage($title, $body, $url)
  }


  ////////// PUBLIC VARIABLE AND FUNCTIONS //////////

  var supported = 'pushState' in history
                  && (!$userAgent.match('Android') || $userAgent.match('Chrome/'))
                  && location.protocol != "file:"

  /* The (sad) state of Android's AOSP browsers:
     2.3.7: pushState appears to work correctly, but
            `doc.documentElement.innerHTML = body` is buggy.
            Update: InstantClick doesn't use that anymore, but it may
            fail where 3.0 do, this needs testing again.
     3.0:   pushState appears to work correctly (though the address bar is
            only updated on focus), but
            `document.documentElement.replaceChild(doc.body, document.body)`
            throws DOMException: WRONG_DOCUMENT_ERR.
     4.0.2: Doesn't support pushState.
     4.0.4,
     4.1.1,
     4.2,
     4.3:   Claims support for pushState, but doesn't update the address bar.
     4.4:   Works correctly. Claims to be 'Chrome/30.0.0.0'.
     All androids tested with Android SDK's Emulator.
     Version numbers are from the browser's user agent.
     Because of this mess, the only whitelisted browser on Android is Chrome.
  */

  function init(options) {
    var preloadingMode;

    if (typeof options !== 'object') {
      //legacy parameters
      preloadingMode = options;
    } else {
      preloadingMode = options.preloadingMode || 0;

      if (options.preloadCacheTimeLimit !== undefined) {
        $preloadCacheTimeLimit = options.preloadCacheTimeLimit;
      }
    }

    if ($currentLocationWithoutHash) {
      /* Already initialized */
      return
    }
    if (!supported) {
      triggerPageEvent('change', true)
      return
    }

    if (preloadingMode == 'mousedown') {
      $preloadOnMousedown = true
    }
    else if (typeof preloadingMode == 'number') {
      $delayBeforePreload = preloadingMode
    }

    $currentLocationWithoutHash = removeHash(location.href)
    $history[$currentLocationWithoutHash] = {
      body: document.body,
      title: document.title,
      scrollY: pageYOffset
    }

    var elems = document.head.children
      , elem
      , data
    for (var i = 0; i < elems.length; i++) {
      elem = elems[i]
      if (elem.hasAttribute('data-instant-track')) {
        data = elem.getAttribute('href') || elem.getAttribute('src') || elem.innerHTML
        /* We can't use just `elem.href` and `elem.src` because we can't
           retrieve `href`s and `src`s from the Ajax response.
        */
        $trackedAssets.push(data)
      }
    }

    $xhr = new XMLHttpRequest()
    $xhr.addEventListener('readystatechange', function() {
      readystatechangeListener($xhr);
    })

    instantanize(true)

    triggerPageEvent('change', true)

    addEventListener('popstate', popstateListener)
  }

  function on(eventType, callback) {
    $eventsCallbacks[eventType].push(callback)
  }


  ////////////////////


  return {
    supported: supported,
    init: init,
    on: on
  }

}(document, location, navigator.userAgent);

if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = InstantClick;
}

/* InstantClick's loading indicator | (C) 2014-2015 Alexandre Dieulot | http://instantclick.io/license */

;(function() {
   var $container,
        $element,
        $transformProperty,
        $progress,
        $timer,
        $hasTouch = 'createTouch' in document

    function init() {
      $container = document.createElement('div')
      $container.id = 'instantclick'
      $element = document.createElement('div')
      $element.id = 'instantclick-bar'
      $element.className = 'instantclick-bar'
      $container.appendChild($element)

      var vendors = ['Webkit', 'Moz', 'O']

      $transformProperty = 'transform'
      if (!($transformProperty in $element.style)) {
        for (var i = 0; i < 3; i++) {
          if (vendors[i] + 'Transform' in $element.style) {
            $transformProperty = vendors[i] + 'Transform'
          }
        }
      }

      var transitionProperty = 'transition'
      if (!(transitionProperty in $element.style)) {
        for (var i = 0; i < 3; i++) {
          if (vendors[i] + 'Transition' in $element.style) {
            transitionProperty = '-' + vendors[i].toLowerCase() + '-' + transitionProperty
          }
        }
      }

      var style = document.createElement('style')
      style.innerHTML = '#instantclick{position:' + ($hasTouch ? 'absolute' : 'fixed') + ';top:0;left:0;width:100%;pointer-events:none;z-index:2147483647;' + transitionProperty + ':opacity .25s .1s}'
        + '.instantclick-bar{background:#27ae60;width:100%;margin-left:-100%;height:2px;' + transitionProperty + ':all .25s}'
      /* We set the bar's background in `.instantclick-bar` so that it can be
         overriden in CSS with `#instantclick-bar`, as IDs have higher priority.
      */
      document.head.appendChild(style)

      if ($hasTouch) {
        updatePositionAndScale()
        addEventListener('resize', updatePositionAndScale)
        addEventListener('scroll', updatePositionAndScale)
      }

    }

    function start(at, jump) {
      $progress = at
      if (document.getElementById($container.id)) {
        document.body.removeChild($container)
      }
      $container.style.opacity = '1'
      if (document.getElementById($container.id)) {
        document.body.removeChild($container)
        /* So there's no CSS animation if already done once and it goes from 1 to 0 */
      }
      update()
      if (jump) {
        setTimeout(jumpStart, 0)
        /* Must be done in a timer, otherwise the CSS animation doesn't happen. */
      }
      clearTimeout($timer)
      $timer = setTimeout(inc, 500)
    }

    function jumpStart() {
      $progress = 10
      update()
    }

    function inc() {
      $progress += 1 + (Math.random() * 2)
      if ($progress >= 98) {
        $progress = 98
      }
      else {
        $timer = setTimeout(inc, 500)
      }
      update()
    }

    function update() {
      $element.style[$transformProperty] = 'translate(' + $progress + '%)'
      if (!document.getElementById($container.id)) {
        document.body.appendChild($container)
      }
    }

    function done() {
      if (document.getElementById($container.id)) {
        clearTimeout($timer)
        $progress = 100
        update()
        $container.style.opacity = '0'
        /* If you're debugging, setting this to 0.5 is handy. */
        return
      }

      /* The bar container hasn't been appended: It's a new page. */
      start($progress == 100 ? 0 : $progress)
      /* $progress is 100 on popstate, usually. */
      setTimeout(done, 0)
      /* Must be done in a timer, otherwise the CSS animation doesn't happen. */
    }

    function updatePositionAndScale() {
      /* Adapted from code by Sam Stephenson and Mislav Marohnić
         http://signalvnoise.com/posts/2407
      */

      $container.style.left = pageXOffset + 'px'
      $container.style.width = innerWidth + 'px'
      $container.style.top = pageYOffset + 'px'

      var landscape = 'orientation' in window && Math.abs(orientation) == 90,
          scaleY = innerWidth / screen[landscape ? 'height' : 'width'] * 2
      /* We multiply the size by 2 because the progress bar is harder
         to notice on a mobile device.
      */
      $container.style[$transformProperty] = 'scaleY(' + scaleY  + ')'
    }


  ////////////////////


  instantClick.on('change', function(isInitialPage) {
    if (isInitialPage && instantClick.supported) {
      init()
    }
    else if (!isInitialPage) {
      done()
    }
  })

  instantClick.on('wait', start)
})();
