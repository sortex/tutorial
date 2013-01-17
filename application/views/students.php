<style>
	#students table td, #students table th { border: 1px solid #000000 }
</style>
<div id="students">
	<h2>Students</h2>
	<table>
		<colgroup>
			<col width="4%" />
			<col />
			<col width="15%" />
			<col width="15%" />
			<col width="15%" />
		</colgroup>
		<thead>
			<tr>
				<th>ID</th>
				<th>First name</th>
				<th>Last name</th>
				<th>Course</th>
				<th>Grade</th>
			</tr>
		</thead>
		<tbody>
			<?php foreach($students as $student):?>
				<tr>
					<td><?php echo $student->id ?></td>
					<td><?php echo $student->first_name ?></td>
					<td><?php echo $student->last_name ?></td>
					<td><?php echo $student->course ?></td>
					<td><?php echo $student->grade ?></td>
					<td><a href="<?php URL::site('students/form/'.$student->id);?>">Edit</a></td>
				</tr>
			<?php endforeach?>
		</tbody>
	</table>
</div>
