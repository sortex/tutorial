<?php defined('SYSPATH') or die('No direct script access.');

class View_Campaign_Index extends View_Layout {

	public $title = 'Campaign Dashboard';

	public $condition = TRUE;
	public $condition_true = 'barvaz';
	public $condition_false = 'lion';

	public $arr = array(
		array(
			'name'  => 'Alex',
			'grade' => 100,
		),
		array(
			'name'  => 'Yakir',
			'grade' => 90,
		),
		array(
			'name'  => 'Bob',
			'grade' => 110,
		),
		array(
			'name'  => 'Dylan',
			'grade' => 0,
		),
	);

	public $p = '<p>Hello</p>';

} // End View_Campaign_Index
