<?php
require_once __DIR__ . '/config.php';

/**
 * Supabase Admin Client
 * Uses service role key to bypass RLS for admin operations
 */
class SupabaseAdminClient {
    private $url;
    private $serviceKey;
    
    public function __construct() {
        $this->url = SUPABASE_URL;
        // Try service role key first, fallback to anon key
        $this->serviceKey = SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_ANON_KEY;
        
        // If using anon key, try to get user token from session
        if ($this->serviceKey === SUPABASE_ANON_KEY && isset($_SESSION['access_token'])) {
            $this->serviceKey = $_SESSION['access_token'];
        }
    }
    
    /**
     * Get current UTC timestamp in ISO 8601 format
     */
    private function getUtcTimestamp() {
        return gmdate('Y-m-d\TH:i:s\Z');
    }
    
    /**
     * Get UTC timestamp with offset in seconds
     */
    private function getUtcTimestampWithOffset($seconds) {
        return gmdate('Y-m-d\TH:i:s\Z', time() + $seconds);
    }
    
    /**
     * Make a request to Supabase REST API with service role
     */
    private function request($method, $endpoint, $data = null) {
        $url = $this->url . '/rest/v1/' . $endpoint;
        
        $headers = [
            'apikey: ' . $this->serviceKey,
            'Authorization: Bearer ' . $this->serviceKey,
            'Content-Type: application/json',
            'Prefer: return=representation'
        ];
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        
        if ($data !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            error_log("Supabase Admin Error: " . $error);
            return ['error' => true, 'message' => $error];
        }
        
        if ($httpCode >= 400) {
            error_log("Supabase Admin HTTP Error: " . $httpCode . " - " . $response);
            return ['error' => true, 'message' => 'Request failed', 'code' => $httpCode, 'response' => $response];
        }
        
        $decoded = json_decode($response, true);
        return $decoded !== null ? $decoded : [];
    }
    
    /**
     * Select data from a table
     */
    public function select($table, $columns = '*', $filters = [], $orderBy = null, $limit = null) {
        $endpoint = $table . '?select=' . $columns;
        
        foreach ($filters as $key => $value) {
            if (is_array($value)) {
                // Handle array filters (e.g., IN queries)
                $endpoint .= '&' . $key . '=in.(' . implode(',', array_map('urlencode', $value)) . ')';
            } else {
                $endpoint .= '&' . $key . '=eq.' . urlencode($value);
            }
        }
        
        if ($orderBy) {
            $endpoint .= '&order=' . $orderBy;
        }
        
        if ($limit) {
            $endpoint .= '&limit=' . $limit;
        }
        
        return $this->request('GET', $endpoint);
    }
    
    /**
     * Count records in a table
     */
    public function count($table, $filters = []) {
        $endpoint = $table . '?select=count';
        
        foreach ($filters as $key => $value) {
            $endpoint .= '&' . $key . '=eq.' . urlencode($value);
        }
        
        $result = $this->request('HEAD', $endpoint);
        return is_array($result) ? count($result) : 0;
    }
    
    /**
     * Insert data into a table
     */
    public function insert($table, $data) {
        $result = $this->request('POST', $table, $data);
        
        // If single insert, return first item
        if (is_array($result) && !isset($result['error']) && count($result) > 0) {
            return $result[0];
        }
        
        return $result;
    }
    
    /**
     * Update data in a table
     */
    public function update($table, $data, $filters = []) {
        $endpoint = $table;
        $first = true;
        
        foreach ($filters as $key => $value) {
            $endpoint .= ($first ? '?' : '&') . $key . '=eq.' . urlencode($value);
            $first = false;
        }
        
        return $this->request('PATCH', $endpoint, $data);
    }
    
    /**
     * Delete data from a table
     */
    public function delete($table, $filters = []) {
        $endpoint = $table;
        $first = true;
        
        foreach ($filters as $key => $value) {
            $endpoint .= ($first ? '?' : '&') . $key . '=eq.' . urlencode($value);
            $first = false;
        }
        
        return $this->request('DELETE', $endpoint);
    }
    
    /**
     * Get all users from auth.users (admin only)
     */
    public function getAuthUsers() {
        $url = $this->url . '/auth/v1/admin/users';
        
        $headers = [
            'apikey: ' . $this->serviceKey,
            'Authorization: Bearer ' . $this->serviceKey,
            'Content-Type: application/json'
        ];
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 400) {
            error_log("Get Auth Users Error: " . $httpCode . " - " . $response);
            return [];
        }
        
