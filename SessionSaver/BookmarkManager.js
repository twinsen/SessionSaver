// requires: BackgroundPage.js

// These must be accessed via a background page (SaveBgp.html). Bookmarks are not accessable from 
// separate windows.

// Constructor.
function BookmarkManager()
{
	this.name = "BookmarkManager";
	this.folderName = "[SessionSaverSettings]";
	this.bookmarksBarID = "1"; // 1 is "Bookmarks bar"
}

// This data type is refered to as BookmarkTreeNode.
// struct BookmarkTreeNode {
//  int id
//  string title
//  int parentId                // undefined if root folder
//  string url                  // undefined if folder
//  BookmarkTreeNode[] children // undefined if bookmark
//  int dateAdded // date initially created in milliseconds since UTC epoch (midnight, jan 1, 1970)
//  int dateGroupModified // date the contents of a folder have changed (milliseconds since UTC epoch)
// }

// Gets number of bookmark nodes (folders or items) in the supplied folderID matching or starting with 
// given title, and gets the BookmarkTreeNode of the first match.
// folderID - Folder to search inside.
// title - Node title to search for.
// matchStartsWith - Whether to just check if the title starts with the search title.
// afterCallback - Returns result by calling function afterCallback(numBookmarkNodes, firstNodeInfo).
BookmarkManager.prototype._getBookmarkNodeInformationHelper = function(folderID, title, 
	matchStartsWith,  afterCallback)
{
	var thisBookmarkManager = this;
	chrome.bookmarks.getChildren(folderID, 
		function(results)
		{
			// Callback is not called from the BookmarkManager, so we can't use "this" keyword.
			var numNodes=0;
			var i;
			var firstNodeInfo;
			var firstNodeInfoSet = false;
			for (i=0;i<results.length;++i)
			{
				var result = results[i];
				var match = false;
				if (result.title==title)
				{
					match = true;
				}
				else if (matchStartsWith && result.title.indexOf(title)==0)
				{
					match = true;
				}
				if (match)
				{
					numNodes++;
					if (!firstNodeInfoSet)
					{
						firstNodeInfo = result;
						firstNodeInfoSet = true;
					}
				}
			}
			afterCallback(numNodes, firstNodeInfo);
        }
	);
}

// Gets number of bookmark nodes (folders or items) in the supplied folderID matching given title, 
// and gets the BookmarkTreeNode of the first match.
// Returns result by calling function afterCallback(numBookmarkNodes, firstNodeInfo).
BookmarkManager.prototype.getBookmarkNodeInformation = function(folderID, title, afterCallback)
{
	var thisBookmarkManager = this;
	this._getBookmarkNodeInformationHelper(folderID, title, false, afterCallback);
}

// Gets number of bookmark nodes (folders or items) in the supplied folderID starting with given title 
// (but not identical), and gets the BookmarkTreeNode of the first match. This is used because we 
// store data in the bookmark item title as the url has a limited format.
// Returns result by calling function afterCallback(numBookmarkNodes, firstNodeInfo).
BookmarkManager.prototype.getBookmarkNodeInformationStartsWith = function(folderID, title, afterCallback)
{
	var thisBookmarkManager = this;
	this._getBookmarkNodeInformationHelper(folderID, title, true, afterCallback);
}

// Gets number of [SessionSaverSettings] folders in the Bookmarks bar and gets the BookmarkTreeNode of 
// the first [SessionSaverSettings] folder.
// Returns result by calling function afterCallback(numBookmarkFolders, firstFolderInfo).
BookmarkManager.prototype.getBookmarkFolderInformation = function(afterCallback)
{
	var thisBookmarkManager = this;
	thisBookmarkManager.getBookmarkNodeInformation(thisBookmarkManager.bookmarksBarID, 
		thisBookmarkManager.folderName, afterCallback);
}

// Gets number of bookmark items inside [SessionSaverSettings] folder that start with given name 
// and gets the BookmarkTreeNode of the first match.
// Returns result by calling function afterCallback(numBookmarkItems, firstItemInfo).
BookmarkManager.prototype.getBookmarkItemInformationStartsWith = function(name, afterCallback)
{
	var thisBookmarkManager = this;
	
	// Get folder id for [SessionSaverSettings].
	thisBookmarkManager.getBookmarkFolderInformation(
	function(numBookmarkFolders, firstFolderInfo)
	{
		if (numBookmarkFolders>0)
		{
			var folderID = firstFolderInfo.id;
			thisBookmarkManager.getBookmarkNodeInformationStartsWith(folderID, name, afterCallback);
		}
		else
		{
			afterCallback(0, null);
		}
	});
}

