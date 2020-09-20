(function ($) {

/**
 * Attaches double-click behavior to toggle full path of Krumo elements.
 */
Drupal.behaviors.devel = {
  attach: function (context, settings) {

    // Add hint to footnote
    $('.krumo-footnote .krumo-call').before('<img style="vertical-align: middle;" title="Click to expand. Double-click to show path." src="' + Drupal.settings.basePath + 'misc/help.png"/>');

    var krumo_name = [];
    var krumo_type = [];

    function krumo_traverse(el) {
      krumo_name.push($(el).html());
      krumo_type.push($(el).siblings('em').html().match(/\w*/)[0]);

      if ($(el).closest('.krumo-nest').length > 0) {
        krumo_traverse($(el).closest('.krumo-nest').prev().find('.krumo-name'));
      }
    }

    $('.krumo-child > div:first-child', context).dblclick(
      function(e) {
        if ($(this).find('> .krumo-php-path').length > 0) {
          // Remove path if shown.
          $(this).find('> .krumo-php-path').remove();
        }
        else {
          // Get elements.
          krumo_traverse($(this).find('> a.krumo-name'));

          // Create path.
          var krumo_path_string = '';
          for (var i = krumo_name.length - 1; i >= 0; --i) {
            // Start element.
            if ((krumo_name.length - 1) == i)
              krumo_path_string += '$' + krumo_name[i];

            if (typeof krumo_name[(i-1)] !== 'undefined') {
              if (krumo_type[i] == 'Array') {
                krumo_path_string += "[";
                if (!/^\d*$/.test(krumo_name[(i-1)]))
                  krumo_path_string += "'";
                krumo_path_string += krumo_name[(i-1)];
                if (!/^\d*$/.test(krumo_name[(i-1)]))
                  krumo_path_string += "'";
                krumo_path_string += "]";
              }
              if (krumo_type[i] == 'Object')
                krumo_path_string += '->' + krumo_name[(i-1)];
            }
          }
          $(this).append('<div class="krumo-php-path" style="font-family: Courier, monospace; font-weight: bold;">' + krumo_path_string + '</div>');

          // Reset arrays.
          krumo_name = [];
          krumo_type = [];
        }
      }
    );
  }
};

})(jQuery);
;
(function ($) {

// Sync main title with secondary title.
Drupal.bookHelperSyncTitles  = function (syncSelector, mainTitleSelector, secondaryTitleSelector) {
  if (!$(syncSelector).length || $(syncSelector).hasClass('book-helper-sync-processed')) {
    return;
  }

  // Add event handler to sync checkbox.
  $(syncSelector).click( function () {
    if (this.checked) { // Node and book title are sync'ed
      $(secondaryTitleSelector).val( $(mainTitleSelector).val() )
    }
  }).addClass('book-helper-sync-processed');

  // Add event handlers to main title input.
  $(mainTitleSelector).bind('keyup mouseup blur', function () {
    if ($(syncSelector)[0].checked) {
      $(secondaryTitleSelector).val(this.value);
    }
  });

  // Add event handlers to secondary title input.
  $(secondaryTitleSelector).bind('keyup mouseup blur', function () {
    if ($(syncSelector)[0].checked) {
      $(mainTitleSelector).val(this.value);
    }
  });

  // Init the sync checkbox.
  $(syncSelector)[0].checked = ($(secondaryTitleSelector).val() == $(mainTitleSelector).val()) ? true : false;
}

// Hide/show book outline fields.
Drupal.bookHelperToggleSync = function() {
  var effect = ($('#edit-book-bid').val() == '0') ? 'hide' : 'show';
  $('.form-item-book-book-helper-link-title-custom, .form-item-book-book-helper-link-title-sync, .form-item-book-weight')[effect]();
}

// Book helper behaviors
Drupal.behaviors.bookHelper = {
  attach: function (context) {
    // Node edit form book outline.
    if ($('#edit-book-bid', context).length) {
      // Toggle sync fields
      $('#edit-book-bid').change(Drupal.bookHelperToggleSync);
      Drupal.bookHelperToggleSync();

      // Sync book titles on node edit form.
      Drupal.bookHelperSyncTitles(
        '#edit-book-book-helper-link-title-sync',
        '#edit-title',
        '#edit-book-book-helper-link-title-custom'
      );
    }

    // Sync book titles on book page order form.
    if ($('#book-outline', context).length) {
      $('#book-outline tbody td:nth-child(3) input').each(function(){
        // edit-table-book-admin-{nid}-sync
        var syncSelector = '#' + this.id;
        // edit-table-book-admin-{nid}-title
        var mainTitleSelector = syncSelector.replace('-sync', '-title');
        // edit-table-book-admin-{nid}-node-title
        var secondaryTitleSelector = syncSelector.replace('-sync', '-node-title');

        Drupal.bookHelperSyncTitles(syncSelector, mainTitleSelector, secondaryTitleSelector);
      });
    }
  }
};

})(jQuery);
;
