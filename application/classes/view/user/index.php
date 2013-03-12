<?php defined('SYSPATH') or die('No direct script access.');

class View_User_Index extends View_Layout {

	public $title = 'User\'s data';
	public $users;

	private $_date_format = "d/m/Y H:i";

	public function assets($assets)
	{
		$assets->group('user');
		return parent::assets($assets);
	}

	public function users()
	{
		foreach ($this->users as & $user)
		{
			foreach (['created', 'modified'] as $field_name)
			{
				$user[$field_name]  = $user[$field_name]
					? date($this->_date_format, $user[$field_name])
					: '--';
			}
		}
		unset($user);

		return $this->users;
	}

} // End View_User_Index