// Gets number of [SessionSaverSettings] folders in the Bookmarks bar.
// Returns result by calling function afterCallback(numBookmarkFolders).
BookmarkManager.prototype.getNumBookmarkFolders = function(afterCallback)
{
	var thisBookmarkManager = this;
	thisBookmarkManager.getBookmarkFolderInformation(
	function(numBookmarkFolders, firstFolderInfo)
	{
		afterCallback(numBookmarkFolders);
	});
}

// Creates [SessionSaverSettings] folder in the Bookmarks bar.
// Pass in afterCallback(folder) to perform tasks after the folder is created.
// If the folder already exists, it passes the folder information to the callback.
// Folder is of type BookmarkTreeNode.
BookmarkManager.prototype.createBookmarkFolder = function(afterCallback)
{
	var thisBookmarkManager = this;
	thisBookmarkManager.getBookmarkFolderInformation(
	function(numBookmarkFolders, firstFolderInfo)
	{
		if (numBookmarkFolders==0)
		{
			chrome.bookmarks.create({'parentId': thisBookmarkManager.bookmarksBarID, 
									 'title': thisBookmarkManager.folderName}, afterCallback);
		}
		else
		{
			afterCallback(firstFolderInfo);
		}
	});
}

// Removes settings bookmarks.
// parentFolderID - Parent folder containing bookmarks to delete.
// title - Title of folder or item to delete.
// matchStartsWith - Whether to just check if the title starts with the search title.
// startIndex - Set to 0 to remove all, 1 to leave all except 1.
// afterCallback - Next function chain. Called once after deleted the last item.
BookmarkManager.prototype._removeBookmarkNodeHelper = function(parentFolderID, title, matchStartsWith, startIndex, afterCallback)
{
	var thisBookmarkManager = this;
	chrome.bookmarks.getChildren(parentFolderID, 
		function(results)
		{
			var matchingNodeIDs = new Array();
			var matchingNodeTitles = new Array();
			for (var i=0;i<results.length;++i)
			{
				var result = results[i];
				var match = false;
				if (result.title==title)
				{
					match = true;
				}
				else if (matchStartsWith && result.title.indexOf(title)==0)
				{
					match = true;
				}
				if (match)
				{
					matchingNodeIDs.push(result.id);
					matchingNodeTitles.push(result.title);
				}
			}

			var amountToRemove = matchingNodeIDs.length-startIndex;
			if (amountToRemove <= 0)
			{
				log("no bookmark node to remove");
				if (afterCallback)
				{
					afterCallback();
				}				
				return;
			}
			for (var i=startIndex;i<matchingNodeIDs.length;++i)
			{
				var removeID = matchingNodeIDs[i];
				var removeTitle = matchingNodeTitles[i];
				log("Deleting: '"+ removeTitle +"' ID: "+removeID);
				chrome.bookmarks.removeTree(removeID, 
					function(item)
					{
						log("Removed item. ");
						amountToRemove--; 
						if (afterCallback && amountToRemove==0)
						{
							// Only callback after deleted last item.
							afterCallback();
						}
					}
				);
			}
        }
	);
}

// Removes settings bookmarks.
// startIndex - Set to 0 to remove all, 1 to leave all except 1.
// afterCallback - Next function chain. Called once after deleted the last item.
BookmarkManager.prototype._removeBookmarkFolderHelper = function(startIndex, afterCallback)
{
	var thisBookmarkManager = this;
	thisBookmarkManager._removeBookmarkNodeHelper(thisBookmarkManager.bookmarksBarID, 
		thisBookmarkManager.folderName, false, startIndex, afterCallback);
}

// Sometimes chrome creates multiple bookmarks instead of just one.
// So we remove all but one after creation callbacks have finished.
// Precondition: All contain the same data
BookmarkManager.prototype.removeBookmarkFolderAllExceptOne = function(afterCallback)
{
	var thisBookmarkManager = this;
	thisBookmarkManager._removeBookmarkFolderHelper(1, afterCallback);
}

// Removes all setting bookmarks. Called before creating new bookmarks.
BookmarkManager.prototype.removeBookmarkFolderAll = function(afterCallback)
{
	var thisBookmarkManager = this;
	thisBookmarkManager._removeBookmarkFolderHelper(0, afterCallback);
}

// Removes all bookmark items inside [SessionSaverSettings] folder that start with given name.
BookmarkManager.prototype.removeBookmarkItemAllStartsWith = function(name, afterCallback)
{
	var thisBookmarkManager = this;

	// Get folder id for [SessionSaverSettings].
	thisBookmarkManager.getBookmarkFolderInformation(
	function(numBookmarkFolders, firstFolderInfo)
	{
		if (numBookmarkFolders>0)
		{
			var folderID = firstFolderInfo.id;
			thisBookmarkManager._removeBookmarkNodeHelper(folderID, name, true, 0, afterCallback);
		}
		else if (afterCallback)
		{
			// None to remove, so return.
			afterCallback();
		}
	});
}

