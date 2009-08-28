//requires: UnitTestUtil.js, BookmarkManager.js

// Constructor
function BaseTestCaseBookmarkManager()
{
	// Name of folder to create in the Bookmarks bar.
	this.m_folderName = "[UnitTestSessionSaverSettings]";
}

// Creates a BookmarkManager that manages bookmarks under an alternate folder 
// [UnitTestSessionSaverSettings], just for unit testing.
BaseTestCaseBookmarkManager.createUnitTestBookmarkManager = function()
{
	var bookmarkManager = createBookmarkManager();
	bookmarkManager.folderName = this.m_folderName;
	return bookmarkManager;
}

// Removes all [UnitTestSessionSaverSettings] folders in the Bookmarks bar.
// ensure there are no unit test bookmarks.
// args - Empty array.
// fnList - List of next callbacks to run.
BaseTestCaseBookmarkManager.removeUnitTestBookmarks = function(args, fnList)
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
}

// Helper function to create [UnitTestSessionSaverSettings] folder in the Bookmarks bar.
// Returns folder.id created (via fnList.returnValue).
BaseTestCaseBookmarkManager.createUnitTestBookmark = function(args, fnList)
{
	var thisTestCase = fnList.parent;
	var bookmarkManager = thisTestCase.createUnitTestBookmarkManager();
	bookmarkManager.createBookmarkFolder(function(folder)
	{
		thisTestCase.resume(function()
		{
			fnList.returnValue = folder.id;
			fnList.next();
		});
	});
	thisTestCase.wait();
}

// Tests BookmarkManager::getNumBookmarkFolders().
var testCaseGetNumBookmarkFolders = new YAHOO.tool.TestCase(
{
	name: "testCaseGetNumBookmarkFolders", 

	// Tests BookmarkManager::getNumBookmarkFolders() to ensure it returns 
	// >=0 [SessionSaverSettings] folders in the Bookmarks bar.
	testGetNumBookmarkFolders: function()
	{
		var thisTestCase = this;
		var numBookmarkFolders = -1;
		
		var bookmarkManager = createBookmarkManager();
		bookmarkManager.getNumBookmarkFolders(function(numBookmarkFolders)
		{
			// Callback is not called from the TestCase, so we can't use "this" keyword.
			thisTestCase.resume(function()
			{
				Assert.isTrue(numBookmarkFolders>=0, "Expect number of bookmarks >=0");
			});
		});
		thisTestCase.wait();
	}
});
inheritTestCase(testCaseGetNumBookmarkFolders, BaseTestCaseBookmarkManager);

