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
			var $button   = $(this),
				id        = $button.data('id'),
				job_title = $button.data('job_title');

			App.Dialog.show('job_delete', 'Job delete', $('<div />').append($('<p />').text('Are you sure want to delete this job: '+job_title+'?')), {
				position: 'center',
				buttons: [
					{
						label: 'Cancel'
					},
					{
						label: 'Confirm',
						callback: function() {
							$('#notices_container').remove_all_notices();
							$.ajax({
								type: 'POST',
								url: App.base+'jobs/delete/'+id,
								dataType: 'json',
								success: function(response) {
									if(response.success){
										App.Dialog.close();
										$button.parents('tr').remove();
										$('#notices_container').add_notice('success', 'Job \''+job_title+'\' has been deleted successfylly');
									}
									else{
										$('#notices_container').add_notice('error', response.errors);
									}
								}
							});
							return false;
						}
					}
				]
			});
			return false;
		});
	}
};