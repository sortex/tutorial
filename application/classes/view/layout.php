<?php defined('SYSPATH') or die('No direct script access.');

class View_Layout extends Kostache_Layout {

	public $show_profiler = FALSE;
	public function profiler()
	{
		return View::factory('profiler/stats')->render();
	}

	protected $_partials = array(
		'notices' => '_elements/notices',
	);

	public function base_url()
	{
		return Kohana::$base_url;
	}

	/**
	 * @var Assets object to add css/js groups to
	 */
	protected $_assets;

	/**
	 * Gets or sets the Assets object in the view
	 *
	 * @param  Object  $assets  the Assets object
	 * @return self
	 */
	public function assets($assets)
	{
		$this->_assets = $assets;
		$assets->group('default');
		return $this;
	}

	/**
	 * Overloads render to handle assets head and body
	 *
	 * @return string
	 */
	public function render()
	{
		$content = parent::render();

		return str_replace(
			array(
				'[[assets_head]]',
				'[[assets_body]]'
			),
			array(
				$this->assets_head(),
				$this->assets_body()
			),
			$content
		);
	}

	/**
	 * Gets assets group for 'head'
	 *
	 * @return string
	 */
	public function assets_head()
	{
		if ( ! $this->_assets)
			return '';

		$assets = '';
		foreach ($this->_assets->get('head') as $asset)
		{
			$assets .= $asset."\n";
		}

		return $assets;
	}

	/**
	 * Gets assets group for 'body'
	 *
	 * @return string
	 */
	public function assets_body()
	{
		if ( ! $this->_assets)
			return '';

		$route_name = Route::name(Request::$current->route());
		$controller = Request::$current->controller();
		$action = Request::$current->action();

		$url_base = URL::base();
		$environment = Kohana::$environment;

		$assets = <<<HTML
			<script type="text/javascript">
				try {
					var App = {};
					App.base = '$url_base';
					App.environment = '$environment';
					App.route = { route: '$route_name', controller: '$controller', action: '$action' };

				} catch(e) {
					alert('Error loading app.js');
					console.log(e);
				}
			</script>
HTML;

		foreach ($this->_assets->get('body') as $asset)
		{
			$assets .= $asset."\n";
		}

//		$assets .= "\n".'<script type="text/javascript">'.Element::script().'</script>';

		return $assets;
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