// Tests BookmarkManager::createBookmarkFolder().
var testCaseCreateBookmarkFolder = new YAHOO.tool.TestCase(
{
	name: "testCaseCreateBookmarkFolder", 
	
	// Tests BookmarkManager::createBookmarkFolder() to ensure it can create a 
	// [UnitTestSessionSaverSettings] folder in the Bookmarks bar.
	// Folder is removed during TearDown.
	testCreateBookmarkFolder: function()
	{
		var thisTestCase = this;
		var bookmarkManager = thisTestCase.createUnitTestBookmarkManager();

		var call = new Array();
		var args = new Array();
		
		// Setup: ensure there are no unit test bookmarks.
		// Run removeUnitTestBookmarks();
		call.push(thisTestCase.removeUnitTestBookmarks);
		args.push(new Array());

		// Test createBookmarkFolder.
		call.push(function(args, fnList)
		{
			bookmarkManager.createBookmarkFolder(function(folder)
			{
				thisTestCase.resume(function()
				{
					Assert.areEqual(thisTestCase.m_folderName, folder.title, 
						"Created folder has wrong title");

					// Now check to ensure 1 bookmark was created.
					bookmarkManager.getNumBookmarkFolders(function(numBookmarkFolders)
					{
						thisTestCase.resume(function()
						{
							Assert.areEqual(1, numBookmarkFolders, 
								"Expect one bookmark, but there were: "+numBookmarkFolders);
							fnList.next();
						});
					});
					thisTestCase.wait();
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
	},

	// Tests BookmarkManager::createBookmarkFolder() to ensure it returns expected folder 
	// information when [UnitTestSessionSaverSettings] already exists.
	// Folder is removed during TearDown.	
	testCreateBookmarkFolderAlreadyExists: function()
	{
		var thisTestCase = this;
		var bookmarkManager = thisTestCase.createUnitTestBookmarkManager();

		var call = new Array();
		var args = new Array();
		
		// Setup: ensure there is one [UnitTestSessionSaverSettings] bookmark.
		// Run removeUnitTestBookmarks();
		call.push(thisTestCase.removeUnitTestBookmarks);
		args.push(new Array());
		// Run createUnitTestBookmark();
		// Store folderID in fnList.returnValue.
		call.push(thisTestCase.createUnitTestBookmark);
		args.push(new Array());

		// Test createBookmarkFolder.
		call.push(function(args, fnList)
		{
			var folderID = fnList.returnValue;
			bookmarkManager.createBookmarkFolder(function(folder)
			{
				thisTestCase.resume(function()
				{
					Assert.areEqual(folderID, folder.id, 
						"Existing folder has wrong id");
					Assert.areEqual(thisTestCase.m_folderName, folder.title, 
						"Existing folder has wrong title");
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
	},

	// Helper function to assert no [UnitTestSessionSaverSettings] folders exist.
	assertNoBookmarksExists: function(args, fnList)
	{
		var thisTestCase = fnList.parent;
		var bookmarkManager = thisTestCase.createUnitTestBookmarkManager();
		bookmarkManager.getNumBookmarkFolders(function(numBookmarkFolders)
		{
			thisTestCase.resume(function()
			{
				Assert.areEqual(0, numBookmarkFolders, 
					"Expect 0 bookmark folders, but there were:"+numBookmarkFolders);
				fnList.next();
			});
		});
		thisTestCase.wait();
	},

	// Helper function to create [UnitTestSessionSaverSettings] folder in the Bookmarks bar 
	// and assert only one exists.
	createBookmarkAndAssertOneExists: function(args, fnList)
	{
		var thisTestCase = fnList.parent;
		var bookmarkManager = thisTestCase.createUnitTestBookmarkManager();
		bookmarkManager.createBookmarkFolder(function(folder)
		{
			thisTestCase.resume(function()
			{
				bookmarkManager.getNumBookmarkFolders(function(numBookmarkFolders)
				{
					thisTestCase.resume(function()
					{
						Assert.areEqual(1, numBookmarkFolders, 
							"Expect 1 bookmark folder, but there were:"+numBookmarkFolders);
						fnList.next();
					});
				});
				thisTestCase.wait();
			});
		});
		thisTestCase.wait();
	},

	// Tests calling BookmarkManager::createBookmarkFolder() multiple times 
	// to ensure it never creates more than one [UnitTestSessionSaverSettings] folder.
	// Folder is removed during TearDown.
	testCreateBookmarkFolderMultipleCalls: function()
	{
		var thisTestCase = this;
		var bookmarkManager = thisTestCase.createUnitTestBookmarkManager();

		var call = new Array();
		var args = new Array();
		
		// Setup: ensure there is no [UnitTestSessionSaverSettings] bookmarks.
		// Run removeUnitTestBookmarks();
		call.push(thisTestCase.removeUnitTestBookmarks);
		args.push(new Array());

		// Test createBookmarkFolder.
		// Ensure starts with 0 bookmarks.
		call.push(thisTestCase.assertNoBookmarksExists);
		args.push(new Array());
		// Call createBookmarkFolder(), ensure 1 bookmark exists.
		call.push(thisTestCase.createBookmarkAndAssertOneExists);
		args.push(new Array());
		// Call createBookmarkFolder(), ensure no more than 1 bookmark exists.
		call.push(thisTestCase.createBookmarkAndAssertOneExists);
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
inheritTestCase(testCaseCreateBookmarkFolder, BaseTestCaseBookmarkManager);

// Tests BookmarkManager::createBookmarkItem().
var testCaseCreateBookmarkItem = new YAHOO.tool.TestCase(
{
	name: "testCaseCreateBookmarkItem", 
	
	// Title of item to create in the [UnitTestSessionSaverSettings] folder.
	m_itemTitle: "HelloWorld",
	// Url of the item to create in the [UnitTestSessionSaverSettings] folder.
	m_itemUrl: "http://www.hello.com/",
	
	// Tests BookmarkManager::createBookmarkItem() to ensure it can create a 
	// 'HelloWorld' item in the [UnitTestSessionSaverSettings] folder.
	// Folder is removed during TearDown.
	testCreateBookmarkItem: function()
	{
		var thisTestCase = this;
		var bookmarkManager = thisTestCase.createUnitTestBookmarkManager();

		var call = new Array();
		var args = new Array();
		
		// Setup: ensure there is one [UnitTestSessionSaverSettings] bookmark folder.
		// Run removeUnitTestBookmarks();
		call.push(thisTestCase.removeUnitTestBookmarks);
		args.push(new Array());
		// Run createUnitTestBookmark();
		call.push(thisTestCase.createUnitTestBookmark);
		args.push(new Array());

		// Test createBookmarkItem.
		call.push(function(args, fnList)
		{
			bookmarkManager.createBookmarkItem(thisTestCase.m_itemTitle, thisTestCase.m_itemUrl, 
			function(item)
			{
				thisTestCase.resume(function()
				{
					Assert.areEqual(thisTestCase.m_itemTitle, item.title, "Created item has wrong title");

					// Now check to ensure 1 bookmark item was created.
					bookmarkManager.getNumBookmarkItems(thisTestCase.m_itemTitle, 
					function(numBookmarkItems)
					{
						thisTestCase.resume(function()
						{
							Assert.areEqual(1, numBookmarkItems, 
								"Expect one bookmark item, but there were: "+numBookmarkItems);
							fnList.next();
						});
					});
					thisTestCase.wait();					
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
	},

	// Helper function to assert no 'HelloWorld' items 
	// in the [UnitTestSessionSaverSettings] bookmark folder exist.
	assertNoBookmarkItemExists: function(args, fnList)
	{
		var thisTestCase = fnList.parent;
		var bookmarkManager = thisTestCase.createUnitTestBookmarkManager();
		
		bookmarkManager.getNumBookmarkItems(thisTestCase.m_itemTitle, 
		function(numBookmarkItems)
		{
			thisTestCase.resume(function()
			{
				Assert.areEqual(0, numBookmarkItems, 
					"Expect no bookmark items, but there were: "+numBookmarkItems);
				fnList.next();
			});
		});
		thisTestCase.wait();		
	},
	
	// Helper function to create 'HelloWorld' item in the [UnitTestSessionSaverSettings] bookmark folder 
	// and assert only one exists.
	createBookmarkItemAndAssertOneExists: function(args, fnList)
	{
		var thisTestCase = fnList.parent;
		var bookmarkManager = thisTestCase.createUnitTestBookmarkManager();

		bookmarkManager.createBookmarkItem(thisTestCase.m_itemTitle, thisTestCase.m_itemUrl, 
		function(item)
		{
			thisTestCase.resume(function()
			{
				bookmarkManager.getNumBookmarkItems(thisTestCase.m_itemTitle, 
				function(numBookmarkItems)
				{
					thisTestCase.resume(function()
					{
						Assert.areEqual(1, numBookmarkItems, 
							"Expect one bookmark item, but there were: "+numBookmarkItems);
						fnList.next();
					});
				});
				thisTestCase.wait();
			});
		});
		thisTestCase.wait();
	},

	// Tests calling BookmarkManager::createBookmarkItem() multiple times 
	// to ensure it never creates more than one 'HelloWorld' item in the same folder.
	// Folder is removed during TearDown.
	testCreateBookmarkItemMultipleCalls: function()
	{
		var thisTestCase = this;
		var bookmarkManager = thisTestCase.createUnitTestBookmarkManager();

		var call = new Array();
		var args = new Array();
		
		// Setup: ensure there is one [UnitTestSessionSaverSettings] bookmark folder.
		// Run removeUnitTestBookmarks();
		call.push(thisTestCase.removeUnitTestBookmarks);
		args.push(new Array());
		// Run createUnitTestBookmark();
		call.push(thisTestCase.createUnitTestBookmark);
		args.push(new Array());

		// Test createBookmarkItem.
		// Ensure starts with 0 items.
		call.push(thisTestCase.assertNoBookmarkItemExists);
		args.push(new Array());
		// Call createBookmarkItem(), ensure 1 item exists.
		call.push(thisTestCase.createBookmarkItemAndAssertOneExists);
		args.push(new Array());
		// Call createBookmarkItem(), ensure no more than 1 item exists.
		call.push(thisTestCase.createBookmarkItemAndAssertOneExists);
		args.push(new Array());
		
		// TearDown: remove unit test bookmarks.
		// Run removeUnitTestBookmarks();
		call.push(thisTestCase.removeUnitTestBookmarks);
		args.push(new Array());

		// Execute function list.
		var fnList = new FnList(call, args, this);
		fnList.next();
	},
	
	// Helper function to create 'HelloWorld' item in the [UnitTestSessionSaverSettings] bookmark folder.
	createUnitTestBookmarkItem: function(args, fnList)
	{
		var thisTestCase = fnList.parent;
		thisTestCase.createBookmarkItemAndAssertOneExists(args, fnList);
	},
	
	// Tests calling BookmarkManager::createBookmarkItem() with a new value when an item already exists 
	// ensures it updates the existing value (url) with the new value.
	// Folder is removed during TearDown.
	testCreateBookmarkItemUpdateValue: function()
	{
		var expectedUrl = "http://www.updatedurl.com/";
		var thisTestCase = this;
		var bookmarkManager = thisTestCase.createUnitTestBookmarkManager();

		var call = new Array();
		var args = new Array();

		// Setup: ensure there is one 'HelloWorld' item in the 
		// [UnitTestSessionSaverSettings] bookmark folder with url "http://www.hello.com/".
		// Run removeUnitTestBookmarks();
		call.push(thisTestCase.removeUnitTestBookmarks);
		args.push(new Array());
		// Run createUnitTestBookmark();
		call.push(thisTestCase.createUnitTestBookmark);
		args.push(new Array());
		// Run createUnitTestBookmarkItem();
		call.push(thisTestCase.createUnitTestBookmarkItem);
		args.push(new Array());
		
		// Test createBookmarkItem with item 'HelloWorld', updating its url to "http://www.updatedurl.com/".
		call.push(function(args, fnList)
		{
			bookmarkManager.createBookmarkItem(thisTestCase.m_itemTitle, expectedUrl, 
			function(item)
			{
				thisTestCase.resume(function()
				{
					Assert.areEqual(expectedUrl, item.url, "Created item has wrong url, it wasn't updated. "+
									"It should have changed to: "+expectedUrl+" but it is: "+item.url);
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
	},
	
	// Tests calling BookmarkManager::createBookmarkItem() when parent folder has not been created yet.
	// It should create the parent folder, then create the item inside it.
	// Folder is removed during TearDown.
	testCreateBookmarkItemWithMissingParentFolder: function()
	{
		var thisTestCase = this;
		var bookmarkManager = thisTestCase.createUnitTestBookmarkManager();

		var call = new Array();
		var args = new Array();

		// Setup: ensure there is no [UnitTestSessionSaverSettings] bookmark folder.
		// Run removeUnitTestBookmarks();
		call.push(thisTestCase.removeUnitTestBookmarks);
		args.push(new Array());

		// Test createBookmarkItem.
		// Call createBookmarkItem(), ensure 1 item exists.
		call.push(thisTestCase.createBookmarkItemAndAssertOneExists);
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
inheritTestCase(testCaseCreateBookmarkItem, BaseTestCaseBookmarkManager);

// Tests BookmarkManager::getNumBookmarkItemsStartsWith().
var testCaseGetNumBookmarkItemsStartsWith = new YAHOO.tool.TestCase(
{
	name: "testCaseGetNumBookmarkItemsStartsWith", 

	// Title of item to create in the [UnitTestSessionSaverSettings] folder.
	m_itemTitle: "[StartsWith]=",
	// Url of the item to create in the [UnitTestSessionSaverSettings] folder.
	m_itemUrl: "http://www.hello.com/",
	
	// Helper function to create bookmark item with supplied name.
	// args = new Array(name) - Name of bookmark item to create.
	createUnitTestBookmarkItem: function(args, fnList)
	{
		var name = args[0];
		var thisTestCase = fnList.parent;
		var bookmarkManager = thisTestCase.createUnitTestBookmarkManager();
		
		bookmarkManager.createBookmarkItem(name, thisTestCase.m_itemUrl, 
		function(item)
		{
			thisTestCase.resume(function()
			{
				fnList.next();
			});
		});
		thisTestCase.wait();
	},	
	
	// Tests BookmarkManager::getNumBookmarkItemsStartsWith() to ensure it returns 
	// 2 when two items start with same string.
	testGetNumBookmarkItemsStartsWith: function()
	{
		var thisTestCase = this;
		var bookmarkManager = thisTestCase.createUnitTestBookmarkManager();

		var call = new Array();
		var args = new Array();
		
		// Setup: ensure there is an empty [UnitTestSessionSaverSettings] bookmark folder.
		// Run removeUnitTestBookmarks();
		call.push(thisTestCase.removeUnitTestBookmarks);
		args.push(new Array());
		// Run createUnitTestBookmark();
		call.push(thisTestCase.createUnitTestBookmark);
		args.push(new Array());
		
		// Test getNumBookmarkItemsStartsWith.
		// Create two bookmark items starting with same string.
		call.push(thisTestCase.createUnitTestBookmarkItem);
		args.push(new Array(thisTestCase.m_itemTitle+"option1=false;"));
		call.push(thisTestCase.createUnitTestBookmarkItem);
		args.push(new Array(thisTestCase.m_itemTitle+"option2=true;"));

		// Now ensure 2 items were created.
		call.push(function(args, fnList)
		{
			bookmarkManager.getNumBookmarkItemsStartsWith(thisTestCase.m_itemTitle, 
			function(numBookmarkItems)
			{
				thisTestCase.resume(function()
				{
					Assert.areEqual(2, numBookmarkItems, 
									"Expect two bookmark items, but there were: "+numBookmarkItems);
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
inheritTestCase(testCaseGetNumBookmarkItemsStartsWith, BaseTestCaseBookmarkManager);

// Tests BookmarkManager::getBookmarkItemInformationStartsWith().
var testCaseGetBookmarkItemInformationStartsWith = new YAHOO.tool.TestCase(
{
	name: "testCaseGetNumBookmarkItemsStartsWith", 
	
	// Tests BookmarkManager::getBookmarkItemInformationStartsWith() when parent folder doesn't 
	// exist to ensure it handles it gracefully.
	testGetBookmarkItemInformationStartsWithNoParentFolder: function()
	{
		var itemTitle = "[StartsWith]=";
		var thisTestCase = this;
		var bookmarkManager = thisTestCase.createUnitTestBookmarkManager();

		var call = new Array();
		var args = new Array();
		
		// Setup: ensure there is no [UnitTestSessionSaverSettings] bookmark folder.
		// Run removeUnitTestBookmarks();
		call.push(thisTestCase.removeUnitTestBookmarks);
		args.push(new Array());
		
		// Test getBookmarkItemInformationStartsWith.
		call.push(function(args, fnList)
		{
			bookmarkManager.getBookmarkItemInformationStartsWith(itemTitle, 
			function(numBookmarkItems, firstItemInfo)
			{
				thisTestCase.resume(function()
				{
					Assert.areEqual(0, numBookmarkItems, 
						"Expect 0 bookmark items, but there were: "+numBookmarkItems);
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
inheritTestCase(testCaseGetBookmarkItemInformationStartsWith, BaseTestCaseBookmarkManager);

// Tests BookmarkManager::removeBookmarkItemAllStartsWith().
var testCaseRemoveBookmarkItemAllStartsWith = new YAHOO.tool.TestCase(
{
	name: "testCaseRemoveBookmarkItemAllStartsWith", 

	// Title of item to create in the [UnitTestSessionSaverSettings] folder.
	m_itemTitle: "[StartsWith]=",
	// Url of the item to create in the [UnitTestSessionSaverSettings] folder.
	m_itemUrl: "http://www.hello.com/",
	
	// Helper function to create bookmark item with supplied name.
	// args = new Array(name) - Name of bookmark item to create.
	createUnitTestBookmarkItem: function(args, fnList)
	{
		var name = args[0];
		var thisTestCase = fnList.parent;
		var bookmarkManager = thisTestCase.createUnitTestBookmarkManager();
		
		bookmarkManager.createBookmarkItem(name, thisTestCase.m_itemUrl, 
		function(item)
		{
			thisTestCase.resume(function()
			{
				fnList.next();
			});
		});
		thisTestCase.wait();
	},	

	// Tests BookmarkManager::removeBookmarkItemAllStartsWith() to ensure it removes 
	// 2 items when two exist that start with same string.
	testRemoveBookmarkItemAllStartsWith: function()
	{
		var differentString = "[DifferentString]=";
		var thisTestCase = this;
		var bookmarkManager = thisTestCase.createUnitTestBookmarkManager();

		var call = new Array();
		var args = new Array();
		
		// Setup: ensure there is an empty [UnitTestSessionSaverSettings] bookmark folder.
		// Run removeUnitTestBookmarks();
		call.push(thisTestCase.removeUnitTestBookmarks);
		args.push(new Array());
		// Run createUnitTestBookmark();
		call.push(thisTestCase.createUnitTestBookmark);
		args.push(new Array());
		
		// Test removeBookmarkItemAllStartsWith.
		// Create two bookmark items starting with same string, and one with a different string.
		call.push(thisTestCase.createUnitTestBookmarkItem);
		args.push(new Array(thisTestCase.m_itemTitle+"option1=false;"));
		call.push(thisTestCase.createUnitTestBookmarkItem);
		args.push(new Array(thisTestCase.m_itemTitle+"option2=true;"));
		call.push(thisTestCase.createUnitTestBookmarkItem);
		args.push(new Array(differentString+"option3=true;"));

		// Remove them all an ensure they are both removed.
		call.push(function(args, fnList)
		{
			bookmarkManager.removeBookmarkItemAllStartsWith(thisTestCase.m_itemTitle, function()
			{
				thisTestCase.resume(function()
				{				
					bookmarkManager.getNumBookmarkItemsStartsWith(thisTestCase.m_itemTitle, 
					function(numBookmarkItems)
					{
						thisTestCase.resume(function()
						{
							Assert.areEqual(0, numBookmarkItems, 
								"Expect 0 bookmark items, but there were: "+numBookmarkItems);
							fnList.next();
						});
					});
					thisTestCase.wait();
				});
			});
			thisTestCase.wait();
		});
		args.push(new Array());
		
		// Ensure item with different string was not removed.
		call.push(function(args, fnList)
		{
			bookmarkManager.getNumBookmarkItemsStartsWith(differentString, 
			function(numBookmarkItems)
			{
				thisTestCase.resume(function()
				{
					Assert.areEqual(1, numBookmarkItems, 
						"Expect 1 bookmark item, but there were: "+numBookmarkItems);
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
	},	

	// Tests BookmarkManager::removeBookmarkItemAllStartsWith() when parent folder doesn't 
	// exist to ensure it handles it gracefully.
	testRemoveBookmarkItemAllStartsWithNoParentFolder: function()
	{
		var thisTestCase = this;
		var bookmarkManager = thisTestCase.createUnitTestBookmarkManager();

		var call = new Array();
		var args = new Array();
		
		// Setup: ensure there is no [UnitTestSessionSaverSettings] bookmark folder.
		// Run removeUnitTestBookmarks();
		call.push(thisTestCase.removeUnitTestBookmarks);
		args.push(new Array());
		
		// Test removeBookmarkItemAllStartsWith.
		call.push(function(args, fnList)
		{
			bookmarkManager.removeBookmarkItemAllStartsWith(thisTestCase.m_itemTitle, function()
			{
				thisTestCase.resume(function()
				{
					fnList.next();
				});
			});
			thisTestCase.wait();
		});
		args.push(new Array());

		// Ensure item with different string was not removed.
		call.push(function(args, fnList)		
		{
			bookmarkManager.getNumBookmarkFolders(function(numBookmarkFolders)
			{
				// Callback is not called from the TestCase, so we can't use "this" keyword.
				thisTestCase.resume(function()
				{
					Assert.areEqual(0, numBookmarkFolders, 
						"Expect no bookmarks, but there were: "+numBookmarkFolders);
					fnList.next();
				});
			});
			thisTestCase.wait();
		});
		args.push(new Array());

		// TearDown: no teardown required.

		// Execute function list.
		var fnList = new FnList(call, args, this);
		fnList.next();
	}
});
inheritTestCase(testCaseRemoveBookmarkItemAllStartsWith, BaseTestCaseBookmarkManager);
