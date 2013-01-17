<?php defined('SYSPATH') or die('No direct script access.');

class Model_User extends ORM {

	protected $_created_column = array('column' => 'created',  'format' => TRUE);
	protected $_updated_column = array('column' => 'modified', 'format' => TRUE);

	public function rules()
	{
		return array(
			'username'  => array(
				// Uses Valid::not_empty($value);
				array('not_empty'),
				array('alpha_numeric'),
				array('min_length', array(':value', 6)),
			),
			'full_name' => array(
				array('not_empty'),
			),
			'age'       => array(
				array('digit'),
			),
		);
	}

	/**
	 * Get all users
	 *
	 * @return array
	 */
	public static function get_users()
	{
		return DB::select()
			->from('users')
			->execute()
			->as_array();
	}

	/**
	 * Get first user creation
	 *
	 * @return array
	 */
	public static function get_first_user_created()
	{
		return DB::select()
			->from('users')
			->order_by('created', 'ASC')
			->limit(1)
			->execute()
			->as_array();
	}

} // End Model_User