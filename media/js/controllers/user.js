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
			$filter = $('#users-filter'),
			$grid = $('#grid_users');

		// Setup reset button
		$filter.on('click', 'button[type=reset]', function() {
			$filter.trigger('reset').trigger('submit');
			return false;
		});

		// Setup model
		var model = new Slick.Data.RemoteModel();
		model.setUrl(App.base+'user/get_users');
		model.bindForm('#users-filter', $grid, {
			// Set filter to column map names
			name: ['username', 'full_name'],
			age:  'age'
		});
		model.setFilters([
			[ 'name', 'LIKE',  'bind(name)' ],
			[ 'age',  '=',     'bind(age)' ]
		]);

		$grid.datagrid({
			model: model,
			columns: [
				{id: 'id',        name: 'ID'},
				{id: 'username',  name: 'User name'},
				{id: 'full_name', name: 'Full Name'},
				{id: 'age',       name: 'Age'},
				{id: 'created',   name: 'created'},
				{id: 'modified',  name: 'modified'}
			],
			buttons: [
				{
					label: 'Edit',
					click: function(id, callback, row) {

					}
				}
			]
		});

//		$page.on('click', '.delete', function() {
//			var $button  = $(this),
//				id       = $button.data('id'),
//				username = $button.data('username');
//
//			App.Dialog.show('user_delete', 'User delete', $('<div />').append($('<p />').text('Are you sure want to delete this user: '+username+'?')), {
//				position: 'center',
//				buttons: [
//					{
//						label: 'Cancel'
//					},
//					{
//						label: 'Confirm',
//						callback: function() {
//							$('#notices_container').remove_all_notices();
//							$.ajax({
//								type: 'POST',
//								url: App.base+'user/delete/'+id,
//								dataType: 'json',
//								success: function (response) {
//									if (response.success)
//									{
//										App.Dialog.close();
//										$button.parents('tr').remove();
//										$('#notices_container').add_notice('success', 'User \''+username+'\' has been deleted successfully.');
//									}
//									else{
//										$('#notices_container').add_notice('error', response.errors);
//									}
//								}
//							});
//							return false;
//						}
//					}
//				]
//			});
//			return false;
//		});
	}
};