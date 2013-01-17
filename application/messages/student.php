<?php defined('SYSPATH') or die('No direct script access.');

return array(
	'first_name' => array(
		'not_empty' => 'first name NOT EMPTY',
	),
	'last_name'  => array(
		'not_empty' => 'last name NOT EMPTY',
	),
	'course'     => array(
		'not_empty' => 'course NOT EMPTY',
	),
	'grade'      => array(
		'not_empty' => 'grade NOT EMPTY',
		'digit'     => '\':value\' is not a digit!!!',
	),
);