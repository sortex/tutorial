<html>
	<head>
		<title>My first kohana project</title>
        <link rel="stylesheet" type="text/css" href="../media/css/reset.css" />
        <link rel="stylesheet" type="text/css" href="../media/css/formalize.css" />
        <link rel="stylesheet" type="text/css" href="<?php echo Kohana::$base_url.'media/css/notices.css' ?>" />
	</head>
	<body>
		<h1 class="ir">My first kohana project</h1>
		<hr />
		<?php
		// Prepare notices array
		$notices = array();
		foreach (Notices::get() as $types)
		{
			foreach ($types as $array)
			{
				$notices[] = array
				(
					'type'    => $array['type'],
					'message' => __($array['key'], $array['values']),
				);
			}
		}
		?>
        <div id="notices_container">
			<?php foreach ($notices as $notice): ?>
            <div class="notice <?php echo $notice['type'] ?>">
                <div class="notice-content"><?php echo $notice['message'] ?></div>
            </div>
			<?php endforeach ?>
        </div>

		<hr /><br /><br />

		<a href="<?php echo URL::site('users'); ?>">Users table</a> |
		<a href="<?php echo URL::site('users/form'); ?>">Add users</a> |
        <a href="<?php echo URL::site('students'); ?>">Students table</a> |
        <a href="<?php echo URL::site('students/form'); ?>">Add students</a>
		<?php echo $content ?>
	</body>
</html>