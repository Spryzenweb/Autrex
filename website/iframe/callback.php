<?php
if(isset($_POST['STATUS'])){

    $orderID = $_POST['ORDER_REF_NUMBER'];
    $hash = $_POST['HASH'];

    $ch = curl_init('https://www.payhesap.com/api/pay/checkOrder');
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_POSTFIELDS, array('hash' => $hash));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);;
    $result = json_decode(curl_exec($ch),true);

    //$orderID ile siparişinizn işlemlerini yapabilirsiniz
    /*

    Burada kendi sitenizde sipariş ile ilgili işlemleri yaptırabilirsiniz, mail gönderme
    veritabanı, fatura işlemleri.

    $result verisi
    {
    "status": true,
    "statusID": 1,
    "msg": "Ödendi",
    "return_message": "SUCCESS",
    "data": {
        "hash": "******************************",
        "merchant_oid": "16244357003028",
        "payment_type": "card",
        "total_amount": "120.00",
        "payment_amount": "114.00",
        "currency": "TRY",
        "installment": 1
    },
    "merchant_id": *****,
    "private_hash": "********"
    }


    */
    if($result['statusID'] == 1 ){
        /*
        Ödeme Başarılı veritabanı işlemleri
        */
    }else{
        /*
       Ödeme Başarısız veritabanı işlemleri
       */
    }

}
