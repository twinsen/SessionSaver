// Finds the existing "Your Saved Sessions" folder. If it doesn't exist it is created.
// Then exports saved sessions to a timestamped subfolder.
function exportToBookmarks()
{
	// Get the bookmark tree.
	chrome.bookmarks.getTree(
	function(theTree)
	{
		// Get children of the root node.
		chrome.bookmarks.getChildren(theTree[0].id, 
		function(chillen)
		{
			// The child with index 1 should be "Other bookmarks".
			chrome.bookmarks.getChildren(chillen[1].id, 
			function(childfinal)
			{
				// "Your Saved Sessions" must be the first entry under "Other bookmarks".
				// If you have moved it (or it doesn't exist), it is recreated at index 0.
				if (childfinal[0].title == 'Your Saved Sessions')
				{
					saveAllSessionsToFolder(childfinal[0]);
				}
				else
				{
					createYourSavedSessionsFolder();
				}
			});
		});
	});
}

// Create the "Your Saved Sessions" folder. Then exports saved sessions to a timestamped subfolder.
function createYourSavedSessionsFolder()
{
	// Get the bookmark tree.
	chrome.bookmarks.getTree(
	function(theTree)
	{
		// Get children of the root node.
		chrome.bookmarks.getChildren(theTree[0].id, 
		function(chillen)
		{
			// The child with index 1 should be "Other bookmarks".			
			// Create the "Your Saved Sessions" folder inside.
			chrome.bookmarks.create({'parentId': chillen[1].id, 
				'title': 'Your Saved Sessions', index: 0}, 
			function(daddyFolder1)
			{
				daddyFolder = daddyFolder1;
				saveAllSessionsToFolder(daddyFolder1);
			});
		});
	});
}

// Exports saved sessions to a timestamped subfolder.
// yourSavedSessionsFolder - A BookmarkTreeNode of the "Your Saved Sessions" folder.
function saveAllSessionsToFolder(yourSavedSessionsFolder)
{
	var d = new Date();
	var theName = d.toLocaleTimeString() + " - " + d.toLocaleDateString();

	chrome.bookmarks.create({'parentId': yourSavedSessionsFolder.id, 'title': theName}, 
	function(timestampFolder)
	{
		for (var i=0;i<g_sessionNames.length;++i)
		{
			saveSessionIndex(i, timestampFolder.id);
		}	
	});
}

// Saves given session index to the timestamp folder.
// Creates a subfolder with the session name, filling with one bookmark per url.
function saveSessionIndex(index, timestampFolderID)
{
	var currentSessionName = g_sessionNames[index];
	chrome.bookmarks.create({'parentId': timestampFolderID, 'title': currentSessionName}, 
	function(sessionFolder)
	{
		var urls = g_sessionUrls[index].split("\n");
		for (var j=0;j<urls.length-1;++j) // last url ends with a \n, resulting in an extra one
		{
			var currentTitle = currentSessionName+" "+j;
			var currentUrl = urls[j];
			chrome.bookmarks.create({'parentId': sessionFolder.id, 
				'title': currentTitle, 
				'url': currentUrl}, function() {});
		}			
	});	
}
