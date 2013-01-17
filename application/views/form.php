<div>
	<h2>Form for adding users</h2>
	<br>
	<form action="" method="POST">
		<fieldset>
			<?php if ($user): ?>
			<legend>Edit user:</legend>
				Name:<br>
				<input type="text" name="name" value="<?php echo $user['name']?>"><br/>
				Course:<br>
				<input type="text" name="course" value="<?php echo $user['course']?>"><br>
				E-mail:<br>
				<input type="text" name="email" value="<?php echo $user['email']?>"><br>
				Website:<br>
				<input type="text" name="website" value="<?php echo $user['website']?>"><br>
				Phone:<br>
				<input type="text" name="phone" value="<?php echo $user['phone']?>"><br>
				Age:<br>
				<input type="text" name="age" value="<?php echo $user['age']?>"><br>
				<input type="submit" name="sub" value="Update">
			<?php else:?>
				<legend>Add user:</legend>
				Name:<br>
				<input type="text" name="name"><br/>
				Course:<br>
				<input type="text" name="course"><br>
                E-mail:<br>
				<input type="text" name="email"><br>
				Website:<br>
				<input type="text" name="website"><br>
				Phone:<br>
				<input type="text" name="phone"><br>
				Age:<br>
				<input type="text" name="age"><br>
				<input type="submit" name="sub" value="Insert">
			<?php endif?>
		</fieldset>
	</form>
</div>