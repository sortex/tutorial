<?php defined('SYSPATH') or die('No direct script access.');

class View_Jobs_Index extends View_Layout {

	public $title = 'Jobs';

	public $username;

	public $user_id;

	public function assets($assets)
	{
		$assets->group('jobs');
		return parent::assets($assets);
	}

	public function jobs()
	{
		$jobs =  Model_Job::get_job_by($this->user_id);

		foreach ($jobs as & $job)
		{
			$job['created']  = $job['created']  ? date('d/m/Y H:i', $job['created'])  : '--';
			$job['modified'] = $job['modified'] ? date('d/m/Y H:i', $job['modified']) : '--';
		}
		unset ($job);
		return $jobs;
	}

} // End View_Jobs_Index