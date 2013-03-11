if (typeof jQuery != "undefined"){

	// On DOM Ready
	(function($){$(document).ready(function(){

		// Show closing "X"s
		$("div.notice-close").show();
		//$('div.notice').width($('div.notice').width());

		// Close a notice if the "X" is clicked
		$('div.notice-close a').live("click", function(){
			var notice = $(this).closest("div.notice");
			var persistent = notice.hasClass('notice-persistent');
			notice.hide("fast");

			if (persistent){
				var ajax_url = $(this).attr("href");
				$.ajax({
					url: ajax_url,
					cache: false,
					dataType: 'json',
					success: $.noop(),
					error: $.noop()
				});
			}

			return false;
		});

		// Extending the jQuery object to add notices
		// Example: $('div.notices-container').add_notice('success', 'You have succeeded!', true);
		jQuery.fn.add_notice = function(type, message, noscroll){
			if ( ! noscroll) { scrollTo(0,0); }
			var container = $(this);

			// Creating notice markup
			var $notice = $('<div />').addClass('notice '+type);
			$notice.append($('<div />').addClass('notice-content').html(message));

			container.append($notice);
			return this;
		};

		// Close any active notices
		jQuery.fn.remove_all_notices = function(){
			var container = $(this);
			container.find('.notice').each(function () {
				$(this).remove();
			});
			return this;
		};

	})})(jQuery); // Prevent conflicts with other js libraries
}