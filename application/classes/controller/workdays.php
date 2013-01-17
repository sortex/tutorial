<?php defined('SYSPATH') or die('No direct script access.');

class Controller_Workdays extends Controller_Site {

	private $month;
	private $year;

	public function before()
	{
		parent::before();

		$this->month = $this->view->month = $this->request->param('month') ?: date('m');
		$this->year  = $this->view->year  = $this->request->param('year')  ?: date('Y');
	}

	public function action_edit()
	{
	}

	public function action_view()
	{
	}

} // End Controller_Workdays