CREATE TABLE `users` (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(255) NOT NULL,
  `age` INT(4) DEFAULT NULL,
  `full_name` VARCHAR(255) DEFAULT NULL,
  `created` INT(11) NOT NULL,
  `modified` INT(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=INNODB;


CREATE TABLE `jobs` (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL DEFAULT '',
  `money_per_hour` INT(11) UNSIGNED NOT NULL DEFAULT '0',
  `user_id` INT(11) NOT NULL,
  `created` INT(11) NOT NULL,
  `modified` INT(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=INNODB;


CREATE TABLE `workdays` (
  `job_id` INT(11) NOT NULL AUTO_INCREMENT,
  `start_time` INT(11) NOT NULL,
  `end_time` INT(11) NOT NULL,
  `created` INT(11) NOT NULL,
  `modified` INT(11) NOT NULL,
  PRIMARY KEY (`job_id`)
) ENGINE=INNODB;
