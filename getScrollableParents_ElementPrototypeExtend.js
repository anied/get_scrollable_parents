Element.prototype.getScrollableParents = function (ignoreOverflow_or_Config, checkVertical, checkHorizontal, includeSelf) {

	'use strict';

	var startingNode = this;

    var scrollable_parents_array = [];
    var config = {
    	ignoreOverflow : false,
    	checkVertical : true,
    	checkHorizontal : true,
    	includeSelf : true
    }; // default config.

    var checkScrollableByStyle;
    var checkScrollableByDimension;

    var warn = typeof console.warn === 'function' ? console.warn : console.log;

    var passedArgs = arguments;

    function getScrollParents(node) {

    	var isScrollable;

    	function checkOverflow() {

    		var axesToCheck = {
    			'X' : config.checkHorizontal,
    			'Y' : config.checkVertical
    		};
    		var key;

	    	function checkOverflowByAxis(axis) {    		
		        var overflow;
		        var scrollingAllowedPerOverflowStyle;
		        axis = axis.toUpperCase();

		        if (axis !== 'X' && axis !== 'Y') {
		        	throw new Error ("Unexpected Input To Private Function : DEVELOPER ERROR : checkOverflowByAxis expects to be passed 'X' or 'Y'."); // this method is not exposed so I'm not expecting this will ever execute...
		        }

		        overflow = window.getComputedStyle(node)['overflow'+axis];
		        scrollingAllowedPerOverflowStyle = overflow !== 'visible' && overflow !== 'hidden';
	        	return scrollingAllowedPerOverflowStyle;
	    	}

	    	for (key in axesToCheck) {
	    		if (axesToCheck.hasOwnProperty(key) && axesToCheck[key] === true) {
	    			// placed in its own line for readability even though it represents a logical &&
	    			if (checkOverflowByAxis(key) === true) { // if at any point this is true, the element is by definition scrollable per whatever axis was checked so we can return true
	    				return true;
	    			}
	    		}
	    	}

	    	return false; // if we've reached this point, every axis checked was found disallowed from scrolling per styles, so we return false

    	}

    	function checkDimensions() { // very similar to the checkOverflow-- may be a DRY opportunity here, although that might be beginning to get a little over-engineered given only two similar cases atm...

    		var dimensionsToCheck = {
    			'Width' : config.checkHorizontal,
    			'Height' : config.checkVertical
    		};
    		var key;

    		function checkBySpecificDimension(dimension) {
    			if (dimension !== 'Height' && dimension !== 'Width') {
    				throw new Error ("Unexpected Input To Private Function : DEVELOPER ERROR : checkBySpecificDimension expects to be passed 'Height' or 'Width' as arguments."); // this method is not exposed so I'm not expecting this will ever execute...
    			}
    			return node['client'+dimension] !== 0 && node['scroll'+dimension] > node['client'+dimension];
    		}

    		for (key in dimensionsToCheck) {
    			if (dimensionsToCheck.hasOwnProperty(key) && dimensionsToCheck[key] === true) {
    				// placed in its own line for readability even though it represents a logical &&
    				if (checkBySpecificDimension(key) === true) { // if at any point this is true, the element is by definition scrollable per whatever dimension was checked so we can return true
    					return true;
    				}
    			}
    		}

    		return false; // if we've reached this point, every axis checked was found disallowed from scrolling per styles, so we return false 

    	}

    	isScrollable = (!config.ignoreOverflow ? checkOverflow() : true) && checkDimensions();

        if ( isScrollable ) {
            scrollable_parents_array.push(node);
        }

        if (node.parentNode !== document) {
            getScrollParents(node.parentNode);
        }

    }


    function setConfig() {

    	var userConfig;

        function isUndefinedOrNull(val) {
            return (val === null || val === undefined);
        }

        function extendUserConfig() {
        	var key;
        	for (key in userConfig) {
        		if (userConfig.hasOwnProperty(key) && !isUndefinedOrNull(userConfig[key]) ) {
        			if (typeof userConfig[key] !== 'boolean') {
        				throw new Error('Unexpected Input: configuration flags should be set to boolean values.');
        			}
        			config[key] = userConfig[key];
        		}
        	}
        }

        function noConfigsWerePassed() {
        	var i;
        	var numUndefinedArguments = 0;
        	for (i=0; i<passedArgs.length; i++) {
        		if (isUndefinedOrNull(passedArgs[i])) {
        			numUndefinedArguments++;
        		}
        	}
        	return numUndefinedArguments === passedArgs.length;
        }

    	if (typeof ignoreOverflow_or_Config === 'boolean') {
    		userConfig = {
    			ignoreOverflow : ignoreOverflow_or_Config,
    			checkVertical : checkVertical,
    			checkHorizontal : checkHorizontal,
    			includeSelf : includeSelf
    		};
    	} else if(typeof ignoreOverflow_or_Config === 'object') {
    		userConfig = ignoreOverflow_or_Config;
    	} else if (noConfigsWerePassed()) {
    		return;
    	} else {
    		throw new Error("Unexpected Input: expected boolean flags or a config object (or nothing) to be passed as arguments.");
    	}

    	extendUserConfig();

    }

    setConfig();

	if (config.checkVertical === false && config.checkHorizontal === false) {
		warn("Both checkVertical and checkHorizontal flags were set to false-- this will always return an empty array as there is no other scrolling direction to check for.");
		return scrollable_parents_array;
	}

    if (!config.includeSelf) {
    	startingNode = startingNode.parentNode;
    }

    getScrollParents(startingNode);

    return scrollable_parents_array;

};