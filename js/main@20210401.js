function switchNightMode(){var night=document.cookie.replace(/(?:(?:^|.*;\s*)night\s*\=\s*([^;]*).*$)|^.*$/,"$1")||'0';if(night=='0'){document.querySelector('link[title="dark"]').disabled=true;document.querySelector('link[title="dark"]').disabled=false;document.cookie="night=1;path=/"
console.log('夜间模式开启');}else{document.querySelector('link[title="dark"]').disabled=true;document.cookie="night=0;path=/"
console.log('夜间模式关闭');}}
(function(){if(document.cookie.replace(/(?:(?:^|.*;\s*)night\s*\=\s*([^;]*).*$)|^.*$/,"$1")===''){if(new Date().getHours()>20||new Date().getHours()<6){document.querySelector('link[title="dark"]').disabled=true;document.querySelector('link[title="dark"]').disabled=false;document.cookie="night=1;path=/"
console.log('夜间模式开启');}else{document.cookie="night=0;path=/"
console.log('夜间模式关闭');}}else{var night=document.cookie.replace(/(?:(?:^|.*;\s*)night\s*\=\s*([^;]*).*$)|^.*$/,"$1")||'0';if(night=='0'){document.querySelector('link[title="dark"]').disabled=true;console.log('夜间模式关闭');}else if(night=='1'){document.querySelector('link[title="dark"]').disabled=true;document.querySelector('link[title="dark"]').disabled=false;console.log('夜间模式开启');}}})();
"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function e(e,t){for(var a=0;a<t.length;a++){var s=t[a];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(e,s.key,s)}}return function(t,a,s){return a&&e(t.prototype,a),s&&e(t,s),t}}();!function(){var e=function(){function e(t){var a=this;_classCallCheck(this,e);var s={logo:"OwO琛ㄦ儏",container:document.getElementsByClassName("OwO")[0],target:document.getElementsByTagName("textarea")[0],position:"down",width:"100%",maxHeight:"250px",api:"https://api.anotherhome.net/OwO/OwO.json"};for(var n in s)s.hasOwnProperty(n)&&!t.hasOwnProperty(n)&&(t[n]=s[n]);this.container=t.container,this.target=t.target,"up"===t.position&&this.container.classList.add("OwO-up");var i=new XMLHttpRequest;i.onreadystatechange=function(){4===i.readyState&&(i.status>=200&&i.status<300||304===i.status?(a.odata=JSON.parse(i.responseText),a.init(t)):console.log("OwO data request was unsuccessful: "+i.status))},i.open("get",t.api,!0),i.send(null)}return _createClass(e,[{key:"init",value:function(e){var t=this;this.area=e.target,this.packages=Object.keys(this.odata);for(var a='\n            <div class="OwO-logo"><span>'+e.logo+'</span></div>\n            <div class="OwO-body" style="width: '+e.width+'">',s=0;s<this.packages.length;s++){a+='\n                <ul class="OwO-items OwO-items-'+this.odata[this.packages[s]].type+'" style="max-height: '+(parseInt(e.maxHeight)-53+"px")+';">';for(var n=this.odata[this.packages[s]].container,i=0;i<n.length;i++)a+='\n                    <li class="OwO-item" title="'+n[i].text+'">'+n[i].icon+"</li>";a+="\n                </ul>"}a+='\n                <div class="OwO-bar">\n                    <ul class="OwO-packages">';for(var o=0;o<this.packages.length;o++)a+="\n                        <li><span>"+this.packages[o]+"</span></li>";a+="\n                    </ul>\n                </div>\n            </div>\n            ",this.container.innerHTML=a,this.logo=this.container.getElementsByClassName("OwO-logo")[0],this.logo.addEventListener("click",function(){t.toggle()}),this.container.getElementsByClassName("OwO-body")[0].addEventListener("click",function(e){var a=null;if(e.target.classList.contains("OwO-item")?a=e.target:e.target.parentNode.classList.contains("OwO-item")&&(a=e.target.parentNode),a){var s=t.area.selectionEnd,n=t.area.value;t.area.value=n.slice(0,s)+a.innerHTML+n.slice(s),t.area.focus(),t.toggle()}}),this.packagesEle=this.container.getElementsByClassName("OwO-packages")[0];for(var c=function(e){!function(a){t.packagesEle.children[e].addEventListener("click",function(){t.tab(a)})}(e)},l=0;l<this.packagesEle.children.length;l++)c(l);this.tab(0)}},{key:"toggle",value:function(){this.container.classList.contains("OwO-open")?this.container.classList.remove("OwO-open"):this.container.classList.add("OwO-open")}},{key:"tab",value:function(e){var t=this.container.getElementsByClassName("OwO-items-show")[0];t&&t.classList.remove("OwO-items-show"),this.container.getElementsByClassName("OwO-items")[e].classList.add("OwO-items-show");var a=this.container.getElementsByClassName("OwO-package-active")[0];a&&a.classList.remove("OwO-package-active"),this.packagesEle.getElementsByTagName("li")[e].classList.add("OwO-package-active")}}]),e}();"undefined"!=typeof module&&"undefined"!=typeof module.exports?module.exports=e:window.OwO=e}();
"use strict";function flyingPages(){var a=new Set,b=new Set,c=document.createElement("link"),d=c.relList&&c.relList.supports&&c.relList.supports("prefetch")&&window.IntersectionObserver&&"isIntersecting"in IntersectionObserverEntry.prototype,e=navigator.connection&&(navigator.connection.saveData||(navigator.connection.effectiveType||"").includes("2g"));if(!e&&d){var f=function(a){return new Promise(function(b,c){var d=document.createElement("link");d.rel="prefetch",d.href=a,d.onload=b,d.onerror=c,document.head.appendChild(d)})},g=function(a){var b=setTimeout(function(){return p()},5e3);f(a)["catch"](function(){return p()})["finally"](function(){return clearTimeout(b)})},h=function(c){var d=!!(1<arguments.length&&void 0!==arguments[1])&&arguments[1];if(!(b.has(c)||a.has(c))){var e=window.location.origin;if(c.substring(0,e.length)===e&&window.location.href!==c){for(var f=0;f<window.FPConfig.ignoreKeywords.length;f++)if(c.includes(window.FPConfig.ignoreKeywords[f]))return;d?(g(c),b.add(c)):a.add(c)}}},i=new IntersectionObserver(function(a){a.forEach(function(a){if(a.isIntersecting){var b=a.target.href;h(b,!window.FPConfig.maxRPS)}})}),j=function(){return setInterval(function(){Array.from(a).slice(0,window.FPConfig.maxRPS).forEach(function(c){g(c),b.add(c),a["delete"](c)})},1e3)},k=null,l=function(a){var c=a.target.closest("a");c&&c.href&&!b.has(c.href)&&(k=setTimeout(function(){h(c.href,!0)},window.FPConfig.hoverDelay))},m=function(a){var c=a.target.closest("a");c&&c.href&&!b.has(c.href)&&h(c.href,!0)},n=function(a){var c=a.target.closest("a");c&&c.href&&!b.has(c.href)&&clearTimeout(k)},o=window.requestIdleCallback||function(a){var b=Date.now();return setTimeout(function(){a({didTimeout:!1,timeRemaining:function timeRemaining(){var a=Math.max;return a(0,50-(Date.now()-b))}})},1)},p=function(){document.querySelectorAll("a").forEach(function(a){return i.unobserve(a)}),a.clear(),document.removeEventListener("mouseover",l,!0),document.removeEventListener("mouseout",n,!0),document.removeEventListener("touchstart",m,!0)};window.FPConfig=Object.assign({delay:0,ignoreKeywords:[],maxRPS:3,hoverDelay:50},window.FPConfig),j(),o(function(){return setTimeout(function(){return document.querySelectorAll("a").forEach(function(a){return i.observe(a)})},1e3*window.FPConfig.delay)});var q={capture:!0,passive:!0};document.addEventListener("mouseover",l,q),document.addEventListener("mouseout",n,q),document.addEventListener("touchstart",m,q)}}flyingPages();
(function(a){a.extend({viewImage:function(c){var b=a.extend({target:".view-image img",exclude:"",delay:300},c);a(b.exclude).attr("view-image",!1);a(b.target).off().on("click",function(e){var f=e.currentTarget.src,d=e.currentTarget.href,c=".vi-"+Math.random().toString(36).substr(2);if(!a(this).attr("view-image")&&!a(this).is(b.exclude)&&(f||d&&d.match(/.+\.(jpg|jpeg|webp|gif|png)/gi)))return a("body").append("<style class='view-image-css'>.view-img{position:fixed;background:#fff;background:rgba(255,255,255,.92);width:100%;height:100%;top:0;left:0;text-align:center;z-index:999;cursor: zoom-out}.view-img img,.view-img span{max-width:100%;max-height:100%;position:relative;top:50%;transform: translateY(-50%);}.view-img img{animation:view-img-show .8s -0.1s ease-in-out}.view-img span{height:2em;color:#AAB2BD;overflow:hidden;position:absolute;top:50%;left:0;right:0;width:120px;text-align:center;margin:-1em auto;}.view-img span:after{content:'';position:absolute;bottom:0;left:0;transform: translateX(-100%);width:100%;height:2px;background:#27ae60;animation:view-img-load .8s -0.1s ease-in-out infinite;}@keyframes view-img-load{0%{transform: translateX(-100%);}100%{transform: translateX(100%);}}@keyframes view-img-show{0%{opacity:0;}100%{opacity:1;}}</style><div class='view-img'><span>loading...</span></div>"),setTimeout(function(){var b=new Image;b.src=f||d;b.onload=function(){a(".view-img").html('<img src="'+b.src+'" alt="ViewImage">')};a(".view-img").off().on("click",function(){a(".view-image-css").remove();a(this).remove()});a(c).html()},b.delay),!1})}})})(jQuery);
function LbMove(boxID,btn_left,btn_right,btnBox,Car,direction,way,moveLengh,speed,Interval,number){var _ID=$("#"+boxID+"");var _btn_left=$("#"+btn_left+"");var _btn_right=$("#"+btn_right+"");var _btnBox=$("#"+btnBox+"");var jsq=0
var timer;var cj;var no_way=0;var no_wayGet=0;var fade=0;var new_time=new Date;var ID_liLen,ID_liheight,cbtmBtn;ID_liLen=_ID.find("li").length;ID_liheight=_ID.find("li").innerHeight();if(direction=="left"||direction=="right"){_ID.find("ul").width(ID_liLen*moveLengh);}else if(direction=="top"||direction=="bottom"){_ID.find("ul").height(ID_liLen*moveLengh);_btnBox.hide()}else if(direction=="fade"){_ID.find("ul").width(moveLengh).height(ID_liheight);_ID.find("li").eq(0).show().siblings().hide();_ID.find("li").css({"position":"absolute","left":0,"top":0});}
_btnBox.empty();for(i=0;i<ID_liLen;i++){_btnBox.append("<span></span>");};_btnBox.find("span").eq(0).addClass("cur");if(way==false){_btn_left.hide();_btn_right.hide();_btnBox.hide();}
function Carousel(){if(way==false){no_way++;if(direction=="left"){_ID.find("ul").css({"left":-no_way});no_wayGet=parseInt(_ID.find("ul").css("left"));if(no_wayGet==-moveLengh){no_way=0
_ID.find("li:first").insertAfter(_ID.find("li:last"));_ID.find("ul").css({"left":0});}}
if(direction=="right"){no_wayGet=parseInt(_ID.find("ul").css("left"));if(no_wayGet==0){no_way=-moveLengh
_ID.find("li:last").insertBefore(_ID.find("li:first"));_ID.find("ul").css({"left":0});}
_ID.find("ul").css({"left":no_way});}
if(direction=="top"){_ID.find("ul").css({"top":-no_way});no_wayGet=parseInt(_ID.find("ul").css("top"));if(no_wayGet==-moveLengh){no_way=0
_ID.find("li:first").insertAfter(_ID.find("li:last"));_ID.find("ul").css({"top":0});}}
if(direction=="bottom"){no_wayGet=parseInt(_ID.find("ul").css("top"));if(no_wayGet==0){no_way=-moveLengh
_ID.find("li:last").insertBefore(_ID.find("li:first"));_ID.find("ul").css({"top":0});}
_ID.find("ul").css({"top":no_way});}}else if(way==true){if(direction=="left"){_ID.find("ul").animate({left:-moveLengh},speed,function(){_ID.find("li:first").insertAfter(_ID.find("li:last"));_ID.find("ul").css({"left":0});});if(jsq<ID_liLen-1){jsq++;_btnBox.find("span").eq(jsq).addClass("cur").siblings().removeClass("cur");}else{jsq=0;_btnBox.find("span").eq(jsq).addClass("cur").siblings().removeClass("cur");}}
if(direction=="right"){_ID.find("li:last").insertBefore(_ID.find("li:first"));_ID.find("ul").css({"left":-moveLengh});_ID.find("ul").stop().animate({left:0},speed);if(jsq>0){jsq--;_btnBox.find("span").eq(jsq).addClass("cur").siblings().removeClass("cur");}else{jsq=ID_liLen-1;_btnBox.find("span").eq(jsq).addClass("cur").siblings().removeClass("cur");}}
if(direction=="top"){_ID.find("ul").animate({top:-moveLengh},speed,function(){_ID.find("li:first").insertAfter(_ID.find("li:last"));_ID.find("ul").css({"top":0});});}
if(direction=="bottom"){_ID.find("li:last").insertBefore(_ID.find("li:first"));_ID.find("ul").css({"top":-moveLengh});_ID.find("ul").stop().animate({top:0},speed);}
if(direction=="fade"){if(fade<ID_liLen-1){fade++;}else{fade=0}
_ID.find("li").eq(fade).fadeIn(speed).siblings().fadeOut(speed);_btnBox.find("span").eq(fade).addClass("cur").siblings().removeClass("cur");}}}
if(Car==true){if(ID_liLen>number){timer=setInterval(Carousel,Interval);}else{clearInterval(timer);_btn_left.hide();_btn_right.hide();_btnBox.hide();}}else{clearInterval(timer);}
_ID.find("li").hover(function(){clearInterval(timer);},function(){if(Car==true){if(ID_liLen>number){timer=setInterval(Carousel,Interval);}else{clearInterval(timer);_btn_left.hide();_btn_right.hide();_btnBox.hide();}}else{clearInterval(timer);}});_btn_right.hover(function(){clearInterval(timer);},function(){if(Car==true){if(ID_liLen>number){timer=setInterval(Carousel,Interval);}else{clearInterval(timer);_btn_left.hide();_btn_right.hide();_btnBox.hide();}}else{clearInterval(timer);}}).click(function(){if(new Date-new_time>500){new_time=new Date;if(direction=="left"||direction=="right"){_ID.find("ul").animate({left:-moveLengh},speed,function(){_ID.find("li:first").insertAfter(_ID.find("li:last"));_ID.find("ul").css({"left":0});});}
if(direction=="top"||direction=="bottom"){_ID.find("ul").animate({top:-moveLengh},speed,function(){_ID.find("li:first").insertAfter(_ID.find("li:last"));_ID.find("ul").css({"top":0});});}
if(direction=="fade"){if(fade>0){fade--;}else{fade=ID_liLen-1}
_ID.find("li").stop(true,true).eq(fade).fadeIn(speed).siblings().fadeOut(speed);}
if(jsq<ID_liLen-1){jsq++;_btnBox.find("span").eq(jsq).addClass("cur").siblings().removeClass("cur");}else{jsq=0;_btnBox.find("span").eq(jsq).addClass("cur").siblings().removeClass("cur");};}else{};});_btn_left.hover(function(){clearInterval(timer);},function(){if(Car==true){if(ID_liLen>number){timer=setInterval(Carousel,Interval);}else{clearInterval(timer);_btn_left.hide();_btn_right.hide();_btnBox.hide();}}else{clearInterval(timer);}}).click(function(){if(new Date-new_time>500){new_time=new Date;if(direction=="left"||direction=="right"){_ID.find("li:last").insertBefore(_ID.find("li:first"));_ID.find("ul").css({"left":-moveLengh});_ID.find("ul").stop().animate({left:0},speed);}
if(direction=="top"||direction=="bottom"){_ID.find("li:last").insertBefore(_ID.find("li:first"));_ID.find("ul").css({"top":-moveLengh});_ID.find("ul").stop().animate({top:0},speed);}
if(direction=="fade"){if(fade<ID_liLen-1){fade++;}else{fade=0}
_ID.find("li").stop(true,true).eq(fade).fadeIn(speed).siblings().fadeOut(speed);}
if(jsq>0){jsq--;_btnBox.find("span").eq(jsq).addClass("cur").siblings().removeClass("cur");}else{jsq=ID_liLen-1;_btnBox.find("span").eq(jsq).addClass("cur").siblings().removeClass("cur");};}else{};});_btnBox.find("span").hover(function(){clearInterval(timer);},function(){if(Car==true){if(ID_liLen>number){timer=setInterval(Carousel,Interval);}else{clearInterval(timer);_btn_left.hide();_btn_right.hide();_btnBox.hide();}}else{clearInterval(timer);}}).click(function(){if(new Date-new_time>500){new_time=new Date;cbtmBtn=$(this).index();$(this).addClass("cur").siblings().removeClass("cur");if(direction=="fade"){_ID.find("li").eq(cbtmBtn).fadeIn(speed).siblings().fadeOut(speed);}else{if(cbtmBtn>jsq){cj=cbtmBtn-jsq;jsq=cbtmBtn;_ID.find("ul").stop().animate({left:-moveLengh*cj},speed,function(){for(i=0;i<cj;i++){_ID.find("ul").css({"left":0})
_ID.find("li:first").insertAfter(_ID.find("li:last"));};});}else{cj=jsq-cbtmBtn;jsq=cbtmBtn;_ID.find("ul").css({"left":-moveLengh*cj});for(i=0;i<cj;i++){_ID.find("ul").stop().animate({left:0},speed);_ID.find("li:last").insertBefore(_ID.find("li:first"));};};};}else{};});}
