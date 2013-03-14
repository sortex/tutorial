<?php defined('SYSPATH') or die('No direct script access.');

class View_User_Index extends View_Layout {

	public $title = 'User\'s data';

	public function assets($assets)
	{
		$assets->group('slickgrid');
		$assets->group('user');
		return parent::assets($assets);
	}

} // End View_User_Index