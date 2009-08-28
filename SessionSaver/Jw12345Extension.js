// This code was taken from jw12345.
// http://www.chromeplugins.org/google/chrome-plugins/new-ext-sessionsaver-3-8101.html
// To see if it can improve the way we use bookmarks.
// I've added comments and changed layout, but.
// I just changed it so its a separate js file and put the button click stuff in addClickListener().
// I also removed "tabs" and "tabIds" from jwAddSessionFolder as they weren't used (and renamed asdf).
// I moved findDaddy() to the top, and prepended jw to each function.
// The code is quite short and simple.

// Finds the existing "Your Saved Sessions" folder. If it doesn't exist it is created.
// Then adds the current tabs to a timestamped subfolder.
// This is the highest level function that is called in response to a click event. 
// It calls jwCreateDaddy() and jwAddSessionFolder().
function jwFindDaddy()
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
					console.log('matchfound');
					jwAddSessionFolder(childfinal[0]);
				}
				else
				{
					jwCreateDaddy();
				}
			});
		});
	});
}

// Create the "Your Saved Sessions" folder. Then adds the current tabs to a timestamped subfolder.
function jwCreateDaddy()
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
			console.log(chillen[1].title);
			
			// Create the "Your Saved Sessions" folder inside.
			chrome.bookmarks.create({'parentId': chillen[1].id, 
				'title': 'Your Saved Sessions', index: 0}, 
			function(daddyFolder1)
			{
				daddyFolder = daddyFolder1;
				jwAddSessionFolder(daddyFolder1);
			});
		});
	});
}

// Adds the current tabs to a timestamped subfolder.
// yourSavedSessionsFolder - A BookmarkTreeNode of the "Your Saved Sessions" folder.
function jwAddSessionFolder(yourSavedSessionsFolder)
{
	var d = new Date();
	var theName = d.toLocaleTimeString() + " - " + d.toLocaleDateString();

	chrome.bookmarks.create({'parentId': yourSavedSessionsFolder.id, 'title': theName}, 
	function(babyFolder)
	{ 
		// findtabs and iterate
		chrome.windows.getAll(true, function(windowList)
		{
			// return all windows with returned tabs into array called window list
			for (var i=0; i<windowList.length;++i) //for each in windowlist
			{        
				for (var j=0; j<windowList[i].tabs.length;++j) //for each tab in each window
				{	
					chrome.bookmarks.create({'parentId': babyFolder.id, 
						'title': windowList[i].tabs[j].title, 
						'url': windowList[i].tabs[j].url}, function() {});
				}
			}
		});
	});
}

// After calling this a click will find the existing "Your Saved Sessions" folder. 
// If it doesn't exist it is created. It then saves the session as bookmarks in a 
// timestamped subfolder.
function jwAddClickListener()
{
	window.addEventListener("click", function()
	{
		jwFindDaddy();
	});
}
