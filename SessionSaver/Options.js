// requires: String.js
// requires: BookmarkManager.js (which depends on BackgroundPage.js)

// Constructor.
function Options()
{
	this.m_name = "Options";
	this.m_itemTitle = "[Options]=";
	this.m_saveEnabled = false;
	
	this.m_saveCurrentWindowOnly = false;
	this.m_closeSavedTabs = false;
	this.m_logging = false;
}

Options.prototype.prepareBookmarkManager = function()
{
	this.bookmarkManager = createBookmarkManager();
	// We are using a different folder for now until the other bookmark code is tested.
	this.bookmarkManager.folderName = "[SessionSaverOptions]";
	this.m_saveEnabled = true;
}

Options.prototype.setBookmarkManagerFolder = function(value)
{
	this.bookmarkManager.folderName = value;
}

Options.prototype.getSaveCurrentWindowOnly = function()
{
	return this.m_saveCurrentWindowOnly;
}

Options.prototype.setSaveCurrentWindowOnly = function(value)
{
	this.m_saveCurrentWindowOnly = value;
}

Options.prototype.getCloseSavedTabs = function()
{
	return this.m_closeSavedTabs;
}

Options.prototype.setCloseSavedTabs = function(value)
{
	this.m_closeSavedTabs = value;
}

Options.prototype.getLogging = function()
{
	return this.m_logging;
}

Options.prototype.setLogging = function(value)
{
	this.m_logging = value;
}

Options.prototype.save = function(afterCallback)
{
	if (!this.m_saveEnabled)
	{
		return;
	}
	var itemUrl = "http://www.google.com/";
	var thisOptions = this;
	
	// Remove item with options data if it exists.
	thisOptions.bookmarkManager.removeBookmarkItemAllStartsWith(thisOptions.m_itemTitle, function()
	{
		var optionData = thisOptions.m_itemTitle+
			"SaveCurrentWindowOnly="+thisOptions.m_saveCurrentWindowOnly+"; "+
			"CloseSavedTabs="+thisOptions.m_closeSavedTabs+"; "+
			"Logging="+thisOptions.m_logging+";"

		// Create item with options data.
		thisOptions.bookmarkManager.createBookmarkItem(optionData, itemUrl, 
		function(item)
		{
			if (afterCallback)
			{
				afterCallback();
			}
		});
	});
}

Options.prototype._getData = function(optionData, name)
{
	var parse = optionData;
	var loc = parse.indexOf(name+"=")+name.length+1;
	if(loc == name.length)return null;
	var lo2 = parse.indexOf(";",loc);
	lo2 = (lo2==-1)?parse.length:lo2;
	return parse.substring(loc,lo2);
}

Options.prototype.load = function(afterCallback)
{
	if (!this.m_saveEnabled)
	{
		return;
	}
	var thisOptions = this;
	
	// Get title of saved item.
	thisOptions.bookmarkManager.getBookmarkItemInformationStartsWith(thisOptions.m_itemTitle, 
	function(numBookmarkItems, firstItemInfo)
	{
		// If saved item was found, parse the data.
		if (numBookmarkItems>0)
		{
			var optionData = firstItemInfo.title;
			thisOptions.m_saveCurrentWindowOnly = thisOptions._getData(optionData, "SaveCurrentWindowOnly").toBool();
			thisOptions.m_closeSavedTabs = thisOptions._getData(optionData, "CloseSavedTabs").toBool();
			thisOptions.m_logging = thisOptions._getData(optionData, "Logging").toBool();
		}
		if (afterCallback)
		{
			afterCallback();
		}		
	});
}

// Factory for Options. Used when bookmarks are available.
function createOptions()
{
	var options = new Options();
	options.prepareBookmarkManager();
	return options;
}

// Factory for Options. Used when bookmarks not available.
// Does not store data in bookmarks (used for testing menus from html locally).
function createOptionsWithoutBookmarks()
{
	var options = new Options();
	return options;
}
