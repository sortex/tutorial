<?php defined('SYSPATH') or die('No direct script access.');

return array(
	'username'  => array(
		'not_empty' => 'User name can\'t be empty!',
		'min_length' => 'User name must be 6 letters minimum!',
	),
	'full_name' => array(
		'not_empty' => 'Full name can\'t be empty!',
	),
	'age'       => array(
		'digit' => '\':value\' is not a digit!',
	),
);