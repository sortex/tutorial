<?php defined('SYSPATH') or die('No direct script access.');

class Controller_Users extends Controller_Template {

	public function action_index()
	{
		$users = Model_User::get_users();

		$this->template->content = View::factory('users', array('users' => $users));
	}

	public function action_form()
	{
		$id = $this->request->param('id');

		$data = array();
		$post = $this->request->post();

		if ($post)
		{
			try
			{
				$post = arr::extract($this->request->post(), array('name', 'course', 'email', 'website', 'phone', 'age'));
				$post = arr::map('trim', $post);

				// Validation of the POST
				$valid = Validation::factory($post)
					->rule('name', 'not_empty')
					->rule('name', 'Controller_Users::valid_character')
					->rule('course', 'not_empty')
					->rule('email', 'not_empty')
					->rule('email', 'email')
					->rule('email', 'min_length', array(':value', '8'))
					->rule('website', 'not_empty')
					->rule('website', 'url')
					->rule('phone', 'not_empty')
					->rule('phone', 'phone')
					->rule('age', 'not_empty')
					->rule('age', 'digit')
					->rule('age', 'max_length', array(':value', '3'));

				if ( ! $valid->check())
					throw new Validation_Exception($valid);

				if ($id)
				{
					// Update user data
					Model_User::update_user($id, $post);
				}
				else
				{
					// Insert user
					$id = Model_User::insert_user($post);
				}

				$this->request->redirect("users/form/$id");
			}
			catch (Validation_Exception $e)
			{
				Notices::add('error', $e->array->errors('myerrors'));
			}

			$data['user'] = $post;
		}
		else
		{
			$data['user'] = Model_User::get_user_param($id);
		}

		$this->template->content = View::factory('form', $data);
	}

	/**
	 * Checking if the first letter is "a"
	 *
	 * @param  string  $str
	 * @return bool
	 */
	public static function valid_character($str)
	{
		return stripos($str, 'a') === 0 ? FALSE : TRUE;
	}

} // End Controller_Users