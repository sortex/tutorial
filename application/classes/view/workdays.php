<?php defined('SYSPATH') or die('No direct script access.');

class View_Workdays extends View_Layout {

	public $month;
	public $year;

	public function first_day_timestamp()
	{
		return mktime(0, 0, 0, $this->month, 1, $this->year);
	}

} // End View_Workdays