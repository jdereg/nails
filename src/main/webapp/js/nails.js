/**
 * Nails
 * @author John DeRegnaucourt
 */
$(function ()
{
    initialize();


    function initialize()
    {
        $('#gen').click(function()
        {
            buy();
        });
    }

    function buy()
    {
        var firstName = $('#firstName').val();
        var result = call('nailsController.getList', [firstName]);
        if (result.status !== true)
        {
            alert('Error returned from server: ' + result.data);
            return;
        }
        fillList(result);
    }

    function fillList(result)
    {
        var ul = $('#sampleList');
        ul.empty();
        var strings = result.data;
        for (var i = 0; i < strings.length; i++)
        {
            var li = $('<li/>');
            var a = $('<a/>').html(strings[i]);
            li.append(a);
            ul.append(li);
        }
    }
});