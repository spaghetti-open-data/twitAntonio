!function ($) {
    $(function(){
      
        // Caching  
        var $window = $(window);
        var $body = $('body');
    
        // Tooltips
        $body.tooltip({
            selector: "a[rel=tooltip]"
        });
    
        // Bootstrap popover behaviour
        $('a[rel=popover]').popover({
            content: function() { 
                var idx = $(this).parents('article').index();
                return $('#popover-' + idx).html(); 
            }
        }).click(function(e) {
            e.preventDefault();
        });

        // Lazy load images
        $("img.lazy").show().lazyload({
            effect : "fadeIn",
            threshold : 500
        });
    
        // Reset button
        $("button.btn-reset").click(function() {
            $(this).closest('form').find("input[type=text], textarea").val("");
        });

        // autocomplete widgets (static json)
        base = '';
        if (location.pathname !== '/') {
          base = location.pathname + '/';
        }
        
        $.getJSON(base + 'api/autocomplete', function(data) {
            $('#dep_name').autocomplete({
                source: data.names
            });
            $('#dep_country').autocomplete({
                source: data.countries
            });
            $('#dep_party').autocomplete({
                source: data.party
            });
        });
        
        function twantonio_clickEventToAnalytics(intent_event) {
          // console.log(intent_event);
        }

        // tw web intents api (https://dev.twitter.com/docs/intents/events)
        twttr.ready(function (twttr) {
          // Now bind our custom intent events
          // not yet implemented, seems that "tweet" event does not return anything about the tweet itself (muble, muble)
          //twttr.events.bind('click', twantonio_clickEventToAnalytics);
          //twttr.events.bind('tweet', twantonio_clickEventToAnalytics);
        });

        // 

    })
}(window.jQuery)

var count = 1;
function getNextUrl(){
    var baseurl = location.href.slice(location.origin.length);
    var patt = /\?offset=(\d+)/;
    var offset = patt.exec( baseurl )
    var ret = "";
    if(! offset ) ret = baseurl+"&offset=" + (15*count);
    else ret = baseurl.replace( patt, "&offset="+(offset+15*count));
    count ++;
    return ret;
}

$(document).ready( function(){
    $("div.navigation a:first").attr('href',getNextUrl());
    // each page has 20 entries 
    $('#content').infinitescroll({
        navSelector  : "div.navigation", // selector for the paged navigation (it will be hidden)
        nextSelector : "div.navigation a", // selector for the NEXT link (to page 2)
        itemSelector : "#content article.candidate", // selector for all items you'll retrieve
        debug: true,
        path: getNextUrl
    },function(){ 
         $("div.navigation a:first").attr('href',getNextUrl());
    });
});
