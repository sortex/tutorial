<?php defined('SYSPATH') or die('No direct script access.');

class Controller_Site extends Controller {

	/**
	 * @var View_Layout object the content View object
	 */
	public $view;

	/**
	 * Loads view automatically
	 *
	 * @return void
	 */
	public function before()
	{
		parent::before();

		// Initialize notices
		PHP_SAPI === 'cli' OR Notices::init();

		// Automatically load view and assets
		$directory = Request::current()->directory() ? Request::current()->directory().'_' : '';
		$view_name = 'View_'.$directory.Request::current()->controller().'_'.Request::current()->action();
		if (Kohana::find_file('classes', strtolower(str_replace('_', '/', $view_name))))
		{
			$this->view = new $view_name;
		}
	}

	/**
	 * Loads $this->view into response body, also handles profiler
	 *
	 * @throws Kohana_View_Exception
	 * @return void
	 */
	public function after()
	{
		if (isset($this->view))
		{
			if ($this->request->is_ajax() AND is_object($this->view))
			{
				$this->view->render_layout = FALSE;
			}

			// Render view
			$output = (string) $this->view;

			// Serve response body
			$this->response->body($output);
		}
		else
		{
			// Controller did not set a view
			throw new Kohana_View_Exception('Unable to load view class (pattern: View_Directory_Controller_Action)');
		}
	}

} // End Controller_Site