/*
 * presentor.js || version 0.0.1
 * ------------    -------------
 * presentor.js a modern presentation framework built using Javascript and CSS3 for the web.
 * Author: Praveen Nair
 *
 */
( function( document, window ) {
	"use strict";
	/* Constants */
	var _PRESENTOR_VER1 = 0,
		_PRESENTOR_VER2 = 0,
		_PRESENTOR_VER3 = 1,
		_DEFAULT_DIV = 'presentor',
		_DEFAULT_DIV_TOAST = 'idPresentorToast',
		_DEFAULT_PRESENTOR_ANIM_TIME = 0.8,
		_DEFAULT_PRESENTOR_TRANSITION_TIME = 2000,
		_DEFAULT_PRESENTOR_TOAST_TIME = 3000,
		_PRESENTOR_CSS_HIDE_SLIDE = "presentor_hideSlide",
		_PRESENTOR_CSS_SHOW_SLIDE = "presentor_showSlide",
		_PRESENTOR_CSS_SLIDE = "presentor_slide",
		_PRESENTOR_CSS_SLIDE_TITLE = "presentor_title",
		_PRESENTOR_CSS_SLIDE_CONTENT = "presentor_content",
		_PRESENTOR_CSS_TOAST_SHOW = "presentor_toast showToast",
		_PRESENTOR_CSS_STYLE_VISIBLE = "visible",
		_PRESENTOR_CSS_STYLE_HIDDEN = "hidden",
		_PRESENTOR_CSS_STYLE_DISP_NONE = "none",
		_PRESENTOR_CSS_STYLE_DISP_BLOCK = "block",
		_DOM_CONTENT_LOADED = 'DOMContentLoaded',
		_DOM_SLIDE_TITLE = 'title',
		_DOM_SLIDE_CONTENT = 'content',
		_DOM_EVENT_RESIZE = 'resize',
		_DOM_EVENT_KEYPRESS = 'keydown',
		_KEY_EVENT_RIGHT = 39,
		_KEY_EVENT_LEFT = 37,
		_MSG_TOAST_PRESENTOR_AUTO_NAVIGATION = "presentor.js: Auto navigation mode started!",
		_MSG_TOAST_PRESENTOR_KEY_NAVIGATION = "presentor.js: Use <div class='presentor_leftArrow'></div> " + 
											  "and <div class='presentor_rightArrow'></div> arrow keys to navigate!",
		_MSG_E_PRESENTOR_NOT_SUPPORTED = "presentor.js is not supported by your broswer!",
		_MSG_E_PRESENTOR_INDEX_OUT_OF_BOUND = "presentor.js index out of bound.",
		_MSG_E_PRESENTOR_TOO_FEW_ARG = "presentor.js function received too few arguments.",
		_MSG_E_PRESENTOR_NOT_STARTED = "presentor.js has not been initialized. Please run slideShow(..)",
		_MSG_E_PRESENTOR_NO_SLIDE_ID = "presentor.js dynamic slide must have a slideId.",
		_MSG_E_PRESENTOR_SLIDE_SHOW_RUNNING = "presentor.js slideshow is already running.",
		_MSG_E_PRESENTOR_SLIDE_SHOW_STOPPED = "presentor.js slideshow is already stoped!",
		_MSG_E_PRESENTOR_UNKNOWN_EFFECT = "presentor.js transition effect not found!";

	/* Variable */
	var _presentorModeSupported = true,
		_slideShowStarted = false,
		_setCyclicSlideShow = false,
		_setSlideShow = false,
		_readyForNextKeyEvent = true,
		_rootId,
		_docRootElem,
		_currentSlideDeckIndex,
		_effectList = [],
		_slideDeck = [];

	/* Method */
	var _checkPresentorSupport = function() {
		var divElem = document.createElement('div'),
			styleElem = document.createElement('div'),
			cssProperty = ['perspectiveProperty', 'WebkitPerspective'],
			isSupported = false;
		for(var propIterator = 0; propIterator < cssProperty.length; propIterator++) {
			isSupported = isSupported ? isSupported : divElem.style[cssProperty[propIterator]] != undefined;
		}
		return isSupported;
	};

	var _resizeSlide = function( slideTransition ) {
		var elementWidth = _docRootElem.offsetWidth;
		var elementHeight = _docRootElem.offsetHeight;
		var currentSlideDeck = _slideDeck[_currentSlideDeckIndex];
		var divElem = document.getElementById(currentSlideDeck.slideId);
		var divElemTitle = document.getElementById(currentSlideDeck.slideId + "." + _DOM_SLIDE_TITLE);
		var divElemContent = document.getElementById(currentSlideDeck.slideId + "." + _DOM_SLIDE_CONTENT);
		var isTitleAdded = divElemTitle === null;
		var isContentAdded = divElemContent === null;
		if(slideTransition === undefined) _showSlide(currentSlideDeck.slideId);		
		else _transitionSlide(null, currentSlideDeck.slideId, slideTransition);
	};

	var _hideSlide = function( slideId ) {
		if(slideId) {
			var divElem = document.getElementById(slideId);
			if(divElem) divElem.style.display = _PRESENTOR_CSS_STYLE_DISP_NONE;
		}
	};

	var _showSlide = function( slideId ) {
		if(slideId) {
			var divElem = document.getElementById(slideId);
			if(divElem) divElem.style.display = _PRESENTOR_CSS_STYLE_DISP_BLOCK;
		}
	};

	var _addClass = function( className, divElem ) {
		var isClassFound = false;
		for(var i = 0; i < divElem.classList.length; i++) {
			if(divElem.classList[i] === className) {
				isClassFound = true;
				break;
			}
		}
		if(!isClassFound) divElem.className += " " + className;
	};

	var _removeClass = function( className, divElem ) {
		var isClassFound = false;
		var classString = "";
		for(var i = 0; i < divElem.classList.length; i++) {
			if(divElem.classList[i] === className) {
				isClassFound = true;
			} else {
				classString += " " + divElem.classList[i];
			}
		}
		
		if(isClassFound) divElem.className = className;
	};

	var _registerPresentorEffects = function( effectName, effectCallback ) {
		_effectList[effectName] = effectCallback;
	};

	var _initPresentor = function() {
		_docRootElem.style.visibility = _PRESENTOR_CSS_STYLE_VISIBLE;
		_registerPresentorEffects('hide', _presentorEffect_Hide);
		_registerPresentorEffects('slide_left', _presentorEffect_SlideLeft); 
		_registerPresentorEffects('slide_right', _presentorEffect_SlideRight);
		_registerPresentorEffects('slide_left_V1', _presentorEffect_SlideLeft_V1); 
		_registerPresentorEffects('slide_right_V1', _presentorEffect_SlideRight_V1);
		_registerPresentorEffects('slide_left_V2', _presentorEffect_SlideLeft_V2);
		_registerPresentorEffects('slide_right_V2', _presentorEffect_SlideRight_V2);
		_registerPresentorEffects('slide_left_V3', _presentorEffect_SlideLeft_V3);
		_registerPresentorEffects('slide_right_V3', _presentorEffect_SlideRight_V3);
		_registerPresentorEffects('slide_up', _presentorEffect_SlideUp);
		_registerPresentorEffects('slide_down', _presentorEffect_SlideDown);
		_registerPresentorEffects('slide_up_V1', _presentorEffect_SlideUp_V1);
		_registerPresentorEffects('slide_down_V1', _presentorEffect_SlideDown_V1);
		_registerPresentorEffects('slide_up_V2', _presentorEffect_SlideUp_V2);
		_registerPresentorEffects('slide_down_V2', _presentorEffect_SlideDown_V2);
		_registerPresentorEffects('slide_up_V3', _presentorEffect_SlideUp_V3);
		_registerPresentorEffects('slide_down_V3', _presentorEffect_SlideDown_V3);
		_registerPresentorEffects('fade', _presentorEffect_Fade);
		_registerPresentorEffects('flip_horizontal', _presentorEffect_FlipY);
		_registerPresentorEffects('flip_vertical', _presentorEffect_FlipX);
		_registerPresentorEffects('flip_rotate', _presentorEffect_FlipZ);
		_registerPresentorEffects('zoom_in', _presentorEffect_ZoomIn);
		_registerPresentorEffects('zoom_out', _presentorEffect_ZoomOut);
		_registerPresentorEffects('zoom_in_out', _presentorEffect_ZoomInOut);
		_registerPresentorEffects('zoom_out_in', _presentorEffect_ZoomOutIn);
		_registerPresentorEffects('presentor_effect_01', _presentorEffect_PresentorEffect_01);
	};

	var _transitionSlide = function( slideSrcId, slideDestId, transitionEffect ) {
		var callBackEffect = _effectList[transitionEffect];
		if (callBackEffect === undefined || callBackEffect === null) console.error(_MSG_E_PRESENTOR_UNKNOWN_EFFECT);
		else callBackEffect(slideSrcId, slideDestId);
	};

	var _presentorEffect_Hide = function( slideSrcId, slideDestId ) {
		_hideSlide(slideSrcId);
		_showSlide(slideDestId);
	};

	var _presentorEffect_SlideLeft = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "left " + animationTime + "s linear 0s";
			divElemSrc.style.left = "10px";
			divElemSrc.style.left = "-" + (_docRootElem.offsetWidth + 100) + "px";
		}
		if(divElemDst) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				if(divElemSrc) divElemSrc.style.left = "10px";
				divElemDst.style.left = (_docRootElem.offsetWidth + 100) + "px";
				_showSlide(slideDestId);
				setTimeout(function() {
					divElemDst.style.transition = "left " + animationTime + "s linear 0s";
					divElemDst.style.left = "10px";
				}, animationTime * 1000);
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorEffect_SlideRight = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "left " + animationTime + "s linear 0s";
			divElemSrc.style.left = "10px";
			divElemSrc.style.left = (_docRootElem.offsetWidth + 100) + "px";
		}
		if(divElemDst) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				if(divElemSrc) divElemSrc.style.left = "10px";
				divElemDst.style.left = "-" + (_docRootElem.offsetWidth + 10) + "px";
				_showSlide(slideDestId);
				setTimeout(function() {
					divElemDst.style.transition = "left " + animationTime + "s linear 0s";
					divElemDst.style.left = "10px";
				}, animationTime * 1000);
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorEffect_SlideLeft_V1 = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "left " + animationTime + "s linear 0s";
			divElemSrc.style.left = "10px";
			divElemSrc.style.left = "-" + (_docRootElem.offsetWidth + 100) + "px";
		}
		if(divElemDst) {
			divElemDst.style.left = (_docRootElem.offsetWidth + 100) + "px";
			_showSlide(slideDestId);
			divElemDst.style.transition = "left " + animationTime + "s linear 0s";
			setTimeout(function() {
				divElemDst.style.left = "10px";
			}, 10);			
		}
		if(divElemSrc) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				divElemSrc.style.left = "10px";
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorEffect_SlideRight_V1 = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "left " + animationTime + "s linear 0s";
			divElemSrc.style.left = "10px";
			divElemSrc.style.left = (_docRootElem.offsetWidth + 100) + "px";
		}
		if(divElemDst) {
			divElemDst.style.left = "-" + (_docRootElem.offsetWidth + 100) + "px";
			_showSlide(slideDestId);
			divElemDst.style.transition = "left " + animationTime + "s linear 0s";
			setTimeout(function() {
				divElemDst.style.left = "10px";
			}, 10);			
		}
		if(divElemSrc) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				divElemSrc.style.left = "10px";
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorEffect_SlideLeft_V2 = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "all " + animationTime + "s linear 0s";
			divElemSrc.style.left = "10px";
			divElemSrc.style.left = "-" + (_docRootElem.offsetWidth + 100) + "px";
			divElemSrc.style.opacity = 0;
		}
		if(divElemDst) {
			divElemDst.style.left = (_docRootElem.offsetWidth + 100) + "px";
			divElemDst.style.opacity = 0;
			_showSlide(slideDestId);
			divElemDst.style.transition = "all " + animationTime + "s linear 0s";
			setTimeout(function() {
				divElemDst.style.left = "10px";
				divElemDst.style.opacity = 1;
			}, 10);			
		}
		if(divElemSrc) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				divElemSrc.style.left = "10px";
				divElemSrc.style.opacity = 1;
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorEffect_SlideRight_V2 = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "all " + animationTime + "s linear 0s";
			divElemSrc.style.left = "10px";
			divElemSrc.style.left = (_docRootElem.offsetWidth + 100) + "px";
			divElemSrc.style.opacity = 0;
		}
		if(divElemDst) {
			divElemDst.style.left = "-" + (_docRootElem.offsetWidth + 100) + "px";
			divElemDst.style.opacity = 0;
			_showSlide(slideDestId);
			divElemDst.style.transition = "all " + animationTime + "s linear 0s";
			setTimeout(function() {
				divElemDst.style.left = "10px";
				divElemDst.style.opacity = 1;
			}, 10);			
		}
		if(divElemSrc) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				divElemSrc.style.left = "10px";
				divElemSrc.style.opacity = 1;
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorEffect_SlideLeft_V3 = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "all " + animationTime + "s ease 0s";
			divElemSrc.style.left = "10px";
			divElemSrc.style.left = "-" + (_docRootElem.offsetWidth + 100) + "px";
			divElemSrc.style.opacity = 0;
		}
		if(divElemDst) {
			divElemDst.style.left = (_docRootElem.offsetWidth + 100) + "px";
			divElemDst.style.opacity = 0;
			_showSlide(slideDestId);
			divElemDst.style.transition = "all " + animationTime + "s ease 0s";
			setTimeout(function() {
				divElemDst.style.left = "10px";
				divElemDst.style.opacity = 1;
			}, 10);			
		}
		if(divElemSrc) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				divElemSrc.style.left = "10px";
				divElemSrc.style.opacity = 1;
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorEffect_SlideRight_V3 = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "all " + animationTime + "s ease 0s";
			divElemSrc.style.left = "10px";
			divElemSrc.style.left = (_docRootElem.offsetWidth + 100) + "px";
			divElemSrc.style.opacity = 0;
		}
		if(divElemDst) {
			divElemDst.style.left = "-" + (_docRootElem.offsetWidth + 100) + "px";
			divElemDst.style.opacity = 0;
			_showSlide(slideDestId);
			divElemDst.style.transition = "all " + animationTime + "s ease 0s";
			setTimeout(function() {
				divElemDst.style.left = "10px";
				divElemDst.style.opacity = 1;
			}, 10);			
		}
		if(divElemSrc) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				divElemSrc.style.left = "10px";
				divElemSrc.style.opacity = 1;
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorEffect_SlideUp = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "top " + animationTime + "s linear 0s";
			divElemSrc.style.top = "10px";
			divElemSrc.style.top = "-" + (_docRootElem.offsetHeight + 0) + "px";
		}
		if(divElemDst) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				if(divElemSrc) divElemSrc.style.top = "10px";
				divElemDst.style.top = (_docRootElem.offsetHeight + 0) + "px";
				_showSlide(slideDestId);
				setTimeout(function() {
					divElemDst.style.transition = "top " + animationTime + "s linear 0s";
					divElemDst.style.top = "10px";
				}, animationTime * 1000);
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorEffect_SlideDown = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "top " + animationTime + "s linear 0s";
			divElemSrc.style.top = "10px";
			divElemSrc.style.top = (_docRootElem.offsetHeight + 0) + "px";
		}
		if(divElemDst) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				if(divElemSrc) divElemSrc.style.top = "10px";
				divElemDst.style.top = "-" + (_docRootElem.offsetHeight + 0) + "px";
				_showSlide(slideDestId);
				setTimeout(function() {
					divElemDst.style.transition = "top " + animationTime + "s linear 0s";
					divElemDst.style.top = "10px";
				}, animationTime * 1000);
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorEffect_SlideUp_V1 = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "top " + animationTime + "s linear 0s";
			divElemSrc.style.top = "10px";
			divElemSrc.style.top = "-" + (_docRootElem.offsetHeight + 100) + "px";
		}
		if(divElemDst) {
			divElemDst.style.top = (_docRootElem.offsetHeight + 100) + "px";
			_showSlide(slideDestId);
			divElemDst.style.transition = "top " + animationTime + "s linear 0s";
			setTimeout(function() {
				divElemDst.style.top = "10px";
			}, 10);			
		}
		if(divElemSrc) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				divElemSrc.style.top = "10px";
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorEffect_SlideDown_V1 = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "top " + animationTime + "s linear 0s";
			divElemSrc.style.top = "10px";
			divElemSrc.style.top = (_docRootElem.offsetHeight + 100) + "px";
		}
		if(divElemDst) {
			divElemDst.style.top = "-" + (_docRootElem.offsetHeight + 100) + "px";
			_showSlide(slideDestId);
			divElemDst.style.transition = "top " + animationTime + "s linear 0s";
			setTimeout(function() {
				divElemDst.style.top = "10px";
			}, 10);			
		}
		if(divElemSrc) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				divElemSrc.style.top = "10px";
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorEffect_SlideUp_V2 = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "all " + animationTime + "s linear 0s";
			divElemSrc.style.top = "10px";
			divElemSrc.style.top = "-" + (_docRootElem.offsetHeight + 100) + "px";
			divElemSrc.style.opacity = 0;
		}
		if(divElemDst) {
			divElemDst.style.top = (_docRootElem.offsetHeight + 100) + "px";
			divElemDst.style.opacity = 0;
			_showSlide(slideDestId);
			divElemDst.style.transition = "all " + animationTime + "s linear 0s";
			setTimeout(function() {
				divElemDst.style.top = "10px";
				divElemDst.style.opacity = 1;
			}, 10);			
		}
		if(divElemSrc) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				divElemSrc.style.top = "10px";
				divElemSrc.style.opacity = 1;
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorEffect_SlideDown_V2 = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "all " + animationTime + "s linear 0s";
			divElemSrc.style.top = "10px";
			divElemSrc.style.top = (_docRootElem.offsetHeight + 100) + "px";
			divElemSrc.style.opacity = 0;
		}
		if(divElemDst) {
			divElemDst.style.top = "-" + (_docRootElem.offsetHeight + 100) + "px";
			divElemDst.style.opacity = 0;
			_showSlide(slideDestId);
			divElemDst.style.transition = "all " + animationTime + "s linear 0s";
			setTimeout(function() {
				divElemDst.style.top = "10px";
				divElemDst.style.opacity = 1;
			}, 10);			
		}
		if(divElemSrc) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				divElemSrc.style.top = "10px";
				divElemSrc.style.opacity = 1;
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorEffect_SlideUp_V3 = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "all " + animationTime + "s ease 0s";
			divElemSrc.style.top = "10px";
			divElemSrc.style.top = "-" + (_docRootElem.offsetHeight + 100) + "px";
			divElemSrc.style.opacity = 0;
		}
		if(divElemDst) {
			divElemDst.style.top = (_docRootElem.offsetHeight + 100) + "px";
			divElemDst.style.opacity = 0;
			_showSlide(slideDestId);
			divElemDst.style.transition = "all " + animationTime + "s ease 0s";
			setTimeout(function() {
				divElemDst.style.top = "10px";
				divElemDst.style.opacity = 1;
			}, 10);			
		}
		if(divElemSrc) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				divElemSrc.style.top = "10px";
				divElemSrc.style.opacity = 1;
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorEffect_SlideDown_V3 = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "all " + animationTime + "s ease 0s";
			divElemSrc.style.top = "10px";
			divElemSrc.style.top = (_docRootElem.offsetHeight + 100) + "px";
			divElemSrc.style.opacity = 0;
		}
		if(divElemDst) {
			divElemDst.style.top = "-" + (_docRootElem.offsetHeight + 100) + "px";
			divElemDst.style.opacity = 0;
			_showSlide(slideDestId);
			divElemDst.style.transition = "all " + animationTime + "s ease 0s";
			setTimeout(function() {
				divElemDst.style.top = "10px";
				divElemDst.style.opacity = 1;
			}, 10);			
		}
		if(divElemSrc) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				divElemSrc.style.top = "10px";
				divElemSrc.style.opacity = 1;
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorEffect_Fade = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "opacity " + animationTime + "s linear 0s";
			divElemSrc.style.opacity = 0;
		}
		if(divElemDst) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				if(divElemSrc) divElemSrc.style.opacity = 1;
				divElemDst.style.opacity = 0;
				_showSlide(slideDestId);
				setTimeout(function() {
					divElemDst.style.transition = "opacity " + animationTime + "s linear 0s";
					divElemDst.style.opacity = 1;
				}, animationTime * 1000);
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorEffect_FlipY = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "all " + animationTime + "s ease 0s";
			divElemSrc.style.transform = "rotateY(180deg)";
			divElemSrc.style.opacity = 0;
		}
		if(divElemDst) {
			divElemDst.style.transform = "rotateY(180deg)";
			divElemDst.style.opacity = 0;
			_showSlide(slideDestId);
			divElemDst.style.transition = "all " + animationTime + "s ease 0s";
			setTimeout(function() {
				divElemDst.style.transform = "rotateY(0deg)";
				divElemDst.style.opacity = 1;
			}, 10);			
		}
		if(divElemSrc) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				divElemSrc.style.transform = "rotateY(0deg)";
				divElemSrc.style.opacity = 1;
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorEffect_FlipX = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "all " + animationTime + "s ease 0s";
			divElemSrc.style.transform = "rotateX(180deg)";
			divElemSrc.style.opacity = 0;
		}
		if(divElemDst) {
			divElemDst.style.transform = "rotateX(180deg)";
			divElemDst.style.opacity = 0;
			_showSlide(slideDestId);
			divElemDst.style.transition = "all " + animationTime + "s ease 0s";
			setTimeout(function() {
				divElemDst.style.transform = "rotateX(0deg)";
				divElemDst.style.opacity = 1;
			}, 10);			
		}
		if(divElemSrc) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				divElemSrc.style.transform = "rotateX(0deg)";
				divElemSrc.style.opacity = 1;
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorEffect_FlipZ = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "all " + animationTime + "s ease 0s";
			divElemSrc.style.transform = "rotateZ(180deg)";
			divElemSrc.style.opacity = 0;
		}
		if(divElemDst) {
			divElemDst.style.transform = "rotateZ(-180deg)";
			divElemDst.style.opacity = 0;
			_showSlide(slideDestId);
			divElemDst.style.transition = "all " + animationTime + "s ease 0s";
			setTimeout(function() {
				divElemDst.style.transform = "rotateZ(0deg)";
				divElemDst.style.opacity = 1;
			}, 10);			
		}
		if(divElemSrc) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				divElemSrc.style.transform = "rotateZ(0deg)";
				divElemSrc.style.opacity = 1;
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorEffect_ZoomIn = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "all " + animationTime + "s ease 0s";
			divElemSrc.style.transform = "scale(0)";
			divElemSrc.style.opacity = 0;
		}
		if(divElemDst) {
			divElemDst.style.transform = "scale(2)";
			divElemDst.style.opacity = 0;
			_showSlide(slideDestId);
			divElemDst.style.transition = "all " + animationTime + "s ease 0s";
			setTimeout(function() {
				divElemDst.style.transform = "scale(1)";
				divElemDst.style.opacity = 1;
			}, 10);			
		}
		if(divElemSrc) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				divElemSrc.style.transform = "scale(1)";
				divElemSrc.style.opacity = 1;
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorEffect_ZoomOut = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "all " + animationTime + "s ease 0s";
			divElemSrc.style.transform = "scale(2)";
			divElemSrc.style.opacity = 0;
		}
		if(divElemDst) {
			divElemDst.style.transform = "scale(0)";
			divElemDst.style.opacity = 0;
			_showSlide(slideDestId);
			divElemDst.style.transition = "all " + animationTime + "s ease 0s";
			setTimeout(function() {
				divElemDst.style.transform = "scale(1)";
				divElemDst.style.opacity = 1;
			}, 10);			
		}
		if(divElemSrc) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				divElemSrc.style.transform = "scale(1)";
				divElemSrc.style.opacity = 1;
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorEffect_ZoomInOut = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "all " + animationTime + "s ease 0s";
			divElemSrc.style.transform = "scale(0)";
			divElemSrc.style.opacity = 0;
		}
		if(divElemDst) {
			divElemDst.style.transform = "scale(0)";
			divElemDst.style.opacity = 0;
			_showSlide(slideDestId);
			divElemDst.style.transition = "all " + animationTime + "s ease 0s";
			setTimeout(function() {
				divElemDst.style.transform = "scale(1)";
				divElemDst.style.opacity = 1;
			}, 10);			
		}
		if(divElemSrc) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				divElemSrc.style.transform = "scale(1)";
				divElemSrc.style.opacity = 1;
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorEffect_ZoomOutIn = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "all " + animationTime + "s ease 0s";
			divElemSrc.style.transform = "scale(2)";
			divElemSrc.style.opacity = 0;
		}
		if(divElemDst) {
			divElemDst.style.transform = "scale(2)";
			divElemDst.style.opacity = 0;
			_showSlide(slideDestId);
			divElemDst.style.transition = "all " + animationTime + "s ease 0s";
			setTimeout(function() {
				divElemDst.style.transform = "scale(1)";
				divElemDst.style.opacity = 1;
			}, 10);			
		}
		if(divElemSrc) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				divElemSrc.style.transform = "scale(1)";
				divElemSrc.style.opacity = 1;
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorEffect_PresentorEffect_01 = function( slideSrcId, slideDestId ) {
		var divElemSrc = document.getElementById(slideSrcId);
		var divElemDst = document.getElementById(slideDestId);
		var animationTime = _DEFAULT_PRESENTOR_ANIM_TIME;

		if(divElemSrc) {
			divElemSrc.style.transition = "all " + animationTime + "s ease 0s";
			divElemSrc.style.transform = "scale(0) rotate(360deg)";
			divElemDst.style.opacity = 0;
		}
		if(divElemDst) {
			divElemDst.style.transform = "scale(0) rotate(360deg)";
			divElemDst.style.opacity = 0;
			_showSlide(slideDestId);
			divElemDst.style.transition = "all " + animationTime + "s ease 0s";
			setTimeout(function() {
				divElemDst.style.transform = "scale(1) rotate(0deg)";
				divElemDst.style.opacity = 1;
			}, animationTime * 500);			
		}
		if(divElemSrc) {
			setTimeout(function() {
				_hideSlide(slideSrcId);
				divElemSrc.style.transform = "scale(1) rotate(0deg)";
				divElemSrc.style.opacity = 1;
			}, animationTime * (divElemSrc ? 1000 : 10));
		}
	};

	var _presentorShowToast = function( toastMessage ) {
		var divElemToast = document.createElement('div');
		divElemToast.id = _DEFAULT_DIV_TOAST;
		divElemToast.innerHTML = toastMessage;
		divElemToast.className = _PRESENTOR_CSS_TOAST_SHOW;
		_docRootElem.appendChild(divElemToast);
		setTimeout(function() {
			document.getElementById(_DEFAULT_DIV_TOAST).remove();
		}, _DEFAULT_PRESENTOR_TOAST_TIME);
	}


	var addSlide = function( slideId ) {
		var divElem = document.getElementById(slideId);
		divElem.style.position = "absolute";
		var divElemTitle = document.getElementById(slideId + "." + _DOM_SLIDE_TITLE);
		var divElemContent = document.getElementById(slideId + "." + _DOM_SLIDE_CONTENT);
		_addClass(_PRESENTOR_CSS_SLIDE, divElem);
		if(divElemTitle !== null) _addClass(_PRESENTOR_CSS_SLIDE_TITLE, divElemTitle);
		if(divElemContent !== null) _addClass(_PRESENTOR_CSS_SLIDE_CONTENT, divElemContent);
		_hideSlide(slideId);
		_slideDeck.push({
							"slideId": slideId
						});
	};

	var gotoNextSlide = function( slideTransition ) {
		if(_slideShowStarted) {
			if(_currentSlideDeckIndex < _slideDeck.length - 1) {
				_transitionSlide(_slideDeck[_currentSlideDeckIndex++].slideId, 
								 _slideDeck[_currentSlideDeckIndex].slideId, 
								 slideTransition);
			} else {
				if(_setCyclicSlideShow) {
					_transitionSlide(_slideDeck[_currentSlideDeckIndex].slideId,
									 _slideDeck[0].slideId,
									 slideTransition);
					_currentSlideDeckIndex = 0;
				}
			}
		} else {
			console.log(_MSG_E_PRESENTOR_NOT_STARTED);
		}
	};
 
	var gotoPreviousSlide = function( slideTransition ) {
		if(_slideShowStarted) {
			if(_currentSlideDeckIndex > 0) {
				_transitionSlide(_slideDeck[_currentSlideDeckIndex--].slideId, 
								 _slideDeck[_currentSlideDeckIndex].slideId, 
								 slideTransition);
			} else {
				if(_setCyclicSlideShow) {
					_transitionSlide(_slideDeck[_currentSlideDeckIndex].slideId,
									 _slideDeck[_slideDeck.length - 1].slideId,
									 slideTransition);
					_currentSlideDeckIndex = _slideDeck.length - 1;
				}
			}
		} else {
			console.log(_MSG_E_PRESENTOR_NOT_STARTED);
		}
	};

	var gotoSlide = function( slideIndex, slideTransition ) {
		if(_slideShowStarted) {
			var slideIndex_ = -1,
				slideId_;
			if(slideIndex !== undefined) if(isNaN(slideIndex)) slideId_ = slideIndex;
										 else slideIndex_ = slideIndex;
			if(slideIndex_ === -1) {
				for(var i = 0; i < _slideDeck.length; i++) {
					if(_slideDeck[i].slideId === slideId_) {
						slideIndex_ = i;
						break;
					}
				}
			}
			if(slideIndex_ !== -1) {
				if(slideIndex_ < 0 || slideIndex_ > _slideDeck.length - 1) {
					console.error(_MSG_E_PRESENTOR_INDEX_OUT_OF_BOUND);
				} else {
					if(_currentSlideDeckIndex !== slideIndex_) {
						_transitionSlide(_slideDeck[_currentSlideDeckIndex].slideId, 
										 _slideDeck[slideIndex_].slideId, 
										 slideTransition);
						_currentSlideDeckIndex = slideIndex_;
					}
				}
			} else {
				console.error(_MSG_E_PRESENTOR_INDEX_OUT_OF_BOUND);
			}
		} else {
			console.log(_MSG_E_PRESENTOR_NOT_STARTED);
		}
	};

	var getSlideDeckArray = function() {
		return _slideDeck;
	};

	var resetSlideDeck = function() {
		_slideDeck = [];
	};

	var initSlideShow = function( startFromIndex, slideTransition ) {
		var startFromIndex_,
			slideTransition_;

		if(startFromIndex === undefined && slideTransition === undefined) {
			console.error(_MSG_E_PRESENTOR_TOO_FEW_ARG);
			return;
		}
		if(slideTransition === undefined) {
			if(startFromIndex !== undefined) if(isNaN(startFromIndex)) slideTransition_ = startFromIndex;
		} else {
			if(isNaN(startFromIndex)) {
				for(var i = 0; i < _slideDeck.length; i++) {
					if(_slideDeck[i].slideId === startFromIndex) {
						startFromIndex_ = i;
						break;
					}
				}
			} else {
				startFromIndex_ = startFromIndex;
			}
			if(!startFromIndex_) {
				console.error(_MSG_E_PRESENTOR_INDEX_OUT_OF_BOUND);
				return;
			}
			slideTransition_ = slideTransition;
		}
		if(!_slideShowStarted) {
			_currentSlideDeckIndex = startFromIndex_ ? (startFromIndex_ < _slideDeck.length ? startFromIndex_ : 0) : 0;
			if(_docRootElem && _slideDeck.length > 0) {_slideShowStarted = true; _resizeSlide(slideTransition_)};
		}
	};

	var setCyclicSideShow = function( cyclicSlideShow ) {
		_setCyclicSlideShow = cyclicSlideShow;
	};

	var getCyclicSideShow = function() {
		return _setCyclicSlideShow;
	};

	var getVersion = function() {
		return "" + _PRESENTOR_VER1 + "." + _PRESENTOR_VER2 + "." + _PRESENTOR_VER3;
	};

	var registerExternalEffects = function( effectName, effectCallback ) {
		_registerPresentorEffects( effectName, effectCallback );
	};

	var getRegisteredEffects = function() {
		var effectList = [];
		for(var effect in _effectList) effectList.push(effect);
		//for(var obj in _effectList) console.log(obj);
		return effectList;
	};

	var createDynamicSlide = function( slideJson ) {
		/*
			{
				slideId: 'dynamicSlide1',
				slideTitle: 'This is a dynamic Slide 1',
				slideContent: 'The content for this slide is created Dynamically.'
			}
		*/
		var divElemSlide = document.createElement('div'),
			divElemTitle = document.createElement('div'),
			divElemContent = document.createElement('div'),
			slideJson_ = slideJson;

		if(!slideJson_.hasOwnProperty('slideId')) {
			console.error(_MSG_E_PRESENTOR_NO_SLIDE_ID);
		} else {
			if(!slideJson_.hasOwnProperty('slideTitle')) slideJson_.slideTitle = "";
			if(!slideJson_.hasOwnProperty('slideContent')) slideJson_.slideContent = "";
			divElemSlide.id = slideJson_.slideId;
			divElemTitle.id = slideJson_.slideId + "." + _DOM_SLIDE_TITLE;
			divElemContent.id = slideJson_.slideId + "." + _DOM_SLIDE_CONTENT;
			divElemTitle.innerHTML = slideJson_.slideTitle;
			divElemContent.innerHTML = slideJson_.slideContent;
			divElemSlide.appendChild(divElemTitle);
			divElemSlide.appendChild(divElemContent);
			_docRootElem.appendChild(divElemSlide);
		}
	};

	var startSlideShow = function( configSlideShow ) {
		/*
			configSlideShow = {
								slideTransition : "*" | "effect_name",
								autoNavigationControl : true | false,
								timeForTransition : Time in mili sec {Min 3000},
								showToast : true | false
						      }
		*/
		var slideTransition_ = "*",
			autoNavigationControl_ = true,
			timeForTransition_ = _DEFAULT_PRESENTOR_TRANSITION_TIME,
			showToast_ = true,
			effectList_ = getRegisteredEffects();

		if(configSlideShow !== undefined) {
			if(configSlideShow.hasOwnProperty('slideTransition')) slideTransition_ = configSlideShow.slideTransition;
			if(configSlideShow.hasOwnProperty('autoNavigationControl')) autoNavigationControl_ = configSlideShow.autoNavigationControl;
			if(configSlideShow.hasOwnProperty('timeForTransition')) timeForTransition_ = configSlideShow.timeForTransition < timeForTransition_ ? 
																							timeForTransition_ : configSlideShow.timeForTransition;
			if(configSlideShow.hasOwnProperty('showToast')) showToast_ = configSlideShow.showToast;
		}
		if(!_setSlideShow) {
			_setSlideShow = true;
			function effectSelector_() {
				if(slideTransition_ === "*") return effectList_[Math.floor(Math.random() * effectList_.length)];
				else return slideTransition_;
			}
			if(autoNavigationControl_) {
				_presentorShowToast(_MSG_TOAST_PRESENTOR_AUTO_NAVIGATION);
				initSlideShow(effectSelector_());
				function showSlide_() {
					if(_setSlideShow) {
						setTimeout(function() {
							gotoNextSlide(effectSelector_());
							showSlide_();			
						}, timeForTransition_);
					}
				}
				showSlide_();
			} else {
				_presentorShowToast(_MSG_TOAST_PRESENTOR_KEY_NAVIGATION);
				document.addEventListener(_DOM_EVENT_KEYPRESS, function(event) {
					if(_readyForNextKeyEvent) {
						if(event.keyCode === _KEY_EVENT_RIGHT || event.keyCode === _KEY_EVENT_LEFT) {
							event.preventDefault();
							_readyForNextKeyEvent = false;
							if(event.keyCode === _KEY_EVENT_RIGHT) gotoNextSlide(effectSelector_());
							if(event.keyCode === _KEY_EVENT_LEFT) gotoPreviousSlide(effectSelector_());
							setTimeout(function() {
								_readyForNextKeyEvent = true;
							}, _DEFAULT_PRESENTOR_TRANSITION_TIME)
						}
					}
				});
			}
		} else console.log(_MSG_E_PRESENTOR_SLIDE_SHOW_RUNNING);
	};

	var stopSlideShow = function( ) {
		if(_setSlideShow) _setSlideShow = false;
		else console.log(_MSG_E_PRESENTOR_SLIDE_SHOW_STOPPED);
	};

	var presentor = window.presentor = function( rootId ) {
		_rootId = rootId || _DEFAULT_DIV;
		var winEventAttach = window.attachEvent || window.addEventListener;
		var winEventDetach = window.detachEvent || window.removeEventListener;
		_docRootElem = document.getElementById( _rootId );
		//_presentorModeSupported = _checkPresentorSupport();
		_initPresentor();
		if( _presentorModeSupported ) {
			return {
				addSlide: addSlide,
				gotoNextSlide: gotoNextSlide,
				gotoPreviousSlide : gotoPreviousSlide,
				gotoSlide : gotoSlide,
				getSlideDeckArray : getSlideDeckArray,
				resetSlideDeck : resetSlideDeck,
				initSlideShow : initSlideShow,
				setCyclicSideShow : setCyclicSideShow,
				getCyclicSideShow : getCyclicSideShow,
				getVersion : getVersion,
				registerExternalEffects : registerExternalEffects,
				getRegisteredEffects : getRegisteredEffects,
				createDynamicSlide : createDynamicSlide,
				startSlideShow : startSlideShow,
				stopSlideShow : stopSlideShow
			};
		} else {
			_docRootElem.innerHTML = "<div class='presentor_notSupported'>" + _MSG_E_PRESENTOR_NOT_SUPPORTED + "</div>";
			console.error(_MSG_E_PRESENTOR_NOT_SUPPORTED);
		}
		winEventAttach( _DOM_EVENT_RESIZE, function() {
			_resizeSlide();
		});
	};
})( document, window );