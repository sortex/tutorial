<?php defined('SYSPATH') or die('No direct script access.');

class Controller_User extends Controller_Site {

	public function action_index()
	{
		// Get all users
		$users = Model_User::get_users();
		$this->view->users = $users;
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

	public function action_delete()
	{
		try
		{
			$user = new Model_User($this->request->param('id'));

			if ( ! $user->loaded())
				throw new Kohana_Exception('User Not Found!');

			$user->delete();
		}
		catch (Kohana_Exception $e)
		{
			$errors = $e->getMessage();
		}

		$response = array(
			'success' => isset($errors) ? 0 : 1,
			'errors'  => isset($errors) ? $errors : array(),
		);

		$this->response->headers('Content-Type', 'text/json');
		$this->view = json_encode($response);

	}

	public function action_get_users()
	{
		// Extract model filters keys/values from query string
		$filters = arr::extract($this->request->query(), array(
				'username', 'full_name', 'age'
			));
		try
		{
			list($total, $results) =
				Model_User::get_page(
					$filters,
					$this->request->query('sort'),
					$this->request->query('order'),
					(int) $this->request->query('offset'),
					(int) $this->request->query('limit') ?: 50
			);
		}
		catch (Kohana_Exception $e)
		{
			$errors = $e->getMessage();
		}

		$response = array(
			'metadata' => array(
				'error' => isset($errors) ? $errors : FALSE,
				'total' => isset($total) ? $total : 0,
			),
			'payload'  => isset($results) ? $results : array(),
		);

		$this->response->headers('Content-Type', 'application/json');
		$this->view = json_encode($response);
	}

} // End Controller_User