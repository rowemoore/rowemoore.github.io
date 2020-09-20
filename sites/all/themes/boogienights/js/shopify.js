    /// Galleries (inc. product page)
    jQuery(document).on('click select', '.gallery .thumbnails div div div a', function(e){
      var newMainImageURL = $(this).attr('href');
      var $mainImageArea = $(this).closest('.gallery').find('.main-image');
      var $mainATag = $mainImageArea.find('a');
      //If this is a change in main image...
      if($mainATag.data('href') != $(this).data('full-size-url')) {
        //Set active class
        $(this).addClass('active').siblings().removeClass('active');
        //Set main image data - so we know which one is selected
        $mainATag.data('href', $(this).data('full-size-url'));
        //Set link if on product page - for lightbox
        if($mainATag.hasClass('shows-lightbox')) {
          $mainATag.attr('href', $(this).data('full-size-url'));
        }
        //Title tag
        $mainATag.attr('title', $(this).attr('title'));
        $mainImageArea.find('img').attr('alt', $(this).attr('title')).fadeToAnotherImage(newMainImageURL, function($img){
          $img.closest('.inner').trigger('changedsize');
        });
      }
      e.preventDefault();
    });

 