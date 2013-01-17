<?php defined('SYSPATH') or die('No direct script access.');

class View_User_Index extends View_Layout {

	public $title = 'User\'s data';

	private $_date_format = "d/m/Y H:i";

	public function users()
	{
		$users = Model_User::get_users();

		foreach ($users as & $user)
		{
			foreach (['created', 'modified'] as $field_name)
			{
				$user[$field_name]  = $user[$field_name]
					? date($this->_date_format, $user[$field_name])
					: '--';
			}
		}
		unset($user);

		return $users;
	}

} // End View_User_Index