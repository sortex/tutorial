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

	/**
	 * Generate page results, returns as array.
	 *
	 * @param array  $filters Filters
	 * @param string $sort    Field to sort by
	 * @param        $order   asc/desc
	 * @param int    $offset  Offset results
	 * @param int    $limit   Limit results
	 * @return array
	 */
	public static function get_page(array $filters,$sort = 'id', $order, $offset = 0, $limit = 50)
	{
		$user_columns = array('id', 'username', 'full_name', 'age', 'created', 'modified');

		$sort  = in_array($sort, $user_columns)         ? $sort  : 'id';
		$order = in_array($order, array('asc', 'desc')) ? $order : 'DESC';

		$query = DB::select()
			->select_array($user_columns)
			->from('users')
			->offset($offset)
			->limit($limit)
			->order_by($sort, $order);

		$filter_map = array(
			array('name', 'LIKE', 'name'),
			array('age',  '=',    'age'),
		);

		foreach ($filter_map as $filter)
		{
			$filter[2] = arr::get($filters, $filter[2]);
			if ($filter[2] == NULL) continue;

			if ($filter[1] == 'LIKE')
			{
				$filter[2] = '%'.$filter[2].'%';
			}

			// Power search => user name OR full name
			if ($filter[0] == 'name')
			{
				$query
					->and_where_open()
						->or_where('username',  'LIKE', $filter[2])
						->or_where('full_name', 'LIKE', $filter[2])
					->and_where_close();
			}
			else
			{
				$query->and_where($filter[0], $filter[1], $filter[2]);
			}
		}

		$total = clone $query;
		$total->select(array(DB::expr('COUNT(1)'), 'total'));

		$result = $query->execute()->as_array('id');

		return array(
			(int) $total->execute()->get('total', 0),
			array_values($result)
		);
	}

} // End Model_User