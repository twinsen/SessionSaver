// requires: SystemTest.js

// Tests visiting two sites, one in each window and saving session.
var testCaseTwoWindowSaveAll = new YAHOO.tool.TestCase(
{
	name: "testCaseTwoWindowSaveAll",

	// Returns current window and a new window id.
	// afterCallback(array) - Returns array containing 2 window ids.
	getTwoWindows: function(afterCallback)
	{
		var windowIDs = new Array();
		var backgroundPage = getBackgroundPage();
		backgroundPage.getCurrentWindowID(
		function(windowID1)
		{
			testCaseTwoWindowSaveAll.resume(function()
			{
				windowIDs.push(windowID1);
				backgroundPage.createWindow800x600(function(windowID2)
				{
					testCaseTwoWindowSaveAll.resume(function()
					{
						windowIDs.push(windowID2);
						afterCallback(windowIDs);
					});
				});
				testCaseTwoWindowSaveAll.wait();
			});
		});
		testCaseTwoWindowSaveAll.wait();
	},

	// Opens url urlList[index] in window windowIDs[index].
	// Waits for url to open, resumes, then opens index+1 until the end of the arrays.
	// index - Index into arrays to use.
	// urlList - List of urls to open.
	// windowIDs - List of windows to open urls in.
	_openWaitResume: function(index, urlList, windowIDs, afterCallback)
	{
		var i = index;
		var backgroundPage = getBackgroundPage();		
		backgroundPage.openLinkInNewTabInWindow(urlList[i], windowIDs[i], function()
		{
			testCaseTwoWindowSaveAll.resume(function()
			{
				// If it was the last one call afterCallback.
				if (index==urlList.length-1)
				{
					afterCallback();
				}
				else
				{
					// Otherwise open the next one.
					testCaseTwoWindowSaveAll._openWaitResume(i+1, urlList, windowIDs, afterCallback);			
				}
			});
		});
		testCaseTwoWindowSaveAll.wait();		
	},

	// Opens all urls in urlList in corresponding windows in windowIDs.
	openInWindows: function(urlList, windowIDs, afterCallback)
	{		
		testCaseTwoWindowSaveAll._openWaitResume(0, urlList, windowIDs, afterCallback);
	},

	// Tests visiting two sites and saves and deletes the session, ensuring 
	// expected session data is saved.
	testTwoWindowSaveAll: function()
	{
		var backgroundPage = getBackgroundPage();
		
		var call = new Array();
		var args = new Array();
		
		// Setup: close all tabs except the SystemTests.html tab and the debugger.
		// Run closeTabs();
		call.push(testCaseTwoWindowSaveAll.closeTabs);
		args.push(new Array());

		// Test bgpAddSaveSession.
		call.push(function(args, fnList)
		{
			// Turn off close saved tabs and current window only.
			oldSaveCurrentWindowOnly = backgroundPage.getOptions().getSaveCurrentWindowOnly();
			oldCloseSavedTabs = backgroundPage.getOptions().getCloseSavedTabs();			
			backgroundPage.getOptions().setSaveCurrentWindowOnly(false);
			backgroundPage.getOptions().setCloseSavedTabs(false);

			// Open google in current window and iinet in a new window.
			testCaseTwoWindowSaveAll.getTwoWindows(
			function(windowIDs)
			{
				var urlList = new Array();
				urlList.push("http://www.google.com.au/");
				urlList.push("http://www.iinet.net.au/customers/");

				testCaseTwoWindowSaveAll.openInWindows(urlList, windowIDs, function()
				{
					// Close new tabs left from creating a new window.
					backgroundPage.closeNewTabs(function()
					{
						testCaseTwoWindowSaveAll.resume(function()
						{
							// Save session and ensure contains urls from both windows.
							var expectedLastSessionUrls = "http://www.google.com.au/\n"+
														  "http://www.iinet.net.au/customers/\n";
							
							testCaseTwoWindowSaveAll.verifySaveAndDelete(
								testCaseTwoWindowSaveAll, expectedLastSessionUrls, function()
							{
								// Restore previous options.
								backgroundPage.getOptions().setSaveCurrentWindowOnly(oldSaveCurrentWindowOnly);
								backgroundPage.getOptions().setCloseSavedTabs(oldCloseSavedTabs);
								fnList.next();
							});
						});
					});
					
					testCaseTwoWindowSaveAll.wait();
				});
			});
		});
		args.push(new Array());
		
		// TearDown: close all tabs except the SystemTests.html tab and the debugger.
		// Run closeTabs();
		call.push(testCaseTwoWindowSaveAll.closeTabs);
		args.push(new Array());

		// Execute function list.
		var fnList = new FnList(call, args, testCaseTwoWindowSaveAll);
		fnList.next();
	}
});
inheritTestCase(testCaseTwoWindowSaveAll, BaseSystemTest);