        $decoded = json_decode($response, true);
        return $decoded['users'] ?? [];
    }
    
    /**
     * Create a new license with auto-generated key
     * Uygulama ile uyumlu: created_at otomatik, activated_at ve expires_at null
     */
    public function createLicense($type, $maxActivations = 1, $notes = null) {
        // Type'ı BÜYÜK HARFE çevir
        $type = strtoupper($type);
        
        // Generate license key with proper format and checksum
        $licenseKey = $this->generateLicenseKey($type);
        
        // Gerçek Supabase kolon isimleri
        // created_at: Supabase otomatik set eder (default: now())
        // activated_at: null - uygulama ilk aktivasyonda set eder
        // expires_at: null - uygulama aktivasyonda hesaplayıp set eder
        $data = [
            'key' => $licenseKey,
            'type' => $type,
            'is_active' => true,  // Yeni lisanslar aktif
            'activation_count' => 0,
            'activated_at' => null,  // Uygulama set edecek
            'expires_at' => null,  // Uygulama set edecek
            'metadata' => json_encode([
                'notes' => $notes,
                'max_activations' => $maxActivations,
                'duration_hours' => $this->getDurationHours($type)
            ])
        ];
        
        return $this->insert('licenses', $data);
    }
    
    /**
     * Generate a license key with proper format and checksum
     * Format: XXXX-XXXX-XXXX-XXXX
     * Part 1: Product Code (AUTR, AUTD, AUTW, AUTM, AUTT)
     * Part 2-3: Unique ID (8 chars)
     * Part 4: MD5 Checksum (4 chars)
     */
    private function generateLicenseKey($type = 'TRIAL') {
        // Product code mapping
        $productCodes = [
            'REGULAR' => 'AUTR',
            'DAILY' => 'AUTD',
            'WEEKLY' => 'AUTW',
            'MONTHLY' => 'AUTM',
            'TRIAL' => 'AUTT'
        ];
        
        $productCode = $productCodes[$type] ?? 'AUTT';
        
        // Generate unique ID (8 characters)
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $uniqueId = '';
        for ($i = 0; $i < 8; $i++) {
            $uniqueId .= $chars[rand(0, strlen($chars) - 1)];
        }
        
        // Calculate checksum (MD5 first 4 chars)
        $data = $productCode . $uniqueId;
        $checksum = strtoupper(substr(md5($data), 0, 4));
        
        // Format: XXXX-XXXX-XXXX-XXXX
        $part1 = $productCode;
        $part2 = substr($uniqueId, 0, 4);
        $part3 = substr($uniqueId, 4, 4);
        $part4 = $checksum;
        
        return "$part1-$part2-$part3-$part4";
    }
    
    /**
     * Get duration hours for license type
     */
    private function getDurationHours($type) {
        switch ($type) {
            case 'TRIAL': return 6;  // 6 saat
            case 'DAILY': return 24;
            case 'WEEKLY': return 168; // 7 days
            case 'MONTHLY': return 720; // 30 days
            case 'REGULAR': return null; // Unlimited
            default: return 6;
        }
    }
    
    /**
     * Assign license to user
     */
    public function assignLicenseToUser($licenseId, $userId) {
        // Check if license is already assigned
        $existing = $this->select('user_licenses', '*', ['license_id' => $licenseId]);
        if (!empty($existing) && !isset($existing['error'])) {
            return ['error' => true, 'message' => 'Bu lisans zaten bir kullanıcıya atanmış'];
        }
        
        // Assign license
        $result = $this->insert('user_licenses', [
            'user_id' => $userId,
            'license_id' => $licenseId,
            'purchased_at' => $this->getUtcTimestamp()
        ]);
        
        return $result;
    }
    
    /**
     * Get user's licenses
     */
    public function getUserLicenses($userId) {
        // Get user_licenses with license details
        $userLicenses = $this->select('user_licenses', '*', ['user_id' => $userId]);
        
        if (empty($userLicenses) || isset($userLicenses['error'])) {
            return [];
        }
        
        $licenses = [];
        foreach ($userLicenses as $ul) {
            $license = $this->select('licenses', '*', ['id' => $ul['license_id']]);
            if (!empty($license) && !isset($license['error'])) {
                $licenses[] = is_array($license[0]) ? $license[0] : $license;
            }
        }
        
        return $licenses;
    }
    
    /**
     * Get license owner
     */
    public function getLicenseOwner($licenseId) {
        $userLicense = $this->select('user_licenses', '*', ['license_id' => $licenseId]);
        
        if (empty($userLicense) || isset($userLicense['error'])) {
            return null;
        }
        
        $userId = is_array($userLicense[0]) ? $userLicense[0]['user_id'] : $userLicense['user_id'];
        $users = $this->getAuthUsers();
        
        foreach ($users as $user) {
            if ($user['id'] === $userId) {
                return $user;
            }
        }
        
        return null;
    }
    
    /**
     * Add time to license
     */
    public function addLicenseTime($licenseId, $hours) {
        // Get current license
        $license = $this->select('licenses', '*', ['id' => $licenseId]);
        if (empty($license) || isset($license['error'])) {
            return ['error' => true, 'message' => 'Lisans bulunamadı'];
        }
        
        $license = is_array($license[0]) ? $license[0] : $license;
        $currentExpires = $license['expires_at'] ?? null;
        
        // Calculate new expiration in UTC
        if ($currentExpires) {
            // Parse existing expiration and add hours
            $currentTimestamp = strtotime($currentExpires);
            $newExpires = gmdate('Y-m-d\TH:i:s\Z', $currentTimestamp + ($hours * 3600));
        } else {
            // Start from now
            $newExpires = $this->getUtcTimestampWithOffset($hours * 3600);
        }
        
        // Update license
        return $this->update('licenses', ['expires_at' => $newExpires], ['id' => $licenseId]);
    }
    
    /**
     * Reset hardware ID
     */
    public function resetHardwareId($licenseId) {
        return $this->update('licenses', ['hardware_id' => null, 'activation_count' => 0], ['id' => $licenseId]);
    }
    
    /**
     * Toggle license status
     */
    public function toggleLicenseStatus($licenseId) {
        // Get current status
        $license = $this->select('licenses', '*', ['id' => $licenseId]);
        if (empty($license) || isset($license['error'])) {
            return ['error' => true, 'message' => 'Lisans bulunamadı'];
        }
        
        $license = is_array($license[0]) ? $license[0] : $license;
        $currentStatus = $license['is_active'] ?? false;
        
        // Toggle status
        return $this->update('licenses', ['is_active' => !$currentStatus], ['id' => $licenseId]);
    }
    
    /**
     * Get user balance
     */
    public function getBalance($userId) {
        $transactions = $this->select('balance_transactions', '*', ['user_id' => $userId]);
        
        if (!is_array($transactions)) {
            return 0;
        }
        
        $balance = 0;
        foreach ($transactions as $transaction) {
            $amount = floatval($transaction['amount'] ?? 0);
            $type = $transaction['type'] ?? '';
            
            if ($type === 'credit') {
                $balance += $amount;
            } elseif ($type === 'debit' || $type === 'purchase') {
                $balance -= $amount;
            }
        }
        
        return $balance;
    }
    
    /**
     * Add balance to user
     */
    public function addBalance($userId, $amount, $description = null) {
        if ($amount <= 0) {
            return ['error' => true, 'message' => 'Tutar pozitif olmalı'];
        }
        
        return $this->insert('balance_transactions', [
            'user_id' => $userId,
            'amount' => $amount,
            'type' => 'credit',
            'description' => $description ?? 'Admin tarafından eklendi'
        ]);
    }
    
    /**
     * Deduct balance from user
     */
    public function deductBalance($userId, $amount, $description = null) {
        if ($amount <= 0) {
            return ['error' => true, 'message' => 'Tutar pozitif olmalı'];
        }
        
        $currentBalance = $this->getBalance($userId);
        if ($currentBalance < $amount) {
            return ['error' => true, 'message' => 'Yetersiz bakiye'];
        }
        
        return $this->insert('balance_transactions', [
            'user_id' => $userId,
            'amount' => $amount,
            'type' => 'debit',
            'description' => $description ?? 'Bakiye düşüldü'
        ]);
    }
    
    /**
     * Get balance history
     */
    public function getBalanceHistory($userId, $limit = 50) {
        $transactions = $this->select('balance_transactions', '*', ['user_id' => $userId], 'created_at.desc', $limit);
        
        if (!is_array($transactions)) {
            return [];
        }
        
        return $transactions;
    }
    
    /**
     * Purchase license with balance
     */
    public function purchaseLicenseWithBalance($userId, $licenseType, $price) {
        // Check balance
        $currentBalance = $this->getBalance($userId);
        if ($currentBalance < $price) {
            return ['error' => true, 'message' => 'Yetersiz bakiye'];
        }
        
        // Create license
        $license = $this->createLicense($licenseType, 1, "Bakiye ile satın alındı");
        if (!$license || isset($license['error'])) {
            return ['error' => true, 'message' => 'Lisans oluşturulamadı'];
        }
        
        $licenseId = $license['id'] ?? null;
        if (!$licenseId) {
            return ['error' => true, 'message' => 'Lisans ID alınamadı'];
        }
        
        // Assign to user
        $assigned = $this->assignLicenseToUser($licenseId, $userId);
        if (!$assigned || isset($assigned['error'])) {
            return ['error' => true, 'message' => 'Lisans atanamadı'];
        }
        
        // Deduct balance
        $deducted = $this->insert('balance_transactions', [
            'user_id' => $userId,
            'amount' => $price,
            'type' => 'purchase',
            'description' => "Lisans satın alındı: {$licenseType}"
        ]);
        
        if (!$deducted || isset($deducted['error'])) {
            return ['error' => true, 'message' => 'Bakiye düşülemedi'];
        }
        
        return [
            'success' => true,
            'license' => $license,
            'remaining_balance' => $this->getBalance($userId)
        ];
    }
    
    /**
     * Get site setting
     */
    public function getSetting($key, $default = null) {
        $setting = $this->select('site_settings', '*', ['key' => $key]);
        
        if (empty($setting) || isset($setting['error'])) {
            return $default;
        }
        
        $value = is_array($setting[0]) ? $setting[0]['value'] : $setting['value'];
        return $value ?? $default;
    }
    
    /**
     * Set site setting
     */
    public function setSetting($key, $value) {
        // Check if setting exists
        $existing = $this->select('site_settings', '*', ['key' => $key]);
        
        if (empty($existing) || isset($existing['error'])) {
            // Insert new
            return $this->insert('site_settings', [
                'key' => $key,
                'value' => $value,
                'updated_at' => $this->getUtcTimestamp()
            ]);
        } else {
            // Update existing
            return $this->update('site_settings', [
                'value' => $value,
                'updated_at' => $this->getUtcTimestamp()
            ], ['key' => $key]);
        }
    }
    
    /**
     * Get all settings
     */
    public function getAllSettings() {
        $settings = $this->select('site_settings', '*', []);
        
        if (!is_array($settings)) {
            return [];
        }
        
        $result = [];
        foreach ($settings as $setting) {
            $key = $setting['key'] ?? null;
            $value = $setting['value'] ?? null;
            if ($key) {
                $result[$key] = $value;
            }
        }
        
        return $result;
    }
    
    /**
     * Ban user (disable account)
     */
    public function banUser($userId) {
        $url = $this->url . '/auth/v1/admin/users/' . $userId;
        
        $headers = [
            'apikey: ' . $this->serviceKey,
            'Authorization: Bearer ' . $this->serviceKey,
            'Content-Type: application/json'
        ];
        
        $data = json_encode(['banned_until' => '2099-12-31T23:59:59Z']);
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 400) {
            error_log("Ban User Error: " . $httpCode . " - " . $response);
            return ['error' => true, 'message' => 'Kullanıcı yasaklanamadı'];
        }
        
        return json_decode($response, true);
    }
    
    /**
     * Unban user (enable account)
     */
    public function unbanUser($userId) {
        $url = $this->url . '/auth/v1/admin/users/' . $userId;
        
        $headers = [
            'apikey: ' . $this->serviceKey,
            'Authorization: Bearer ' . $this->serviceKey,
            'Content-Type: application/json'
        ];
        
        $data = json_encode(['banned_until' => 'none']);
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 400) {
            error_log("Unban User Error: " . $httpCode . " - " . $response);
            return ['error' => true, 'message' => 'Kullanıcı yasağı kaldırılamadı'];
        }
        
        return json_decode($response, true);
    }
    
    /**
     * Confirm user email manually
     */
    public function confirmUserEmail($userId) {
        $url = $this->url . '/auth/v1/admin/users/' . $userId;
        
        $headers = [
            'apikey: ' . $this->serviceKey,
            'Authorization: Bearer ' . $this->serviceKey,
            'Content-Type: application/json'
        ];
        
        $data = json_encode(['email_confirm' => true]);
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 400) {
            error_log("Confirm Email Error: " . $httpCode . " - " . $response);
            return ['error' => true, 'message' => 'Email doğrulanamadı'];
        }
        
        return json_decode($response, true);
    }
    
    /**
     * Send password reset email
     */
    public function sendPasswordReset($email) {
        $url = $this->url . '/auth/v1/recover';
        
        $headers = [
            'apikey: ' . $this->serviceKey,
            'Content-Type: application/json'
        ];
        
        $data = json_encode(['email' => $email]);
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 400) {
            error_log("Password Reset Error: " . $httpCode . " - " . $response);
            return ['error' => true, 'message' => 'Şifre sıfırlama emaili gönderilemedi'];
        }
        
        return ['success' => true];
    }
    
    /**
     * Delete user account
     */
    public function deleteUser($userId) {
        $url = $this->url . '/auth/v1/admin/users/' . $userId;
        
        $headers = [
            'apikey: ' . $this->serviceKey,
            'Authorization: Bearer ' . $this->serviceKey
        ];
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 400) {
            error_log("Delete User Error: " . $httpCode . " - " . $response);
            return ['error' => true, 'message' => 'Kullanıcı silinemedi'];
        }
        
        return ['success' => true];
    }
}

// Create global admin instance
$supabaseAdmin = new SupabaseAdminClient();
