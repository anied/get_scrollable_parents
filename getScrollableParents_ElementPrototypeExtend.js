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

    	var isScrollable=true; // innocent until proven guilty

    	function checkOverflow() {

    		var axesToCheck = {
    			'X' : checkHorizontal,
    			'Y' : checkVertical
    		};
    		var scrollingAllowedPerAllEvaluatedOverflowAxes = true; // innocent until proven guilty
    		var key;

	    	function checkOverflowByAxis(axis) {    		
		        var overflow;
		        var scrollingAllowedPerOverflowStyle;

		        if (axis !== 'X' && axis !== 'Y') {
		        	throw new Error ("Unexpected Input: checkOverflowByAxis expects to be passed 'X' or 'Y'."); // this method is not exposed so I'm not expecting this will ever execute...
		        }

		        axis = axis.toUppercase();
		        overflow = window.getComputedStyle(node)['overflow'+axis];
		        scrollingAllowedPerOverflowStyle = overflow !== 'visible' && overflow !== 'hidden';
	        	return scrollingAllowedPerOverflowStyle;
	    	}
	    	// todo -- this is goofy and *must* be able to be done in a better way that I'll see when I'm better rested-- gonna make it work then gonna make it good
	    	for (key in axesToCheck) {
	    		if (axesToCheck.hasOwnProperty(key)) {
	    			scrollingAllowedPerAllEvaluatedOverflowAxes = checkOverflowByAxis(key);
	    			if (scrollingAllowedPerAllEvaluatedOverflowAxes === false) {
	    				return scrollingAllowedPerAllEvaluatedOverflowAxes;
	    			}
	    		}
	    	}

	    	return scrollingAllowedPerAllEvaluatedOverflowAxes;

    	}

    	if (!config.ignoreOverflow) {
    		isScrollable = isScrollable && checkOverflow();
    	}



        if ( (isScrollable) && (node.clientHeight !== 0) && (node.scrollHeight > node.clientHeight) ) {
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