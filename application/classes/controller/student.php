<?php defined('SYSPATH') or die('No direct script access.');

class Controller_Student extends Controller_Site {

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
				// Load student by ID
				$student = new Model_Student($id);

				// Set values for POST
				$student->values($post, array('first_name', 'last_name', 'course', 'grade'));

				// Save student
				$student = $student->save();

				// Success message
				Notices::add('success', 'Good job! Student '.($id ? 'updated' : 'created').' successfuly!');

				$this->request->redirect('student/form/'.$student->id);
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
				$student = new Model_Student($id);
				$post = $student->as_array();
			}
		}

		$this->view->student = $post;
	}

	public function action_ex()
	{
		try
		{
			$a = $b;
		}
		catch (Exception_System $e)
		{
			echo 'system'.debug::vars($e);
		}
		catch (Exception_Logical $e) // logical extends from runtime
		{
			echo 'logik'.debug::vars($e);
		}
		catch (Exception_Runtime $e)
		{
			echo debug::vars($e);
		}
		catch (Kohana_Exception $e)
		{
			echo 'k'.debug::vars($e);
		}
		catch (Exception $e)
		{
			echo 'a'.debug::vars($e);
		}
	}

} // End Controller_Students
