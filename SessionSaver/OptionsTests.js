//requires: UnitTestUtil.js, Options.js

// Tests Options::save().
var testCaseOptionsSave = new YAHOO.tool.TestCase(
{
	name: "testCaseOptionsSave", 

	createUnitTestOptions: function()
	{
		var options = createOptions();
		options.setBookmarkManagerFolder("[UnitTestSessionSaverSettings]");
		return options;
	},	
	
	assertOptionsAreEqual: function(referenceOptions, actualOptions)
	{
		Assert.areEqual(referenceOptions.SaveCurrentWindowOnly, actualOptions.SaveCurrentWindowOnly, 
			"SaveCurrentWindowOnly option is different");
		Assert.areEqual(referenceOptions.CloseSavedTabs, actualOptions.CloseSavedTabs, 
			"CloseSavedTabs option is different");
	},
	
	// Helper function that saves and loads supplied options to see if their state is identical.
	assertOptionsSaveAndLoadAreEqual: function(saveOptions, afterCallback)
	{
		thisTestCase = this;
		saveOptions.save(function()
		{
			thisTestCase.resume(function()
			{
				var loadOptions = thisTestCase.createUnitTestOptions();
				loadOptions.load(function()
				{
					thisTestCase.resume(function()
					{
						thisTestCase.assertOptionsAreEqual(saveOptions, loadOptions);
						if (afterCallback)
						{
							afterCallback();
						}
					});
				});
				thisTestCase.wait();
			});
		});
		thisTestCase.wait();
	},	
	
	// Tests Options::save() to ensure it saves options state when all options are true.
	testOptionsSaveAllTrue: function()
	{
		thisTestCase = this;	
		var saveOptions = thisTestCase.createUnitTestOptions();
		saveOptions.setSaveCurrentWindowOnly(true);
		saveOptions.setCloseSavedTabs(true);
		saveOptions.setLogging(true);
		thisTestCase.assertOptionsSaveAndLoadAreEqual(saveOptions);
	},

	// Tests Options::save() to ensure it saves options state when all options are false.
	testOptionsSaveAllFalse: function()
	{
		thisTestCase = this;	
		var saveOptions = thisTestCase.createUnitTestOptions();
		saveOptions.setSaveCurrentWindowOnly(false);
		saveOptions.setCloseSavedTabs(false);
		saveOptions.setLogging(false);
		thisTestCase.assertOptionsSaveAndLoadAreEqual(saveOptions);		
	},

	// Tests Options::save() to ensure it saves options state when all options are a mixture.
	testOptionsSaveMixture: function()
	{
		thisTestCase = this;
	
		var saveOptions = thisTestCase.createUnitTestOptions();
		saveOptions.setSaveCurrentWindowOnly(false);
		saveOptions.setCloseSavedTabs(true);
		saveOptions.setLogging(false);
		thisTestCase.assertOptionsSaveAndLoadAreEqual(saveOptions, function()
		{
			thisTestCase.resume(function()
			{
				var saveOptions = thisTestCase.createUnitTestOptions();
				saveOptions.setSaveCurrentWindowOnly(true);
				saveOptions.setCloseSavedTabs(false);
				saveOptions.setLogging(true);
				thisTestCase.assertOptionsSaveAndLoadAreEqual(saveOptions);			
			});
		});
		thisTestCase.wait();
	},
	
	createUnitTestBookmarkManager: function()
	{
	var bookmarkManager = createBookmarkManager();
	bookmarkManager.folderName = "[UnitTestSessionSaverSettings]";
	return bookmarkManager;
	},
	
	removeUnitTestBookmarks: function(args, fnList)
	{
	var thisTestCase = fnList.parent;
	var bookmarkManager = thisTestCase.createUnitTestBookmarkManager();

	// Setup: remove any existing unit test bookmarks.		
	bookmarkManager.removeBookmarkFolderAll(function()
	{
		thisTestCase.resume(function()
		{
			// Setup: ensure there are no unit test bookmarks.
			bookmarkManager.getNumBookmarkFolders(function(numBookmarkFolders)
			{
				thisTestCase.resume(function()
				{
					Assert.areEqual(0, numBookmarkFolders, 
						"Expect no bookmarks, but there were: "+numBookmarkFolders);
					fnList.next();
				});
			});
			thisTestCase.wait();
		});
	});
	thisTestCase.wait();
	},

	// Tests Options::load() to ensure it doesn't fail when bookmarks are empty.
	testOptionsLoadFromEmpty: function()
	{
		var thisTestCase = this;
		var bookmarkManager = thisTestCase.createUnitTestBookmarkManager();

		var call = new Array();
		var args = new Array();
		
		// Setup: ensure there is no [UnitTestSessionSaverSettings] bookmark folder.
		// Run removeUnitTestBookmarks();
		call.push(thisTestCase.removeUnitTestBookmarks);
		args.push(new Array());
		
		// Test load() and ensure afterwards options contains default options.	
		call.push(function(args, fnList)
		{
			var loadOptions = thisTestCase.createUnitTestOptions();
			loadOptions.load(function()
			{
				thisTestCase.resume(function()
				{
					var defaultOptions = thisTestCase.createUnitTestOptions();
					thisTestCase.assertOptionsAreEqual(defaultOptions, loadOptions);
					fnList.next();
				});	
			});
			thisTestCase.wait();
		});
		args.push(new Array());

		// TearDown: remove unit test bookmarks.
		// Run removeUnitTestBookmarks();
		call.push(thisTestCase.removeUnitTestBookmarks);
		args.push(new Array());

		// Execute function list.
		var fnList = new FnList(call, args, this);
		fnList.next();		
	}
	
});
