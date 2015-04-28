/**

 * Replace @ref fields and array elements with referenced object.  Recursively
 * traverse JSON object tree in two passes, once to record @id's of objects, and
 * a second pass to replace @ref fields with objects identified by @id fields.
 *
 * @author John DeRegnaucourt
 */
function resolveRefs(jObj)
{
    var idsToObjs = [];

    // First pass, store all objects that have an @ID field, mapped to their instance (self)
    walk(jObj, idsToObjs);

    // Replace all @ref: objects with the object from the association above.
    substitute(null, null, jObj, idsToObjs);

    idsToObjs = null;
}

function walk(jObj, idsToObjs)
{
    for (var field in jObj)
    {
        var value = jObj[field];
        if (field == "@id")
        {
            idsToObjs[value] = jObj;
        }
        else if (typeof(value) == "object")
        {
            walk(value, idsToObjs);
        }
    }
}

function substitute(parent, fieldName, jObj, idsToObjs)
{
    for (var field in jObj)
    {
        var value = jObj[field];
        if (field == "@ref")
        {
            if (parent != null && fieldName != null)
            {
                parent[fieldName] = idsToObjs[jObj["@ref"]];
            }
        }
        else if (typeof(value) == "object")
        {
            substitute(jObj, field, value, idsToObjs);
        }
    }
}

/**
 * Get an HTTP GET command URL for use when the Ajax (JSON) command
 * to be sent to the command servlet has a streaming return type.
 * @param target String in the form of 'controller.method'
 * @param args Array of arguments to be passed to the method.
 */
function stream(target, args)
{
	return buildJsonCmdUrl(target) + '?json=' + buildJsonArgs(args);
}

function buildJsonCmdUrl(target)
{
    var pieces = target.split('.');
    if (pieces == null || pieces.length != 2)
    {
        throw "Error: Use 'Controller.method'";
    }
    var controller = pieces[0];
    var method = pieces[1];

    var regexp = /\/([^\/]+)\//g;
    var match = regexp.exec(location.pathname);
    if (match == null || match.length != 2)
    {
        return location.protocol + '//' + location.hostname + ":" + location.port + "/cmd/" + controller + "/" + method;
    }
    var ctx = match[1];
    return location.protocol + '//' + location.hostname + ":" + location.port + "/" + ctx + "/cmd/" + controller + "/" + method;
}

function buildJsonArgs(args)
{
    if (args == null)
    {
        args = [];  // empty args
    }

    return JSON.stringify(args);
}

/**
 * Use this to make a RESTful server call.
 * 'target' identifies the server as a Controller and
 * a method (action).
 * 'args' is an array [] of arguments for the given method.
 * 'params' is an option object that allows you to specify the
 * timeout value and a callback function (for asynchronous calls).
 *
 * Example 1:
 *   call("searchController.findSubmission", [1234567]);
 * In this example, an Ajax call is made to the 'searchController', which
 * is the Spring bean name of the destination object.  The method
 * 'findSubmission()' is called, with the parameter '1234567'.
 *
 * Example 2:
 *   call("searchController.findSubmission", [1234567], {timeout: 60000, callback:
 *       function(result)
 *       {
 *       // This function is called when the asynchronous call to the server returns
 *       });
 *
 * The call is made asynchronously when the params object is included *and* the
 * 'callback' field is supplied.
 */
function call(target, args, params)
{
 	var url = buildJsonCmdUrl(target);
    var json;
    try
    {
        json = buildJsonArgs(args);
    }
    catch (err)
    {
        return {status:null,data:"Arguments could not be converted to JSON string."};
    }
    var result = null;
    var async = false;
    var timeout = 60000;

    if (params != null)
    {
        async = (params.callback && typeof params.callback === "function");
        if (params.timeout)
        {
            timeout = params.timeout;
        }
    }

    $.ajax({
        type : "POST",
        url : url,
        async : async,
        cache : false,
        data : json,
        dataType : "json",
        contentType: "application/json",
        timeout : timeout,
        success : function(data, textStatus)
        {
            result = data;
            if (async)
            {
                if (result == null || typeof result == 'undefined' ||
                    result.status == null || typeof result.status == 'undefined')
                {
                    params.callback({status:null,data:'Communications error.  Check your network connection.'});
                }
                else
                {
                    resolveRefs(result.data);
                    params.callback(result);
                }
            }
        },
        error : function(XMLHttpRequest, textStatus, errorThrown)
        {
            if (async)
            {
                params.callback({status:null,data:textStatus}, errorThrown);
            }
            else
            {
                result = {status:null, data:textStatus};
            }
        }
    });

    if (async)
    {
        return {status:true,data:null};
    }
    else
    {
        if (result == null || typeof result == 'undefined' ||
            result.status == null || typeof result.status == 'undefined')
        {
            return {status:null,data:'Communications error.  Check your network connection.'};
        }

        resolveRefs(result.data);
        return result;
    }
}

(function ($) {
	$.extend({
		getQueryString: function (name)
		{
			function parseParams()
			{ var params = {},
				e,
				a = /\+/g,  // Regex for replacing addition symbol with a space
				r = /([^&=]+)=?([^&]*)/g,
				d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
				q = window.location.search.substring(1);
				while (e = r.exec(q))
					params[d(e[1])] = d(e[2]);
				return params;
				}
			if (!this.queryStringParams)
				this.queryStringParams = parseParams();
			return this.queryStringParams[name];
			}
	});
})(jQuery);
