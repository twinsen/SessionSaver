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
	
	_openCallback: function(index, urlList, afterCallback)
	{
console.log("ci:"+index);
		if (index==urlList.length-1)
		{
console.log("aft:"+index);
			afterCallback();
		}
	},
	
	_openWaitResume: function(index, urlList, windowIDs, afterCallback)
	{
		var i = index;
		var backgroundPage = getBackgroundPage();		
		backgroundPage.openLinkInNewTabInWindow(urlList[i], windowIDs[i], function()
		{
console.log("resume");
			testCaseTwoWindowSaveAll.resume(function()
			{
console.log("bc");

//if it was the last one call afterCallback
		if (index==urlList.length-1)
		{
console.log("aft:"+index);
			afterCallback();
		}
		else
		{
			// otherwise open the next one
console.log("ac");
				testCaseTwoWindowSaveAll._openWaitResume(i+1, urlList, windowIDs, afterCallback);			
		}

//todo: currently ends here, needs to nest next openlink at this level
//open
// wait
// resume
//   open
//     wait
//     resume
			});
		});
console.log("iwait:"+i);
		testCaseTwoWindowSaveAll.wait();		
	},
	
	/*
	_closeNewTabs: function(windowIDs, afterCallback)
	{
		chrome.tabs.getAllInWindow(windowIDs[i],function(tabs)
		{
			var tabsToClose = new Array();
			for (var i=0;i<tabs.length;++i)
			{
				if (tabs[i].url=="chrome://newtab/")
				{
					tabsToClose.push(tabs[i].id);
				}
			}
			
		});
		chrome.windows.get
			chrome.windows.getAll(true,function(wins)
	{
	},*/
	
	//todo: not working properly
	openInWindows: function(urlList, windowIDs, afterCallback)
	{
console.log("A: "+urlList.length);
//	        this.wait(function(){ 

//		var backgroundPage = getBackgroundPage();	
		
		testCaseTwoWindowSaveAll._openWaitResume(0, urlList, windowIDs, afterCallback);
		/*
		for (var i=0;i<urlList.length;++i)
		{
console.log("i:"+i+" winID: "+windowIDs[i]+" url: "+urlList[i]);
			backgroundPage.openLinkInNewTabInWindow(urlList[i], windowIDs[i], function()
			{
console.log("resume");
				testCaseTwoWindowSaveAll.resume(function()
				{			
console.log("bc");

					testCaseTwoWindowSaveAll._openCallback(i, urlList, afterCallback);
console.log("ac");
//todo: currently ends here, needs to nest next openlink at this level
//open
// wait
// resume
//   open
//     wait
//     resume
				});
			});
console.log("iwait:"+i);
			testCaseTwoWindowSaveAll.wait();			
		}
		*/
			
	         
//	        }, 5000); 
	
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
console.log("1");
				testCaseTwoWindowSaveAll.openInWindows(urlList, windowIDs, function()
				{
console.log("2");
					backgroundPage.closeNewTabs(function()
					{
						testCaseTwoWindowSaveAll.resume(function()
						{	
console.log("2.5");

					var expectedLastSessionUrls = "http://www.google.com.au/\n"+
													"http://www.iinet.net.au/customers/\n";
							
					testCaseTwoWindowSaveAll.verifySaveAndDelete(
						testCaseTwoWindowSaveAll, expectedLastSessionUrls, function()
					{
console.log("3");
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
