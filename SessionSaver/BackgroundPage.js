// Gets the background page.
function getBackgroundPage()
{
	if (typeof(chrome)=="undefined")
	{
		throw new Error("getBackgroundPage() - Must use chrome browser");
	}
	if (chrome.self==null)
	{
		throw new Error("getBackgroundPage() - Must be called from extension");
	}
	var views = chrome.self.getViews();
	var backgroundPage = null;
	for (var i in views)
	{
		if (views[i].is_bgp)
		{
			backgroundPage = views[i];
		}
	}
	if (backgroundPage==null)
	{
		throw new Error("getBackgroundPage() - Background page not found");
	}
	return backgroundPage;
}
