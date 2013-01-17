<?php defined('SYSPATH') or die('No direct script access.');

class View_Welcome_Index extends View_Layout {

	public $title = 'Kohana project';

	public function user()
	{
		$users =  Model_User::get_first_user_created();
		foreach ($users as & $user)
		{
			$user['created'] = date('l jS \o\f F Y \a\t g:i A (H:i)', $user['created']);
		}

		return $users;
	}

} // End View_Welcome_Index