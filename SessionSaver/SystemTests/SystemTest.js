// Common base class for System Tests

// Constructor
function BaseSystemTest()
{
}

// Closes all window tabs that are not the SystemTests.html tab or the debugger.
// fnList.parent needs to be set to the test case instance.
BaseSystemTest.closeTabs = function(args, fnList)
{
	var thisTestCase = fnList.parent;
	var backgroundPage = getBackgroundPage();

	// Don't close system test tab or the debugger.
	var exceptionList = new Array("SystemTests.html", "chrome://devtools/devtools.html");
	backgroundPage.closeTabsExceptUrl(exceptionList, function()
	{
		thisTestCase.resume(function()
		{
			fnList.next();
		});
	});
	thisTestCase.wait();
}

BaseSystemTest.verifySaveAndDelete = function(testCase, expectedLastSessionUrls, afterCallback)
{
	var backgroundPage = getBackgroundPage();
	var oldNumSessions = backgroundPage.getNumSessions();

	// Verify save session.
	backgroundPage.bgpAddSaveSession("SystemTest_testTwoSites", function()
	{
		testCase.resume(function()
		{
			var newNumSessions = backgroundPage.getNumSessions();
			YAHOO.util.Assert.areEqual(oldNumSessions+1, newNumSessions, 
				"Expected saving session to increase number of sessions by one.");
			
			var lastSessionID = newNumSessions-1;
			var lastSessionUrls = backgroundPage.getSessionUrls(lastSessionID);
			YAHOO.util.Assert.areEqual(expectedLastSessionUrls, lastSessionUrls, 
				"Expected save session to include urls: "+expectedLastSessionUrls);
			
			// Verify Delete session.
			backgroundPage.bgpDeleteSessionID(lastSessionID, function()
			{
				testCase.resume(function()
				{
					newNumSessions = backgroundPage.getNumSessions();
					YAHOO.util.Assert.areEqual(oldNumSessions, newNumSessions, 
						"Expected deleting session to decrease number of sessions by one.");
						afterCallback();
				});
			});
			testCase.wait();	
		});
	});
	testCase.wait();
}

BaseSystemTest._openPagesHelper = function(i, urlList, afterCallback)
{
	var index = i;
	var backgroundPage = getBackgroundPage();
	var url = urlList[index];
	backgroundPage.openLinkInNewTab(url, function()
	{
		if (index == urlList.length-1 && afterCallback)
		{
			afterCallback();
		}
	});
}

BaseSystemTest.openPages = function(testCase, urlList, afterCallback)
{
	for (var i=0;i<urlList.length;++i)
	{
		testCase._openPagesHelper(i, urlList, afterCallback);
	}
}
