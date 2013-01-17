<?php defined('SYSPATH') or die('No direct script access.');

class Model_Job extends ORM {

	protected $_created_column = array('column' => 'created',  'format' => TRUE);
	protected $_updated_column = array('column' => 'modified', 'format' => TRUE);

	public function rules()
	{
		return array(
			'user_id' => array(
				array(function($user_id, Validation $validation) {
					$user = new Model_User($user_id);
					if ( ! $user->loaded())
						$validation->error('user_id', 'loaded');
				}, array(':value', ':validation')),
			),
			'title' => array(
				// Uses Valid::not_empty($value);
				array('not_empty'),
			),
			'money_per_hour'  => array(
				array('digit'),
			),
		);
	}

	public static function get_job_by($user_id)
	{
		return DB::select()
			->from('jobs')
			->where('user_id', '=', $user_id)
			->execute()
			->as_array();
	}

} // End Model_Job