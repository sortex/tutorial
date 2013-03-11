<?php defined('SYSPATH') or die('No direct script access.');

class Controller_Jobs extends Controller_Site {

	public function action_index()
	{
		$this->view->user_id = $this->request->param('id');
		$this->view->username = $this->request->query('username');
	}

	public function action_form()
	{
		$job_id  = $this->request->param('id');
		$user_id = $this->request->query('user_id');

		$user = new Model_User($user_id);
		$this->view->username = $user->username;
		$this->view->user_id = $user_id;

		$post = $this->request->post();

		if ($post)
		{
			try
			{
				// Load job by ID
				$job = new Model_Job($job_id);

				// Set values for POST
				$job->values($post, array('title', 'money_per_hour'));
				$job->user_id = $user_id;

				// Save job
				$job = $job->save();

				// Success message
				Notices::add('success', 'Well done! '.($job_id ? 'updated' : 'created').' successfuly!');

				$this->request->redirect('jobs/form/'.$job->id.'?user_id='.$user_id.'&username='.$user->username);
			}
			catch (ORM_Validation_Exception $e)
			{
				Notices::add('error', $e->errors(''));
			}
		}
		else
		{
			if ($job_id)
			{
				$job = new Model_Job($job_id);
				$post = $job->as_array();
			}
		}

		$this->view->job = $post;
	}
}