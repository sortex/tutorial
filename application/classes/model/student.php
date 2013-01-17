<?php defined('SYSPATH') or die('No direct script access.');

class Model_Student extends ORM {

	public function rules()
	{
		return array(
			'first_name' => array(
				// Uses Valid::not_empty($value);
				array('not_empty'),
			),
			'last_name'  => array(
				array('not_empty'),
			),
			'course'     => array(
				array('not_empty'),
			),
			'grade'      => array(
				array('not_empty'),
				array('digit'),
			),
		);
	}

} // End Model_Student