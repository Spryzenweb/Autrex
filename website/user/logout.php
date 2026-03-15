<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

logout();
setFlash('success', 'Başarıyla çıkış yaptınız');
redirect('/user-login.php');
