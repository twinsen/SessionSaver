// Allows us to break text into chunks of sepecified size.
String.prototype.chunk = function(n)
{
	if (typeof n=='undefined')
	{
		n=2;
	}
	return this.match(RegExp('.{1,'+n+'}','g'));
};

// Converts strings to bools.
String.prototype.toBool = function()
{
	return this.toLowerCase() === 'true';
};
