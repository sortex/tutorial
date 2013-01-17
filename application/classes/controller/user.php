<?php defined('SYSPATH') or die('No direct script access.');

class Controller_User extends Controller_Site {

	public function action_index()
	{

	}

	public function action_form()
	{
		$id = $this->request->param('id');

		$post = $this->request->post();

		if ($post)
		{
			try
			{
				// Load user by id
				$user = new Model_User($id);

				$user->values($post, array('username', 'full_name', 'age'));

				$user = $user->save();

				Notices::add('success','Good! User '.($id ? 'updated' : 'created').' successfuly');

				$this->request->redirect('user/form/'.$user->id);
			}
			catch (ORM_Validation_Exception $e)
			{
				Notices::add('error', $e->errors(''));
			}
		}
		else
		{
			if ($id)
			{
				$user = new Model_User($id);
				$post = $user->as_array();
			}
		}

		$this->view->user = $post;
	}
} // End Controller_User