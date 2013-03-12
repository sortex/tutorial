/**
 * User client-side controller
 *
 * @package    Ongage\User
 * @category   Client-side
 * @author     Yakir Hanoch <yakir@sortex.co.il>
 * @copyright  Copyright (C) 2010 - 2012 Ongage, LTD. All rights reserved.
 * @license    Ongage, 2010-2012
 * @link       http://www.ongage.com
 */
App.controllers.user = {

	/**
	 * user/index
	 */
	index: function () {
		var $page  = $('#users');

		$page.on('click', '.delete', function() {
			var $button  = $(this),
				id       = $button.data('id'),
				username = $button.data('username');

			App.Dialog.show('confirm', 'User delete', $('<div />').append($('<p />').text('Are you sure want to delete this user: '+username+'?')), {
				position: 'center',
				buttons: [
					{
						label: 'Close'
					},
					{
						label: 'Confirm',
						callback: function() {
							$('#notices_container').remove_all_notices();
							$.ajax({
								type: 'POST',
								url: App.base+'user/delete/'+id,
								dataType: 'json',
								success: function (response) {
									if (response.success)
									{
										App.Dialog.close();
										$button.parents('tr').remove();
										$('#notices_container').add_notice('success', 'User \''+username+'\' has been deleted successfully.');
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