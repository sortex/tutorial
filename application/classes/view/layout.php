<?php defined('SYSPATH') or die('No direct script access.');

class View_Layout extends Kostache_Layout {

	protected $_partials = array(
		'notices' => '_elements/notices',
	);

	public function base_url()
	{
		return Kohana::$base_url;
	}

	/**
	 * Collects all notices
	 *
	 * @uses   Notices
	 * @return array
	 */
	public function notices()
	{
		$data = array();

		foreach (Notices::get() as $types)
		{
			foreach ($types as $array)
			{
				$data[] = array
				(
					'type'    => $array['type'],
					'message' => __($array['key'], $array['values']),
				);
			}
		}

		return $data;
	}

	/**
	 * Var method to return an array of routes. Subviews should extend this,
	 * call parent::routes() and add their own to it.
	 *
	 * @return array
	 */
	public function routes()
	{
		return array(
			'user_form'  => Route::url('default', array('controller' => 'user', 'action' => 'form')),
			'user_index' => Route::url('default', array('controller' => 'user')),
			'user_job'   => Route::url('default', array('controller' => 'jobs', 'action' => 'index')),
			'job_form'   => Route::url('default', array('controller' => 'jobs', 'action' => 'form')),
		);
	}

} // End View_Layout