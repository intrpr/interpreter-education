//Menu Init
ddsmoothmenu.init({
    mainmenuid: "menu", //menu DIV id
    orientation: 'h', //Horizontal or vertical menu: Set to "h" or "v"
    classname: 'ddsmoothmenu', //class added to menu's outer DIV
    //customtheme: ["#1c5a80", "#18374a"],
    contentsource: "markup" //"markup" or ["container_id", "path_to_menu_file"]
});
//Cufon replacement
// Cufon.replace('h1')('h2')('h3')('h4')('h5')('h6');
//slider
jQuery(function(){
    var startSlide = 1;
    if (window.location.hash) {
        startSlide = window.location.hash.replace('#','');
    }
    jQuery('#slides').slides({
        preload: false,
        preloadImage: 'images/loading.gif',
        generatePagination: true,
        play: 5000,
        pause: 2500,
        effect: 'fade',
        crossfade: true,
        hoverPause: true,
        start: startSlide,
        animationComplete: function(current){
            window.location.hash = '#' + current;
        }
    });
});
//Flexslider
jQuery(window).load(function() {
    jQuery('.flexslider').flexslider();
});
//Contact validate
jQuery(document).ready(function(){
    jQuery("#contactForm").validate();

    // added qtip for the registration tooltip
    // depends on the google calendar plugin which
    // loads the qtip resource ... if that's disabled this will
    // stop working
    try {
        jQuery('#qtip-register-question').qtip({
           content: 'Registration is only required to view the video catalogs ' +
            'in the Teaching Interpreting Media (TIM) section. ' +
            'Click to read the FAQ for more information.',
           show: 'mouseover',
           hide: 'mouseout',
           position: {
              corner: {
                 target: 'bottomLeft',
                 tooltip: 'topRight'
              }
           },
           style: {
             background: '#65A905',
             color: "white",
             "line-height": "18px"
           }
        });
    } catch (e) {
        // pass, if no qtip just run away
    }
});

