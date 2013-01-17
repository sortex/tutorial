<?php defined('SYSPATH') or die('No direct script access.');

class View_Student_Index extends View_Layout {

	public $title = 'using Kostache';

	public function routes()
	{
		return array(
			'student_form' => Route::url('default', array('controller' => 'student', 'action' => 'form'))
		);
	}

	public function students()
	{
		return ORM::factory('student')->find_all();
	}

} // End View_Student_Index