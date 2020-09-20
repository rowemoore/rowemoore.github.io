(function ($, Drupal, PhotoSwipe, PhotoSwipeUI_Default) {
  Drupal.behaviors.photoswipe = {
    /**
     * PhotoSwipe Options, coming from Drupal.settings.
     */
    photoSwipeOptions: {},
    /**
     * Instantiated galleries.
     */
    galleries: [],
    /**
     * Load PhotoSwipe once page is ready
     */
    attach: function (context, settings) {
      this.photoSwipeOptions = settings.photoswipe ? settings.photoswipe.options : {};

      var $galleries = $('.photoswipe-gallery', context);
      if ($galleries.length) {
        // loop through all gallery elements and bind events
        $galleries.each( function (index) {
          var $gallery = $(this);
          $gallery.attr('data-pswp-uid', index + 1);
          $gallery.on('click', Drupal.behaviors.photoswipe.onThumbnailsClick);
        });
      }
      var $imagesWithoutGalleries = $('a.photoswipe', context).filter(function(elem) {
        return !$(this).parents('.photoswipe-gallery').length;
      });
      if ($imagesWithoutGalleries.length) {
        // We have no galleries just individual images.
        $imagesWithoutGalleries.each(function(index) {
          $imageLink = $(this);
          $imageLink.wrap('<span class="photoswipe-gallery"></span>');
          var $gallery = $imageLink.parent();
          $gallery.attr('data-pswp-uid', index + 1);
          $gallery.on('click', Drupal.behaviors.photoswipe.onThumbnailsClick);
          $galleries.push($gallery);
        });
      }

      // Parse URL and open gallery if it contains #&pid=3&gid=1
      var hashData = this.parseHash();
      if(hashData.pid > 0 && hashData.gid > 0) {
        this.openPhotoSwipe(hashData.pid - 1 ,  $($galleries[hashData.gid - 1]));
      }
    },
    /**
     * Triggers when user clicks on thumbnail.
     *
     * Code taken from http://photoswipe.com/documentation/getting-started.html
     * and adjusted accordingly.
     */
    onThumbnailsClick: function(e) {
      e = e || window.event;
      e.preventDefault ? e.preventDefault() : e.returnValue = false;

      var $clickedGallery = $(this);

      var eTarget = e.target || e.srcElement;
      var $eTarget = $(eTarget);

      // find root element of slide
      var clickedListItem = $eTarget.closest('.photoswipe');

      if (!clickedListItem) {
        return;
      }

      // get the index of the clicked element
      index = clickedListItem.index('.photoswipe');
      if (index >= 0) {
        // open PhotoSwipe if valid index found
        Drupal.behaviors.photoswipe.openPhotoSwipe(index, $clickedGallery);
      }
      return false;
    },
    /**
     * Code taken from http://photoswipe.com/documentation/getting-started.html
     * and adjusted accordingly.
     */
    openPhotoSwipe: function(index, galleryElement, options) {
      var pswpElement = $('.pswp')[0];
      var items = [];
      options = options || Drupal.behaviors.photoswipe.photoSwipeOptions;

      var images = galleryElement.find('a.photoswipe');
      images.each(function (index) {
        var $image = $(this);
        size = $image.data('size') ? $image.data('size').split('x') : ['',''];
        items.push(
          {
            src : $image.attr('href'),
            w: size[0],
            h: size[1],
            title : $image.data('overlay-title')
          }
        );
      })

      // define options
      options.index = index;
      // define gallery index (for URL)
      options.galleryUID = galleryElement.data('pswp-uid');

      // Pass data to PhotoSwipe and initialize it
      var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
      gallery.init();
      this.galleries.push(gallery);
    },
    /**
     * Parse picture index and gallery index from URL (#&pid=1&gid=2)
     *
     * Code taken from http://photoswipe.com/documentation/getting-started.html
     * and adjusted accordingly.
     */
    parseHash: function() {
      var hash = window.location.hash.substring(1),
      params = {};

      if (hash.length < 5) {
        return params;
      }

      var vars = hash.split('&');
      for (var i = 0; i < vars.length; i++) {
        if (!vars[i]) {
          continue;
        }
        var pair = vars[i].split('=');
        if (pair.length < 2) {
          continue;
        }
        params[pair[0]] = pair[1];
      }

      if(params.gid) {
        params.gid = parseInt(params.gid, 10);
      }

      if(!params.hasOwnProperty('pid')) {
        return params;
      }
      params.pid = parseInt(params.pid, 10);

      return params;
    }
  };
})(jQuery, Drupal, PhotoSwipe, PhotoSwipeUI_Default);
;/**/
(function ($) {

  'use strict';

  Drupal.behaviors.responsive_menu = {
    attach: function (context, settings) {

      $('body', context).once('responsive-menu', function() {

        if (typeof($.mmenu) != 'undefined') {

          // Get the position and theme options from Drupal settings.
          var position = Drupal.settings.responsive_menu.position;
          var theme = Drupal.settings.responsive_menu.theme;

          // Set up the off canvas menu.
          $('#off-canvas').mmenu({
            extensions: [theme, 'effect-slide-menu'],
            offCanvas: {
              zposition: 'next',
              position: position
            },
            keyboardNavigation: {
              enable: true,
              enhance: true
            },
            screenReader: {
              aria: true,
              text: true
            }
          }, {
            clone: false
          });
        }

        // Apply the superfish library to the menu.
        if ($.fn.superfish) {
          // Get the superfish settings.
          var superfishDelay = Drupal.settings.responsive_menu.superfish.delay,
            superfishSpeed = Drupal.settings.responsive_menu.superfish.speed,
            superfishSpeedOut = Drupal.settings.responsive_menu.superfish.speedOut;
          // Attach superfish to the responsive menu.
          $('#horizontal-menu').superfish({
            delay: parseInt(superfishDelay, 10),
            speed: parseInt(superfishSpeed, 10),
            speedOut: parseInt(superfishSpeedOut, 10)
          }).addClass('sf-menu');
        }

        // Add the Hammer config if needed.
        if (typeof(Hammer) != 'undefined') {

          var mc = new Hammer($('body').get(0), {
            cssProps: {
              userSelect: true
            },
            // Reset the touchAction to auto as this allows pinch zooming.
            // mmenu handles the scrolling once open.
            touchAction: 'auto'
          });
          mc.get('swipe').set({
            velocity: 0.3,
            threshold: 5
          });

          mc.on("swipeleft swiperight", function(e) {
            // Only do something if we're below our breakpoint. The simplest
            // method is to check whether the horizontal desktop sized
            // responsive menu is hidden.
            if ($('.responsive-menu-block-wrapper').is(':hidden')) {
              hammerswipe(mc, e);
            }
          });

        }

      });
    }
  };

  /**
   * Opens or closes the mmenu based on swipe direction.
   *
   * @param mc
   *   Hammer object instance.
   * @param e
   *   Swipe event.
   */
  function hammerswipe(mc, e) {
    var position = Drupal.settings.responsive_menu.position;
    var api = $('#off-canvas').data('mmenu'),
      $html = $('html');

    if (e.type == 'swiperight') {
      if (position == 'right' && $html.hasClass('mm-opened')) {
        // Close the menu.
        api.close();
      }
      if (position == 'left' && !$html.hasClass('mm-opened')) {
        // Open the menu.
        api.open();
      }
    }

    if (e.type == 'swipeleft') {
      if (position == 'right' && !$html.hasClass('mm-opened')) {
        // Open the menu.
        api.open();
      }
      if (position == 'left' && $html.hasClass('mm-opened')) {
        // Close the menu.
        api.close();
      }
    }
  }

})(jQuery);
;/**/