// Creates a bookmark item inside a folder.
// If it already exists, it updates the value (url) of the item.
// folderID - id obtained from createBookmarkFolder's or 
//            getBookmarkFolderInformation's afterCallback (folder.id).
// name - Name (title) of bookmark item.
// value - Value (url) of bookmark item.
// afterCallback - Pass in afterCallback(item) to perform tasks after the item is created. 
// Item is of type BookmarkTreeNode.
BookmarkManager.prototype._createBookmarkItem = function(folderID, name, value, afterCallback)
{
	var thisBookmarkManager = this;
	thisBookmarkManager.getBookmarkNodeInformation(folderID, name, 
	function(numBookmarkNodes, firstNodeInfo)
	{
		if (numBookmarkNodes==0)
		{
			chrome.bookmarks.create({ 'parentId': folderID, 'index' : 0, 
									  'title':name, 'url': value }, 
			function(item)
			{
				log("Created item: " + item.title);
				if (afterCallback)
				{
					afterCallback(item);
				}
			});
		}
		else if (numBookmarkNodes==1)
		{
			// If 1 already exist with a different url, remove it, then recreate it with new value.
			if (firstNodeInfo.url != value)
			{
				chrome.bookmarks.remove(firstNodeInfo.id, 
				function()
				{
					thisBookmarkManager._createBookmarkItem(folderID, name, value, afterCallback);
				});			
			}
			else
			{
				if (afterCallback)
				{
					afterCallback(firstNodeInfo);
				}			
			}
		}
		else
		{			
			error("Error: multiple bookmark items exist with same name");
			if (afterCallback)
			{
				afterCallback(firstNodeInfo);
			}
		}
	});
}

// Creates a bookmark item inside [SessionSaverSettings] folder.
// name - Name (title) of bookmark item.
// value - Value (url) of bookmark item.
// afterCallback - Pass in afterCallback(item) to perform tasks after the item is created. 
// Item is of type BookmarkTreeNode.
BookmarkManager.prototype.createBookmarkItem = function(name, value, afterCallback)
{
	var thisBookmarkManager = this;
	if (value==null)
	{
		// If value was null, a folder is created.
		throw new Error("createBookmarkItem - Null value supplied");
	}

	// Get folder id for [SessionSaverSettings] and create the folder if it doesn't exist.
	thisBookmarkManager.createBookmarkFolder(
	function(folder)
	{
		thisBookmarkManager._createBookmarkItem(folder.id, name, value, afterCallback);
	});
}

// Gets number of bookmark items matching given name inside a folder.
// folderID - Folder to search.
// name - Name (title) of bookmark item to search for.
// Returns result by calling function afterCallback(numBookmarkItems).
BookmarkManager.prototype._getNumBookmarkItems = function(folderID, name, afterCallback)
{
	var thisBookmarkManager = this;
	thisBookmarkManager.getBookmarkNodeInformation(folderID, name, 
	function(numBookmarkNodes, firstNodeInfo)
	{
		afterCallback(numBookmarkNodes);
	});
}

// Gets number of bookmark items inside [SessionSaverSettings] folder.
// Returns result by calling function afterCallback(numBookmarkItems).
BookmarkManager.prototype.getNumBookmarkItems = function(name, afterCallback)
{
	var thisBookmarkManager = this;

	// Get folder id for [SessionSaverSettings].
	thisBookmarkManager.getBookmarkFolderInformation(
	function(numBookmarkFolders, firstFolderInfo)
	{
		var folderID = firstFolderInfo.id;
		thisBookmarkManager._getNumBookmarkItems(folderID, name, afterCallback);
	});
}

// Gets number of bookmark items inside [SessionSaverSettings] folder that start with given name.
// Returns result by calling function afterCallback(numBookmarkItems).
BookmarkManager.prototype.getNumBookmarkItemsStartsWith = function(name, afterCallback)
{
	var thisBookmarkManager = this;
	
	thisBookmarkManager.getBookmarkItemInformationStartsWith(name, 
	function(numBookmarkItems, firstItemInfo)
	{
		afterCallback(numBookmarkItems);
	});
}

// Factory for BookmarkManager. Created via the background page, since bookmarks are not accessable from 
// separate windows.
function createBookmarkManager()
{
	var backgroundPage = getBackgroundPage();
	var bookmarkManager = backgroundPage._createBookmarkManager();
	return bookmarkManager;
}

// Private factory method.
function _createBookmarkManager()
{
	return new BookmarkManager();
}
