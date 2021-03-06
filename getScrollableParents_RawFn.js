function getScrollableParents(startingNode, ignoreOverflow_or_Config, ignoreHorizontal, includeSelf) {

    var scrollable_parents_array = [];
    var config = {
    	ignoreOverflow : false,
    	ignoreHorizontal : false,
    	includeSelf : true
    }; // in case a config is not passed in.

    function getScrollParents(node) {

        var overflowY = window.getComputedStyle(node).overflowY;
        var isScrollable = overflowY !== 'visible' && overflowY !== 'hidden';


        if ( (isScrollable) && (node.clientHeight !== 0) && (node.scrollHeight > node.clientHeight) ) {
            scrollable_parents_array.push(node);
        }

        if (node.parentNode !== document) {
            getScrollParents(node.parentNode);
        }

    }


    function setDefaults() {

    	var userConfig;

        function isUndefinedOrNull(val) {
            return (val === null || val === undefined);
        }

    	// function setDefaultsForIndividualArgs() {
	    //     if (startingNode === null) {
	    //         return null;
	    //     }

	    //     if ( isUndefinedOrNull(ignoreOverflow) ) {
	    //         ignoreOverflow = false;
	    //     }

	    //     if ( isUndefinedOrNull(ignoreHorizontal) ) {
	    //         ignoreHorizontal = false;
	    //     }

	    //     if ( includeSelf(includeSelf) ) {
	    //         includeSelf = true
	    //     }		
    	// }

    	if (isUndefinedOrNull(ignoreOverflow_or_Config) && isUndefinedOrNull(ignoreHorizontal) && isUndefinedOrNull(includeSelf)) {
    		return;
    	} else if (typeof ignoreOverflow_or_Config === 'boolean') {
    		userConfig = {
    			ignoreOverflow : ignoreOverflow_or_Config,
    			ignoreHorizontal : ignoreHorizontal,
    			includeSelf : includeSelf
    		}
    	} else if(typeof ignoreOverflow_or_Config === 'object') {
    		userConfig = ignoreOverflow_or_Config;
    	} else {
    		throw new Error("Unexpected Input-- expected input")
    	}
        

    }


    getScrollParents(startingNode);

    return scrollable_parents_array;

}