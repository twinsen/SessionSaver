// requires: SystemTest.js

// Tests visiting two sites and saving session.
var testCaseTwoSites = new YAHOO.tool.TestCase(
{
	name: "testCaseTwoSites",

	// Tests visiting two sites and saves and deletes the session, ensuring 
	// expected session data is saved.
	testTwoSites: function()
	{
		var backgroundPage = getBackgroundPage();
		
		var call = new Array();
		var args = new Array();
		
		// Setup: close all tabs except the SystemTests.html tab and the debugger.
		// Run closeTabs();
		call.push(testCaseTwoSites.closeTabs);
		args.push(new Array());

		// Test bgpAddSaveSession.
		call.push(function(args, fnList)
		{
			// Turn off close saved tabs and current window only.
			oldSaveCurrentWindowOnly = backgroundPage.getOptions().getSaveCurrentWindowOnly();
			oldCloseSavedTabs = backgroundPage.getOptions().getCloseSavedTabs();			
			backgroundPage.getOptions().setSaveCurrentWindowOnly(false);
			backgroundPage.getOptions().setCloseSavedTabs(false);

			// Visit google and iinet.
			var urlList = new Array();
			urlList.push("http://www.google.com.au/");
			urlList.push("http://www.iinet.net.au/customers/");
			testCaseTwoSites.openPages(testCaseTwoSites, urlList, function()
			{
				testCaseTwoSites.resume(function()
				{
					var expectedLastSessionUrls = 	"http://www.google.com.au/\n"+
													"http://www.iinet.net.au/customers/\n";

					testCaseTwoSites.verifySaveAndDelete(testCaseTwoSites, expectedLastSessionUrls, function()
					{
						// Restore previous options.
						backgroundPage.getOptions().setSaveCurrentWindowOnly(oldSaveCurrentWindowOnly);
						backgroundPage.getOptions().setCloseSavedTabs(oldCloseSavedTabs);
						fnList.next();
					});
				});
			});
			testCaseTwoSites.wait();
		});
		args.push(new Array());
		
		// TearDown: close all tabs except the SystemTests.html tab and the debugger.
		// Run closeTabs();
		call.push(testCaseTwoSites.closeTabs);
		args.push(new Array());

		// Execute function list.
		var fnList = new FnList(call, args, testCaseTwoSites);
		fnList.next();
	}
});
inheritTestCase(testCaseTwoSites, BaseSystemTest);
