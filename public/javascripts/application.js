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
$(document).ready( function(){
        // each page has 20 entries
        function getBaseUrl(){
            var baseurl = location.href.slice(location.origin.length);
            var patt = /&limit=(\d+)/;
            var limit = patt.exec( baseurl )
            if(! limit ) return baseurl+"&limit=" + (20*count);
            baseurl.replase( patt, "&limit="+(limit+20*count));
        }
        $('#content').scrollPagination({
            'contentPage':  getBaseUrl,
            'contentData': {}, // these are the variables you can pass to the request, for example: children().size() to know which page you are
            'scrollTarget': $(window), // who gonna scroll? in this example, the full window
            'heightOffset': 10, // it gonna request when scroll is 10 pixels before the page ends
            'beforeLoad': function(){ // before load function, you can display a preloader div
                $('#loading').fadeIn();
            },
            'afterLoad': function(elementsLoaded){ // after loading content, you can use this function to animate your new elements
                 $('#loading').fadeOut();
                 count += 1;
                 $(elementsLoaded).fadeInWithDelay();
                 if ($('#content').children().size() > 100){ // if more than 100 results already loaded, then stop pagination (only for testing)
                    $('#nomoreresults').fadeIn();
                    $('#content').stopScrollPagination();
                 }
            }
        });

        // code for fade in element by element
        $.fn.fadeInWithDelay = function(){
            var delay = 0;
            return this.each(function(){
                $(this).delay(delay).animate({opacity:1}, 200);
                delay += 100;
            });
        };
});
