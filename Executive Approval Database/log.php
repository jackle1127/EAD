<?php
	$pattern = '/[\,"]/';
	
	$firstName = preg_replace($pattern, '', $_POST["firstName"]);
	$lastName = preg_replace($pattern, '', $_POST["lastName"]);
	$email = preg_replace($pattern, '', $_POST["email"]);
	$affiliation = preg_replace($pattern, '', $_POST["affiliation"]);
	$type = preg_replace($pattern, '', $_POST["type"]);
	$country = preg_replace($pattern, '', $_POST["country"]);
	$timeStamp = date('m/d/Y');
	if (!file_exists("log.csv")) {
		file_put_contents("log.csv", "First Name,Last Name,Email,Affilation,Downloaded,Country,Time\n");
	}
	$row = "$firstName,$lastName,$email,$affiliation,$type,$country,$timeStamp\n";
	echo $row;
	file_put_contents("log.csv", $row, FILE_APPEND);
?>
