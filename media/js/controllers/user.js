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
		var $page  = $('#users'),
			window_height = $(window).height(),
			window_width = $(window).width();

		$page.on('click', '.delete', function() {
			var $id = $(this);
			log($id);
			App.Dialog.show('confirm', 'User delete', $('<p />').append('Are you shure want to delete this user?'), {
				width: window_width*0.05,
				height: window_height*0.40,
				position: ['center', window_height*0.05],
				buttons: [
					{
						label: 'Close'
					},
					{
						label: 'Confirm',
						callback: function() {
							log('damn');
							$.ajax({
								type: 'POST',
								url: App.base+'user/delete/'+$id,
								dataType: 'json',
								success: function (response) {
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