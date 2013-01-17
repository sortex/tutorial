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
			<col width="15%" />
			<col width="15%" />
		</colgroup>
		<thead>
			<tr>
				<th>ID</th>
				<th>Name</th>
				<th>Course</th>
				<th>E-mail</th>
				<th>Website</th>
				<th>Phone</th>
				<th>Age</th>
			</tr>
		</thead>
		<tbody>
			<?php foreach($users as $user):?>
				<tr>
					<td><?php echo $user['id']?></td>
					<td><?php echo $user['name']?></td>
					<td><?php echo $user['course']?></td>
					<td><?php echo $user['email']?></td>
					<td><?php echo $user['website']?></td>
					<td><?php echo $user['phone']?></td>
					<td><?php echo $user['age']?></td>
				</tr>
			<?php endforeach?>
		</tbody>
	</table>
</div>
