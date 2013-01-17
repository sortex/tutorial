
<h2>Students form</h2>
<form id="students-form" action="form" method="POST">
	<fieldset>
		<div class="line">
        	First name:<br />
			<input type="text" name="first_name" value="<?php echo arr::get($student, 'first_name', '') ?>" /><br/>
        </div>
        <div class="line">
            Last name:<br>
			<input type="text" name="last_name" value="<?php echo arr::get($student, 'last_name', '') ?>" /><br />
        </div>
        <div class="line">
            Course:<br>
			<input type="text" name="course" value="<?php echo arr::get($student, 'course', '') ?>" /><br />
        </div>
        <div class="line">
            Grade:<br>
			<input type="text" name="grade" value="<?php echo arr::get($student, 'grade', '') ?>" /><br />
        </div>
        <div class="controls">
			<button type="submit" name="sub" >Submit</button>
        </div>
	</fieldset>
</form>