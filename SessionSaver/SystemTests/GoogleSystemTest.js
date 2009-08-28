// requires SystemTest.js

// Tests visiting google and saving session.
var testCaseGoogle = new YAHOO.tool.TestCase(
{
	name: "testCaseGoogle",

	// Warning: chrome functions are unreliable from system test window, must be called in background page.
	// so they must be wrapped before they can be called to setup / teardown the SUT.
	
	// If you are not careful the this pointer gets changed and wait/resume stop the test immediately (even with 
	// a pass condition!).
	// Don't use "this", use "testCaseGoogle" instead.

	// Tests visiting a single url (google) and saves and deletes the session, ensuring 
	// expected session data is saved.
	testGoogle: function()
	{
		var backgroundPage = getBackgroundPage();
		
		var call = new Array();
		var args = new Array();
		
		// Setup: close all tabs except the SystemTests.html tab and the debugger.
		// Run closeTabs();
		call.push(testCaseGoogle.closeTabs);
		args.push(new Array());

		// Test bgpAddSaveSession.
		call.push(function(args, fnList)
		{
			// Turn off close saved tabs and current window only.
			oldSaveCurrentWindowOnly = backgroundPage.getOptions().getSaveCurrentWindowOnly();
			oldCloseSavedTabs = backgroundPage.getOptions().getCloseSavedTabs();			
			backgroundPage.getOptions().setSaveCurrentWindowOnly(false);
			backgroundPage.getOptions().setCloseSavedTabs(false);
		
			// Visit google.
			var url = "http://www.google.com.au/";
			backgroundPage.openLinkInNewTab(url, function()
			{
				testCaseGoogle.resume(function()
				{
					var expectedLastSessionUrls = 	"http://www.google.com.au/\n"
					testCaseGoogle.verifySaveAndDelete(testCaseTwoSites, expectedLastSessionUrls, function()
					{
						// Restore previous options.
						backgroundPage.getOptions().setSaveCurrentWindowOnly(oldSaveCurrentWindowOnly);
						backgroundPage.getOptions().setCloseSavedTabs(oldCloseSavedTabs);
						fnList.next();
					});
				});
			});
			testCaseGoogle.wait();			
		});
		args.push(new Array());
		
		// TearDown: close all tabs except the SystemTests.html tab and the debugger.
		// Run closeTabs();
		call.push(testCaseGoogle.closeTabs);
		args.push(new Array());

		// Execute function list.
		var fnList = new FnList(call, args, testCaseGoogle);
		fnList.next();
	}
});
inheritTestCase(testCaseGoogle, BaseSystemTest);
