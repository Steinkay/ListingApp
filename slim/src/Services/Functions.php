<?php

namespace App\Services;

use Illuminate\Database\Capsule\Manager as Capsule;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

class Functions
{
    public function checkIfUserExists($email)
    {
        try {
            // Check if the user with the provided email exists in the database
            $user = Capsule::table('siteuser')->where('Email', $email)->first();
            return $user !== null;
        } catch (\Exception $e) {
            // Log or handle the exception
            return false;
        }
    }
    public function generateResetToken()
    {
        // Generate a random reset token (you can use a library or create your own logic)
        return bin2hex(random_bytes(32));
    }

    public function saveResetToken($email, $token)
     {
    try {
        // Save the reset token for the user in the database (update the user record)
        $result = Capsule::table('siteuser')
            ->where('Email', $email)
            ->update(['PasswordResetToken' => $token]);

        return $result !== false;
    } catch (\Exception $e) {
        // Log or handle the exception
        return false;
    }
}

public function sendResetEmail($email, $token)
{
    try {
        $subject = 'Password Reset';
        $message = 'Click link to reset password: http://localhost:3000/reset?token=' . $token;

        $mail = new PHPMailer(true);

        // Server settings for Mailtrap
        $mail->isSMTP();
        $mail->Host       = 'sandbox.smtp.mailtrap.io';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'f5bc3ad6ba95a8';
        $mail->Password   = '5d4446e328ee93';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // Recipients
        $mail->setFrom('steinkay354@gmail.com', 'ListingApp.com');
        $mail->addAddress($email);

        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $message;

        $mail->send();

        return true;
    } catch (Exception $e) {
        // Log or handle the exception
        return false;
    }
}


}