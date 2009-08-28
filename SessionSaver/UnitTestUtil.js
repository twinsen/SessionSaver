// Shared code for unit tests.
var Assert = YAHOO.util.Assert;

// FnList encapsulates a list of callbacks and arguments 
// to call a function chain in a sequential order.
// Constructor.
// callbackList - Array of functions.
// args - Array of Arrays of arguments for each function.
// parent - Reference to parent "this" (eg testCaseObject) that can be accessed by callbacks.
function FnList(callbackList, argsList, parent)
{
	this.callbackList = callbackList;
	this.argsList = argsList;
	this.parent = parent;
	// returnValue can be set to when the next function needs to see the result of the previous function.
	this.returnValue = null;
}

// Calls next function in callbackList.
// Typically called in the innermost nested function.
FnList.prototype.next = function()
{
	var callback = this.callbackList.shift();
	var args = this.argsList.shift();
	if (callback)
	{
		callback(args, this);
	}
}

// Helper to support inheritance in TestCases.
function inheritTestCase(child, parent)
{
	// Copy methods.
    for (var method in parent)
	{
        child[method] = parent[method];
    }
	// Copy member variables.
	var parentInstance = new parent();
    for (var memberVariable in parentInstance)
	{
        child[memberVariable] = parentInstance[memberVariable];
    }
}
