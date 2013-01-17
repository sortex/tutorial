<?php defined('SYSPATH') or die('No direct script access.');

class View_User_Index extends View_Layout {

	public $title = 'User\'s data';


	public function users()
	{
		$users = Model_User::get_users();

		foreach ($users as & $user)
		{
			$user['created']  = $user['created']  ? date("d/m/Y H:i", $user['created'])  : '--';
			$user['modified'] = $user['modified'] ? date("d/m/Y H:i", $user['modified']) : '--';
		}
		unset($user);

		return $users;
	}

} // End View_User_Index