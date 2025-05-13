<?php
// Database configuration for Study Group Finder
$config = [
    'host' => 'localhost',          
    'dbname' => 'study_group_db',  
    'username' => 'root',          
    'password' => '',               
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, 
        PDO::ATTR_EMULATE_PREPARES => false, 
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
        PDO::ATTR_PERSISTENT => true 
    ]
];