<?php defined('SYSPATH') or die('No direct script access.');

class View_Workdays_Edit extends View_Workdays {

	public $title = 'Work days';

	public function days()
	{
		$days = array();

		$first_day_timestamp = $this->first_day_timestamp();
//		$max_day_timestamp   = mktime(0, 0, 0, $this->month+1, 0, $this->year);
		$max_day_timestamp   = mktime(0, 0, 0, $this->month, date('t', $first_day_timestamp), $this->year);

		for ($day = $first_day_timestamp; $day <= $max_day_timestamp; $day += Date::DAY)
		{
			$days[] = array(
				'day_number' => date('d', $day),
				'day_text'   => date('l', $day),
			);
		}

		return $days;
	}

} // End View_Workdays_Edit