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
	 * Extending the delete method of user model
	 * - deleting user jobs before deleting user.
	 *
	 * @chainable
	 * @return Model_User
	 * @throws Kohana_Exception
	 */
	public function delete()
	{
		if ( ! $this->_loaded)
			throw new Kohana_Exception('Cannot delete :model model because it is not loaded.', array(':model' => $this->_object_name));

		// Deleting user jobs
		DB::delete('jobs')
			->where('user_id', '=', $this->id)
			->execute();

		return parent::delete();
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