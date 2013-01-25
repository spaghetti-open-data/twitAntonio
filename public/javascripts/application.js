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
          return $(this).prev('div.popover-content').html(); 
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
    
    // Mansory init
    $('#content').masonry({
        // options
        itemSelector: '.candidate',
        columnWidth: 230
        // RESPONSIVE: set columnWidth a fraction of the container width
        // columnWidth: function( containerWidth ) {
          //return containerWidth / 4;
        // }
    });
    
    // Reinitialize mansory after a scrollstop event
    $window.bind('scrollstop', function () {
        $('#content').masonry();
    });

    // autocomplete widgets (static json)
    // needs fixes
    $.getJSON('api/autocomplete/names', function(data) {
      $('#dep_name').autocomplete({
        source: data
      });
    });  
    $.getJSON('api/autocomplete/countries', function(data) {
      $('#dep_country').autocomplete({
        source: data
      });
    });  
    $.getJSON('api/autocomplete/parties', function(data) {
      $('#dep_party').autocomplete({
        source: data
      });
    });  
  })
}(window.jQuery)