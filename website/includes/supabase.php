<?php
require_once __DIR__ . '/config.php';

class SupabaseClient {
    private $url;
    private $apiKey;
    
    public function __construct() {
        $this->url = SUPABASE_URL;
        $this->apiKey = SUPABASE_ANON_KEY;
    }
    
    /**
     * Make a request to Supabase REST API
     */
    private function request($method, $endpoint, $data = null, $authToken = null) {
        $url = $this->url . '/rest/v1/' . $endpoint;
        
        $headers = [
            'apikey: ' . $this->apiKey,
            'Content-Type: application/json',
            'Prefer: return=representation'
        ];
        
        if ($authToken) {
            $headers[] = 'Authorization: Bearer ' . $authToken;
        }
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        
        if ($data !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 400) {
            return ['error' => true, 'message' => 'Request failed', 'code' => $httpCode];
        }
        
        return json_decode($response, true);
    }
    
    /**
     * Select data from a table
     */
    public function select($table, $columns = '*', $filters = []) {
        $endpoint = $table . '?select=' . $columns;
        
        foreach ($filters as $key => $value) {
            $endpoint .= '&' . $key . '=eq.' . urlencode($value);
        }
        
        return $this->request('GET', $endpoint);
    }
    
    /**
     * Insert data into a table
     */
    public function insert($table, $data) {
        return $this->request('POST', $table, $data);
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
     * Authenticate with email and password
     */
    public function signIn($email, $password) {
        $url = $this->url . '/auth/v1/token?grant_type=password';
        
        $headers = [
            'apikey: ' . $this->apiKey,
            'Content-Type: application/json'
        ];
        
        $data = [
            'email' => $email,
            'password' => $password
        ];
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        $result = json_decode($response, true);
        
        if ($httpCode >= 400) {
            // Return detailed error information from Supabase
            return [
                'error' => [
                    'message' => $result['error_description'] ?? $result['msg'] ?? 'Authentication failed',
                    'code' => $result['error'] ?? $result['code'] ?? 'auth_error'
                ]
            ];
        }
        
        return $result;
    }
    
    /**
     * Get user from access token
     */
    public function getUser($accessToken) {
        $url = $this->url . '/auth/v1/user';
        
        $headers = [
            'apikey: ' . $this->apiKey,
            'Authorization: Bearer ' . $accessToken
        ];
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 400) {
            return ['error' => true, 'message' => 'Invalid token'];
        }
        
        return json_decode($response, true);
    }
}

// Create global instance
$supabase = new SupabaseClient();
