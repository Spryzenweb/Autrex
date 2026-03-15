<?php

/*

İFrame ödeme yönteminde ödeme işlemi için sipariş  iframe popup açılır ve müşteri ödemesini yaptıktan sonra
ödeme başarılı ise success.php hatalı ise fail.php dosyasına GET ile yönlendirilir.

Ödeme sonrası yönlendirme işlemi gerçekleşmeden önce callback.php dosyasına ödeme bilgisi
POST ile gönderilir.

 */

$orderID = time();

$posts = [
    "hash" => "******************", // Mağaza API Hash
    "order_id" => time()."PAYHESAP".$orderID, // Kendi yazılımınızdaki sipariş numarası
    "callback_url" => "https://site-adresi.com/callback.php", //İşlem durumu hakkında bilgiler ve Payhesap üzerinden ödeme sorgulama aşaması
    "amount" => "1", // İşlem tutarı
    "installment" => "1", // Taksit sayısı
    "success_url" => "https://site-adresi.com/success.php", //Ödeme başarılı ise sayfa buraya yönlencek
    "fail_url" => "https://site-adresi.com/fail.php",  //Ödeme başarısız ise sayfa buraya yönlencek
    "name" => "Onur Samancı", // Ödeme yapan müşteri bilgisi
    "email" => "test@payhesap.com", // Ödeme yapan müşteri bilgisi
    "phone" => "123123123", // Ödeme yapan müşteri bilgisi
    "city" => "İstanbul", // Ödeme yapan müşteri bilgisi
    "state" => "Şişli", // Ödeme yapan müşteri bilgisi
    "address" => "Test işlem adres", // Ödeme yapan müşteri bilgisi
    "ip" => $_SERVER['REMOTE_ADDR']
];

$encode = json_encode($posts, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

$ch = curl_init('https://www.payhesap.com/api/iframe/pay');
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($ch, CURLOPT_POSTFIELDS, $encode);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Content-Length: ' . strlen($encode)
    ]
);
$result = curl_exec($ch);

$decode = json_decode($result, true);

if(isset($decode['data']['token'])){ ?>

    <script src="https://www.payhesap.com/iframe/iframeResizer.min.js"></script>
    <iframe src="https://payhesap.com/api/iframe/<?=$decode['data']['token'];?>" id="payhesapiframe" frameborder="0" scrolling="yes" style="width: 100%;"></iframe>
    <script>iFrameResize({},'#payhesapiframe');</script>

    <?php

}else{
    echo '<pre>';
    print_r($decode); // Bir sorun var mesajlar burada
}

