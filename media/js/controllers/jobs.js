/**
 * Jobs client-side controller
 *
 */
App.controllers.jobs = {

	/**
	 * jobs/index
	 */
	index: function() {
		var $page = $('#jobs');

		$page.on('click', '.delete', function() {
			var $button = $(this),
				id      = $button.data('id'),
				title   = $button.data('job');

			App.Dialog.show('');
		});
	}
};