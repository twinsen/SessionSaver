include("String.js");

// Tests string functions.
var testCaseStrings = new YAHOO.tool.TestCase(
{
	name: "testCaseStrings",

	testChunk: function()
	{
		var actualString = "";
		var expectedString = "1chrome://extensions/2345679";
		var chunkArray = expectedString.chunk(2);
		var i;
		for (i=0;i<chunkArray.length;++i)
		{
			actualString+=chunkArray[i];		
		}

		YAHOO.util.Assert.areEqual(expectedString, actualString, 
			"Expected combined string to be identical to original.");
	},

	testFalseStringToBool: function()
	{
		var falseString = "false";
		var expectedValue = false;
		var actualValue = falseString.toBool();

		YAHOO.util.Assert.areEqual(expectedValue, actualValue, 
			"Expected string to convert to false.");
	},
		
	testTrueStringToBool: function()
	{
		var trueString = "true";
		var expectedValue = true;
		var actualValue = trueString.toBool();

		YAHOO.util.Assert.areEqual(expectedValue, actualValue, 
			"Expected string to convert to true.");
	}		
});
