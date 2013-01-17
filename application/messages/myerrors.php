<?php defined('SYSPATH') or die('No direct script access.');

return array(
	'name' => array(
		'not_empty' =>                         'The name can\'t be empty!',
		'Controller_Users::valid_character' => 'The name can\'t start with "a" letter!',
	),
	'course' => array(
		'not_empty' =>  'The course can\'t be empty!',
	),
	'email' => array(
		'not_empty' =>  'The e-mail can\'t be empty!',
		'email' =>      'You need to insert valid e-mail!',
		'min_length' => 'E-mail must be minimum 8 characters!',
	),
	'website' => array(
		'not_empty' =>  'The website can\'t be empty!',
		'url' =>        'You need to insert valid website!',
	),
	'phone' => array(
		'not_empty' =>  'The phone can\'t be empty!',
		'phone' =>      'You need to insert valid phone number!',
	),
	'age' => array(
		'not_empty' =>  'The age can\'t be empty!',
		'digit' =>      'The age must contain only digits!',
		'max_length' => 'Age must be maximum 3 digits!',
	)
);