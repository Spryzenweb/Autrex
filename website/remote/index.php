<?php
require_once '../includes/config.php';
require_once '../includes/supabase.php';

$sessionCode = isset($_GET['code']) ? strtoupper(trim($_GET['code'])) : '';
$error = '';

if ($sessionCode && !preg_match('/^[A-Z0-9]{6}$/', $sessionCode)) {
    $error = "Invalid session code format";
    $sessionCode = '';
}

if ($sessionCode && !$error) {
    try {
        global $supabase;
        $response = $supabase->select('remote_sessions', '*', [
            'session_code' => $sessionCode,
            'is_active' => 'true'
        ]);
        if (!$response || (isset($response['error']) && $response['error']) || empty($response)) {
            $error = "Session not found or expired. Please check your code.";
            $sessionCode = '';
        }
    } catch (Exception $e) {
        error_log("Session validation error: " . $e->getMessage());
        $error = "Failed to validate session. Please try again.";
        $sessionCode = '';
    }
}

$pageTitle = "Autrex Remote Control";
$lang = isset($lang) ? $lang : 'en';
?>
<!DOCTYPE html>
<html lang="<?php echo $lang; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title><?php echo $pageTitle; ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Spiegel:wght@400;700&display=swap" rel="stylesheet">

    <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
            --gold: #c8aa6e;
            --gold-dark: #8b7355;
            --blue: #0bc6e3;
            --red: #e84057;
            --purple: #8b45ff;
            --bg-dark: #010a13;
            --bg-mid: #0a1428;
            --bg-light: #1b2838;
            --text: #f0e6d2;
            --text-muted: #a09b8c;
            --text-dim: #5b5a56;
            --border-gold: rgba(200,170,110,0.3);
            --border-blue: rgba(11,198,227,0.3);
            --border-red: rgba(232,64,87,0.3);
        }

        body {
            font-family: 'Spiegel', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, var(--bg-dark) 0%, var(--bg-mid) 50%, var(--bg-light) 100%);
            min-height: 100vh;
            color: var(--text);
            overflow-x: hidden;
        }

        /* ==================== SESSION INPUT SCREEN ==================== */
        .login-wrap {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .logo-text {
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(135deg, var(--purple) 0%, var(--gold) 50%, var(--purple) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-transform: uppercase;
            letter-spacing: 3px;
            margin-bottom: 8px;
            text-align: center;
        }

        .logo-badge {
            display: inline-block;
            padding: 3px 12px;
            background: rgba(139,69,255,0.2);
            border: 1px solid rgba(139,69,255,0.4);
            border-radius: 12px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--purple);
            margin-bottom: 40px;
        }

        .hero-icon {
            font-size: 64px;
            margin-bottom: 20px;
            animation: floatY 3s ease-in-out infinite;
            text-align: center;
        }

        @keyframes floatY {
            0%,100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }

        .hero-title {
            font-size: 32px;
            font-weight: 700;
            background: linear-gradient(135deg, var(--gold) 0%, var(--purple) 50%, var(--gold) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-transform: uppercase;
            letter-spacing: 3px;
            text-align: center;
            margin-bottom: 10px;
        }

        .hero-sub {
            color: var(--text-muted);
            font-size: 15px;
            text-align: center;
            margin-bottom: 32px;
            max-width: 360px;
        }

        .code-boxes {
            display: flex;
            gap: 8px;
            justify-content: center;
            margin-bottom: 20px;
        }

        .code-box {
            width: 52px;
            height: 64px;
            background: rgba(0,0,0,0.5);
            border: 2px solid var(--border-gold);
            border-radius: 8px;
            font-size: 30px;
            font-weight: 700;
            text-align: center;
            color: var(--text);
            text-transform: uppercase;
            font-family: 'Courier New', monospace;
            transition: all 0.2s ease;
            outline: none;
        }

        .code-box:focus {
            border-color: var(--gold);
            box-shadow: 0 0 18px rgba(200,170,110,0.4);
            background: rgba(0,0,0,0.7);
        }

        .code-box.filled {
            border-color: var(--blue);
            background: rgba(11,198,227,0.08);
        }

        .btn-gold {
            width: 100%;
            max-width: 340px;
            padding: 16px;
            background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
            border: 2px solid #785a28;
            color: var(--bg-dark);
            font-size: 16px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: block;
        }

        .btn-gold:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(200,170,110,0.4); }
        .btn-gold:active { transform: scale(0.97); }
        .btn-gold:disabled { opacity: 0.45; cursor: not-allowed; }

        .btn-purple {
            padding: 12px 24px;
            background: linear-gradient(135deg, var(--purple) 0%, #6b35cc 100%);
            border: none;
            color: #fff;
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .btn-purple:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(139,69,255,0.4); }

        .error-box {
            background: rgba(232,64,87,0.15);
            border: 1px solid var(--red);
            border-radius: 8px;
            padding: 12px 16px;
            color: #ff6b7a;
            font-size: 13px;
            max-width: 340px;
            margin-bottom: 16px;
            text-align: center;
        }

        /* ==================== MAIN REMOTE CONTROL ==================== */
        .rc-wrap {
            max-width: 480px;
            margin: 0 auto;
            padding: 12px 12px 80px;
        }

        .card {
            background: linear-gradient(135deg, rgba(1,10,19,0.95) 0%, rgba(5,15,25,0.95) 100%);
            border: 1px solid var(--border-gold);
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 12px;
            position: relative;
        }

        .card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(200,170,110,0.5), transparent);
        }

        .card-body { padding: 16px; }

        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            background: rgba(0,0,0,0.4);
            border: 1px solid var(--border-gold);
            border-radius: 20px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .dot {
            width: 7px; height: 7px;
            border-radius: 50%;
            animation: dotPulse 2s infinite;
        }

        .dot.on { background: var(--blue); box-shadow: 0 0 8px var(--blue); }
        .dot.off { background: var(--red); box-shadow: 0 0 8px var(--red); }

        @keyframes dotPulse {
            0%,100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(0.85); }
        }

        /* Queue Control */
        .queue-panel { background: linear-gradient(135deg, rgba(1,10,19,0.95), rgba(5,15,25,0.95)); border: 1px solid var(--border-gold); border-radius: 10px; padding: 16px; margin-bottom: 12px; }
        .queue-title { font-size: 14px; font-weight: 700; color: var(--gold); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }

        .queue-options { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
        .q-opt { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-gold); border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .q-opt:has(input:checked) { border-color: var(--blue); background: rgba(11,198,227,0.08); box-shadow: 0 0 10px rgba(11,198,227,0.2); }
        .q-opt input { display: none; }
        .q-opt-label strong { display: block; font-size: 13px; color: var(--text); }
        .q-opt-label small { font-size: 11px; color: var(--text-muted); }

        .queue-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .q-btn { padding: 12px; border-radius: 8px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; border: none; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .q-btn-start { background: linear-gradient(135deg, var(--blue), #0397ab); color: #fff; }
        .q-btn-stop { background: linear-gradient(135deg, var(--red), #c41e3a); color: #fff; }
        .q-btn:not(:disabled):hover { transform: translateY(-2px); }
        .q-btn:active:not(:disabled) { transform: scale(0.97); }
        .q-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .queue-searching { display: flex; align-items: center; gap: 10px; padding: 12px; background: rgba(11,198,227,0.08); border: 1px solid rgba(11,198,227,0.3); border-radius: 8px; margin-top: 10px; }
        .spin { animation: spin 1.5s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* Position Selection */
        .pos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .pos-select { width: 100%; padding: 10px 32px 10px 12px; background: rgba(0,0,0,0.4); border: 1.5px solid var(--border-gold); border-radius: 6px; color: var(--text); font-size: 13px; font-weight: 600; cursor: pointer; -webkit-appearance: none; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23c8aa6e' d='M6 9L1 4h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; }
        .pos-select:focus { outline: none; border-color: var(--gold); }
        .pos-select option { background: var(--bg-mid); }

        /* Toast messages */
        .toast {
            position: fixed;
            top: 20px; left: 50%;
            transform: translateX(-50%) translateY(-60px);
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            z-index: 99999;
            transition: transform 0.3s ease;
            white-space: nowrap;
            pointer-events: none;
        }

        .toast.show { transform: translateX(-50%) translateY(0); }
        .toast-success { background: rgba(11,198,227,0.95); color: #001a20; border: 1px solid var(--blue); }
        .toast-error { background: rgba(232,64,87,0.95); color: #fff; border: 1px solid var(--red); }

        /* ==================== CHAMPION SELECT FULLSCREEN ==================== */
        #csLayout {
            position: fixed;
            inset: 0;
            background: linear-gradient(160deg, #020c16 0%, #091222 50%, #0d1a28 100%);
            z-index: 2000;
            display: none;
            flex-direction: column;
        }

        #csLayout.visible { display: flex; }

        /* Top bar */
        .cs-topbar {
            flex-shrink: 0;
            background: rgba(0,0,0,0.85);
            border-bottom: 1px solid rgba(200,170,110,0.2);
            padding: 8px 14px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .cs-phase-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .cs-phase-label {
            font-size: 9px;
            color: var(--text-dim);
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 2px;
        }

        .cs-phase-text {
            font-size: 15px;
            font-weight: 700;
            color: var(--gold);
        }

        .cs-timer {
            font-size: 30px;
            font-weight: 700;
            color: #f0ad4e;
            font-family: 'Courier New', monospace;
            text-shadow: 0 0 10px rgba(240,173,78,0.4);
            min-width: 52px;
            text-align: right;
        }

        .cs-timer.urgent { color: var(--red); text-shadow: 0 0 12px rgba(232,64,87,0.7); animation: urgentFlash 0.5s ease infinite; }
        @keyframes urgentFlash { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }

        /* Bans strip */
        .cs-bans-row {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .cs-bans-group {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            flex: 1;
        }

        .cs-bans-label {
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .cs-bans-label.ally { color: var(--blue); }
        .cs-bans-label.enemy { color: var(--red); }

        .cs-bans-list {
            display: flex;
            gap: 4px;
            align-items: center;
        }

        .ban-thumb {
            width: 30px; height: 30px;
            border-radius: 4px;
            overflow: hidden;
            border: 1px solid rgba(232,64,87,0.6);
            background: rgba(0,0,0,0.6);
            filter: grayscale(100%) brightness(0.7);
            position: relative;
            flex-shrink: 0;
        }

        .ban-thumb img { width: 100%; height: 100%; object-fit: cover; }

        .ban-thumb::after {
            content: '✕';
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(232,64,87,0.45);
            color: #fff;
            font-size: 11px;
            font-weight: 700;
        }

        .ban-slot-empty {
            width: 30px; height: 30px;
            border-radius: 4px;
            border: 1px dashed rgba(200,170,110,0.15);
            background: rgba(0,0,0,0.15);
        }

        /* Middle body */
        .cs-body {
            flex: 1;
            display: grid;
            grid-template-columns: 150px 1fr 150px;
            gap: 8px;
            padding: 8px;
            min-height: 0;
            overflow: hidden;
        }

        .cs-team-panel {
            border-radius: 8px;
            padding: 8px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .cs-team-panel.ally {
            background: rgba(11,198,227,0.03);
            border: 1px solid rgba(11,198,227,0.2);
        }

        .cs-team-panel.enemy {
            background: rgba(232,64,87,0.03);
            border: 1px solid rgba(232,64,87,0.2);
        }

        .cs-team-label {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            text-align: center;
            margin-bottom: 2px;
        }

        .cs-team-label.ally { color: var(--blue); }
        .cs-team-label.enemy { color: var(--red); }

        /* Member cards */
        .member-card {
            border-radius: 6px;
            border: 1px solid rgba(200,170,110,0.15);
            background: rgba(0,0,0,0.35);
            overflow: hidden;
            transition: all 0.2s ease;
            position: relative;
            min-height: 50px;
        }

        .member-card.picking {
            border-color: #f0ad4e;
            box-shadow: 0 0 12px rgba(240,173,78,0.6);
            animation: pickerGlow 1.2s ease-in-out infinite;
        }

        @keyframes pickerGlow {
            0%,100% { box-shadow: 0 0 12px rgba(240,173,78,0.6); }
            50% { box-shadow: 0 0 22px rgba(255,193,7,0.9); }
        }

        .member-card.locked {
            border-color: rgba(11,198,227,0.4);
            background: rgba(11,198,227,0.05);
        }

        .member-card.empty {
            border: 1px dashed rgba(200,170,110,0.1);
            background: rgba(0,0,0,0.15);
            min-height: 50px;
        }

        .member-inner {
            display: flex;
            align-items: center;
            gap: 7px;
            padding: 5px 7px;
            height: 100%;
        }

        .member-champ-img {
            width: 38px; height: 38px;
            border-radius: 4px;
            overflow: hidden;
            border: 1px solid rgba(200,170,110,0.25);
            flex-shrink: 0;
        }

        .member-champ-img img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .member-info { flex: 1; min-width: 0; }

        .member-name {
            font-size: 10px;
            font-weight: 600;
            color: var(--text);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .member-name.you { color: var(--blue); }

        .member-champ-name {
            font-size: 9px;
            color: var(--gold);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .member-role {
            font-size: 8px;
            color: var(--text-muted);
            text-transform: uppercase;
        }

        .member-pos-icon {
            position: absolute;
            top: 3px; right: 3px;
            width: 16px; height: 16px;
            background: rgba(0,0,0,0.7);
            border-radius: 3px;
            border: 1px solid rgba(200,170,110,0.2);
            padding: 2px;
        }

        .member-pos-icon img { width: 100%; height: 100%; object-fit: contain; }

        .member-lock-icon {
            position: absolute;
            bottom: 3px; right: 4px;
            font-size: 10px;
            opacity: 0.9;
        }

        .member-pick-badge {
            position: absolute;
            top: 3px; left: 3px;
            width: 18px; height: 18px;
            background: linear-gradient(135deg, var(--gold), var(--gold-dark));
            border: 1.5px solid var(--bg-dark);
            border-radius: 50%;
            font-size: 9px;
            font-weight: 700;
            color: var(--bg-dark);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .member-empty-icon { font-size: 28px; opacity: 0.3; }
        .member-empty-name { font-size: 10px; color: var(--text-muted); margin-top: 2px; }

        /* CENTER - champion grid area */
        .cs-center {
            display: flex;
            flex-direction: column;
            gap: 6px;
            min-height: 0;
            overflow: hidden;
        }

        .cs-search-wrap { position: relative; flex-shrink: 0; }

        .cs-search {
            width: 100%;
            padding: 9px 12px 9px 34px;
            background: rgba(0,0,0,0.5);
            border: 1px solid rgba(200,170,110,0.2);
            border-radius: 8px;
            color: var(--text);
            font-size: 13px;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
        }

        .cs-search:focus {
            border-color: rgba(200,170,110,0.5);
            box-shadow: 0 0 0 2px rgba(200,170,110,0.08);
        }
        .cs-search::placeholder { color: rgba(160,155,140,0.4); }

        .cs-search-icon {
            position: absolute;
            left: 11px; top: 50%;
            transform: translateY(-50%);
            color: rgba(200,170,110,0.5);
            pointer-events: none;
            font-size: 13px;
        }

        .cs-champ-count {
            font-size: 9px;
            color: var(--text-dim);
            text-transform: uppercase;
            letter-spacing: 1px;
            flex-shrink: 0;
            text-align: center;
        }

        /* Champion Grid */
        .champ-grid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 4px;
            overflow-y: auto;
            overflow-x: hidden;
            flex: 1;
            padding: 8px;
            background: rgba(0,0,0,0.3);
            border-radius: 8px;
            border: 1px solid rgba(200,170,110,0.08);
            -webkit-overflow-scrolling: touch;
            min-width: 0;
            width: 100%;
            box-sizing: border-box;
            align-content: start;
        }

        .champ-grid::-webkit-scrollbar { width: 4px; }
        .champ-grid::-webkit-scrollbar-track { background: transparent; }
        .champ-grid::-webkit-scrollbar-thumb { background: rgba(200,170,110,0.3); border-radius: 4px; }

        .champ-card {
            position: relative;
            width: 100%;
            padding-bottom: 100%; /* square trick — aspect-ratio yerine */
            border-radius: 6px;
            overflow: hidden;
            cursor: pointer;
            border: 1.5px solid rgba(200,170,110,0.12);
            transition: all 0.12s cubic-bezier(0.4,0,0.2,1);
            background: rgba(20,25,35,0.9);
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
            min-width: 0;
            box-sizing: border-box;
        }

        .champ-card img {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            object-fit: cover;
            display: block;
            pointer-events: none;
        }
        /* Hover */
        @media (hover: hover) {
            .champ-card:hover {
                border-color: rgba(200,170,110,0.6);
                box-shadow: 0 0 0 2px rgba(200,170,110,0.3), inset 0 0 8px rgba(200,170,110,0.1);
                z-index: 5;
            }
        }

        .champ-card:active { opacity: 0.7; }

        /* Selected */
        .champ-card.selected {
            border-color: var(--blue) !important;
            border-width: 2px;
            box-shadow:
                0 0 0 2px rgba(11,198,227,0.5),
                0 0 12px rgba(11,198,227,0.7);
            z-index: 20;
            animation: selectedPulse 2s ease-in-out infinite;
        }

        @keyframes selectedPulse {
            0%,100% { box-shadow: 0 0 0 2px rgba(11,198,227,0.5), 0 0 12px rgba(11,198,227,0.7); }
            50% { box-shadow: 0 0 0 2px rgba(11,198,227,0.8), 0 0 20px rgba(11,198,227,1); }
        }

        /* Selected overlay checkmark */
        .champ-card.selected::after {
            content: '✓';
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(11,198,227,0.18);
            color: #fff;
            font-size: 22px;
            font-weight: 700;
            text-shadow: 0 0 8px rgba(11,198,227,0.9);
        }

        /* Disabled */
        .champ-card.disabled {
            opacity: 0.18;
            filter: grayscale(100%) brightness(0.35);
            cursor: not-allowed;
            pointer-events: none;
        }

        .champ-card.disabled::after {
            content: '✕';
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.45);
            color: rgba(232,64,87,0.85);
            font-size: 24px;
            font-weight: 700;
        }

        /* Not my turn - görünür ama tıklanamaz */
        .champ-card.not-my-turn {
            cursor: not-allowed;
            pointer-events: none;
            opacity: 0.55;
            filter: brightness(0.6);
        }

        /* Bottom action bar */
        .cs-bottom {
            flex-shrink: 0;
            background: rgba(0,0,0,0.9);
            border-top: 1px solid rgba(200,170,110,0.2);
            padding: 10px 14px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        /* Selected champion preview */
        .cs-selected-preview {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 12px;
            background: rgba(11,198,227,0.08);
            border: 1px solid rgba(11,198,227,0.35);
            border-radius: 8px;
            animation: slideInUp 0.2s ease;
        }

        @keyframes slideInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .cs-preview-img {
            width: 44px; height: 44px;
            border-radius: 6px;
            overflow: hidden;
            border: 1.5px solid rgba(11,198,227,0.6);
            box-shadow: 0 0 10px rgba(11,198,227,0.4);
            flex-shrink: 0;
        }

        .cs-preview-img img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .cs-preview-info { flex: 1; min-width: 0; }
        .cs-preview-label { font-size: 8px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; }
        .cs-preview-name { font-size: 17px; font-weight: 700; color: var(--blue); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .cs-preview-check { font-size: 28px; color: var(--blue); animation: checkBounce 1.5s ease infinite; }
        @keyframes checkBounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.12); } }

        /* Action row */
        .cs-action-row {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .cs-action-info { flex: 1; min-width: 0; }
        .cs-action-phase { font-size: 9px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; }

        .cs-action-status {
            font-size: 13px;
            font-weight: 700;
            color: var(--gold);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .cs-action-status.my-turn { color: var(--blue); }
        .cs-action-status.waiting { color: #f0ad4e; }

        .btn-action {
            flex: 2;
            max-width: 260px;
            padding: 13px 18px;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            cursor: pointer;
            border: none;
            position: relative;
            overflow: hidden;
            transition: all 0.2s ease;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
        }

        .btn-action.pick-btn {
            background: linear-gradient(135deg, #0bc6e3 0%, #0397ab 100%);
            color: #fff;
            box-shadow: 0 4px 16px rgba(11,198,227,0.25);
        }

        .btn-action.ban-btn {
            background: linear-gradient(135deg, #e84057 0%, #c41e3a 100%);
            color: #fff;
            box-shadow: 0 4px 16px rgba(232,64,87,0.25);
        }

        .btn-action:not(:disabled):hover { transform: translateY(-1px); filter: brightness(1.08); }
        .btn-action:active:not(:disabled) { transform: scale(0.97); }
        .btn-action:disabled { opacity: 0.3; cursor: not-allowed; }

        /* Shine sweep */
        .btn-action::after {
            content: '';
            position: absolute;
            top: 0; left: -100%; width: 100%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
            transition: left 0.4s ease;
        }

        .btn-action:not(:disabled):hover::after { left: 100%; }

        /* YOUR TURN overlay */
        .your-turn-overlay {
            position: fixed;
            inset: 0;
            background: rgba(10,20,40,0.93);
            z-index: 9998;
            display: none;
            align-items: center;
            justify-content: center;
        }

        .your-turn-overlay.active { display: flex; animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .your-turn-box {
            text-align: center;
            padding: 40px;
        }

        .your-turn-pulse-ring {
            width: 110px; height: 110px;
            margin: 0 auto 24px;
            background: linear-gradient(135deg, var(--blue), #0397ab);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 54px;
            animation: pulseTurn 1.5s infinite;
            box-shadow: 0 0 40px rgba(11,198,227,0.6);
        }

        @keyframes pulseTurn {
            0%,100% { transform: scale(1); box-shadow: 0 0 40px rgba(11,198,227,0.6); }
            50% { transform: scale(1.08); box-shadow: 0 0 60px rgba(11,198,227,0.9); }
        }

        .your-turn-title {
            font-size: 42px;
            font-weight: 700;
            background: linear-gradient(135deg, var(--blue), #0de9d7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-transform: uppercase;
            letter-spacing: 4px;
            margin-bottom: 10px;
        }

        .your-turn-sub { font-size: 16px; color: var(--text-muted); margin-bottom: 16px; }
        .your-turn-timer { font-size: 28px; font-weight: 700; color: #f0ad4e; font-family: 'Courier New', monospace; margin-bottom: 24px; }

        .btn-dismiss {
            padding: 12px 28px;
            background: rgba(200,170,110,0.15);
            border: 1.5px solid rgba(200,170,110,0.4);
            border-radius: 8px;
            color: var(--gold);
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-dismiss:hover { background: rgba(200,170,110,0.25); }

        /* Trade notifications */
        .trade-notif-wrap {
            position: fixed;
            top: 80px; right: 16px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 320px;
        }

        .trade-card {
            background: linear-gradient(135deg, rgba(1,10,19,0.98), rgba(5,15,25,0.98));
            border: 1.5px solid var(--border-gold);
            border-radius: 10px;
            padding: 14px;
            box-shadow: 0 6px 24px rgba(0,0,0,0.8);
            animation: slideInRight 0.3s ease;
        }

        @keyframes slideInRight { from { opacity: 0; transform: translateX(80px); } to { opacity: 1; transform: translateX(0); } }

        .trade-card.incoming { border-color: rgba(11,198,227,0.5); }

        .trade-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
        .trade-btn { padding: 9px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; border: none; }
        .trade-btn-yes { background: linear-gradient(135deg, var(--blue), #0397ab); color: #fff; }
        .trade-btn-no { background: linear-gradient(135deg, var(--red), #c41e3a); color: #fff; }

        /* Trade Modal */
        .trade-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 10000; align-items: center; justify-content: center; padding: 20px; }
        .trade-modal.active { display: flex; }
        .trade-modal-box { background: linear-gradient(135deg, var(--bg-mid), var(--bg-light)); border: 1.5px solid var(--border-gold); border-radius: 12px; padding: 22px; max-width: 380px; width: 100%; }
        .trade-type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 16px 0; }
        .trade-type-opt { border: 1.5px solid var(--border-gold); border-radius: 8px; padding: 14px; cursor: pointer; text-align: center; transition: all 0.2s; background: rgba(0,0,0,0.3); }
        .trade-type-opt:hover { border-color: rgba(200,170,110,0.6); }
        .trade-type-opt.sel { border-color: var(--blue); background: rgba(11,198,227,0.1); }
        .trade-type-opt.dis { opacity: 0.35; cursor: not-allowed; }

        /* QR Modal */
        .qr-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.96); z-index: 9999; padding: 20px; overflow-y: auto; }
        .qr-modal.active { display: flex; align-items: center; justify-content: center; }
        .qr-box { background: linear-gradient(135deg, var(--bg-mid), var(--bg-light)); border: 1.5px solid var(--border-gold); border-radius: 14px; padding: 22px; max-width: 480px; width: 100%; }
        #qr-reader { width: 100%; border-radius: 10px; overflow: hidden; border: 1.5px solid var(--border-gold); }
        #qr-reader__dashboard { display: none !important; }

        /* Lobby card */
        .lobby-member-row { display: flex; align-items: center; gap: 10px; padding: 9px 12px; background: rgba(0,0,0,0.3); border-radius: 6px; border: 1px solid var(--border-gold); }

        /* Misc utilities */
        .hidden { display: none !important; }
        .label-small { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, var(--border-gold), transparent); margin: 12px 0; }

        /* Mobile tweaks */
        @media (max-width: 600px) {
            /* Takımlar üstte yatay şerit, grid tam genişlik */
            .cs-body {
                grid-template-columns: 1fr 1fr;
                grid-template-rows: auto 1fr;
                gap: 6px;
                padding: 6px;
            }

            .cs-team-panel.ally {
                grid-column: 1;
                grid-row: 1;
                overflow-x: auto;
                overflow-y: hidden;
                flex-direction: row;
                flex-wrap: nowrap;
                align-items: flex-start;
                padding: 6px;
                gap: 4px;
                max-height: 80px;
            }

            .cs-team-panel.enemy {
                grid-column: 2;
                grid-row: 1;
                overflow-x: auto;
                overflow-y: hidden;
                flex-direction: row;
                flex-wrap: nowrap;
                align-items: flex-start;
                padding: 6px;
                gap: 4px;
                max-height: 80px;
            }

            .cs-center {
                grid-column: 1 / -1;
                grid-row: 2;
                min-width: 0;
            }

            .cs-team-panel.ally .member-card,
            .cs-team-panel.enemy .member-card {
                min-width: 44px; max-width: 44px; min-height: 44px;
                flex-shrink: 0;
            }

            .cs-team-panel.ally .member-inner,
            .cs-team-panel.enemy .member-inner {
                flex-direction: column; gap: 2px; padding: 4px;
                align-items: center; justify-content: center;
            }

            .cs-team-panel.ally .member-champ-img,
            .cs-team-panel.enemy .member-champ-img { width: 28px; height: 28px; }

            .cs-team-panel.ally .member-info,
            .cs-team-panel.enemy .member-info,
            .cs-team-panel.ally .member-pos-icon,
            .cs-team-panel.enemy .member-pos-icon,
            .cs-team-panel.ally .cs-team-label,
            .cs-team-panel.enemy .cs-team-label { display: none; }

            /* SABİT 5 SÜTUN — asla iç içe girmez */
            .champ-grid {
                grid-template-columns: repeat(5, 1fr) !important;
                gap: 3px;
                padding: 6px;
            }

            .cs-bans-row { gap: 6px; }
            .ban-thumb, .ban-slot-empty { width: 26px; height: 26px; }
            .ban-thumb::after { font-size: 10px; }
            .cs-timer { font-size: 26px; min-width: 44px; }
            .cs-phase-text { font-size: 13px; }
            .your-turn-title { font-size: 32px; }
            .your-turn-pulse-ring { width: 90px; height: 90px; font-size: 44px; }
            .trade-notif-wrap { right: 8px; left: 8px; max-width: none; }
            .btn-action { font-size: 14px; padding: 12px 14px; }
        }

        @media (max-width: 380px) {
            /* Çok küçük ekran — 4 sütun */
            .champ-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 2px; }
            .cs-preview-name { font-size: 15px; }
        }

        /* iOS font size fix */
        @media (max-width: 480px) {
            input, select { font-size: 16px !important; }
        }

        /* Account info */
        .account-row { display: flex; align-items: center; gap: 12px; }
        .account-avatar-wrap { position: relative; }
        .account-avatar { width: 48px; height: 48px; border-radius: 50%; overflow: hidden; border: 2px solid var(--blue); box-shadow: 0 0 10px rgba(11,198,227,0.3); }
        .account-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .rank-badge { position: absolute; bottom: -4px; right: -4px; width: 26px; height: 26px; border-radius: 50%; border: 2px solid var(--bg-dark); background: rgba(0,0,0,0.8); overflow: hidden; }
        .rank-badge img { width: 100%; height: 100%; object-fit: cover; }

        /* Session code display */
        .session-code-display { font-family: 'Courier New', monospace; font-size: 20px; font-weight: 700; letter-spacing: 4px; color: var(--gold); }

        /* Game status inline */
        .game-status-row { display: flex; align-items: center; gap: 12px; }
        .game-status-icon-big { font-size: 28px; }
    </style>
</head>
<body>

<?php if (!$sessionCode): ?>
<!-- ==================== SESSION INPUT SCREEN ==================== -->
<div class="login-wrap">
    <div class="logo-text">AUTREX</div>
    <div class="logo-badge">Remote Control</div>

    <div class="hero-icon">📱</div>
    <h1 class="hero-title">Remote Control</h1>
    <p class="hero-sub">Enter the 6-digit session code from your Autrex desktop app</p>

    <?php if ($error): ?>
        <div class="error-box"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>

    <form method="GET" id="codeForm" style="width:100%; max-width:340px; display:flex; flex-direction:column; align-items:center; gap:16px;">
        <input type="hidden" name="code" id="hiddenCode">
        <div class="code-boxes">
            <?php for($i=0;$i<6;$i++): ?>
                <input type="text" class="code-box" maxlength="1" data-i="<?php echo $i; ?>" autocomplete="off" inputmode="text">
            <?php endfor; ?>
        </div>
        <button type="submit" class="btn-gold" id="connectBtn" disabled>Connect</button>
    </form>

    <div style="margin-top:16px;">
        <button class="btn-purple" onclick="openQRScanner()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Scan QR Code
        </button>
    </div>

    <div style="margin-top:28px; text-align:center; color:var(--text-dim); font-size:13px; line-height:1.8; max-width:340px;">
        <p><span style="color:var(--purple); font-weight:600;">💡 Nasıl Bağlanılır</span></p>
        <p style="margin-top:8px;">Autrex masaüstü uygulamasını aç → <strong style="color:var(--gold)">Remote Control</strong>'ü etkinleştir → Kodu kopyala</p>
    </div>
</div>

<script>
const boxes = [...document.querySelectorAll('.code-box')];
const hiddenCode = document.getElementById('hiddenCode');
const connectBtn = document.getElementById('connectBtn');

boxes[0].focus();

boxes.forEach((box, i) => {
    box.addEventListener('input', e => {
        const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'');
        e.target.value = v;
        if (v) { e.target.classList.add('filled'); if (i < 5) boxes[i+1].focus(); }
        else e.target.classList.remove('filled');
        sync();
    });
    box.addEventListener('keydown', e => {
        if (e.key==='Backspace' && !e.target.value && i>0) { boxes[i-1].focus(); boxes[i-1].value=''; boxes[i-1].classList.remove('filled'); sync(); }
        if (e.key==='ArrowLeft' && i>0) boxes[i-1].focus();
        if (e.key==='ArrowRight' && i<5) boxes[i+1].focus();
    });
    box.addEventListener('paste', e => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);
        paste.split('').forEach((c,j) => { if(boxes[j]){ boxes[j].value=c; boxes[j].classList.add('filled'); } });
        boxes[Math.min(paste.length, 5)].focus();
        sync();
    });
});

function sync() {
    const code = boxes.map(b=>b.value).join('');
    hiddenCode.value = code;
    connectBtn.disabled = code.length !== 6;
    connectBtn.style.opacity = code.length===6 ? '1' : '0.45';
}
</script>

<?php else: ?>
<!-- ==================== REMOTE CONTROL INTERFACE ==================== -->
<div class="rc-wrap" id="mainUI">
    <!-- Header card -->
    <div style="display:flex; align-items:center; gap:8px; padding:12px 0 8px;">
        <div style="font-size:20px; font-weight:700; background:linear-gradient(135deg,var(--purple),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-transform:uppercase;letter-spacing:2px;">AUTREX</div>
        <div style="flex:1;"></div>
        <div id="connStatus" class="status-badge">
            <div class="dot off" id="connDot"></div>
            <span id="connText">Bağlanıyor...</span>
        </div>
    </div>

    <!-- Session + Account card -->
    <div class="card">
        <div class="card-body">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
                <div>
                    <div class="label-small">Session Kodu</div>
                    <div class="session-code-display"><?php echo $sessionCode; ?></div>
                </div>
                <div id="accountAvatarWrap" class="account-avatar-wrap hidden">
                    <div class="account-avatar">
                        <img id="accountAvatarImg" src="" alt="Profile">
                    </div>
                    <div id="rankBadgeWrap" class="rank-badge hidden">
                        <img id="rankBadgeImg" src="" alt="Rank">
                    </div>
                </div>
            </div>

            <div id="accountInfoRow" class="hidden" style="margin-top:12px; padding-top:12px; border-top:1px solid var(--border-gold);">
                <div class="label-small">Bağlı Hesap</div>
                <div id="accountNameEl" style="font-size:14px; font-weight:700; color:var(--blue);">Yükleniyor...</div>
                <div id="accountLevelEl" style="font-size:11px; color:var(--text-muted); margin-top:2px;"></div>
            </div>

            <div id="gameStatusRow" class="hidden" style="margin-top:12px; padding-top:12px; border-top:1px solid var(--border-gold);">
                <div class="game-status-row">
                    <div id="gsIcon" class="game-status-icon-big">⏳</div>
                    <div>
                        <div id="gsTitle" style="font-size:14px; font-weight:700; color:var(--gold);">Bekleniyor</div>
                        <div id="gsSub" style="font-size:11px; color:var(--text-muted);">Oyun istemcisine bağlanılıyor</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Lobby Members -->
    <div class="card hidden" id="lobbyCard">
        <div class="card-body">
            <div style="font-size:13px; font-weight:700; color:var(--gold); text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">👥 Lobi Üyeleri</div>
            <div id="lobbyList" style="display:flex; flex-direction:column; gap:6px;"></div>
        </div>
    </div>

    <!-- Position Selection -->
    <div class="card hidden" id="posCard">
        <div class="card-body">
            <div style="font-size:13px; font-weight:700; color:var(--gold); text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">🎯 Pozisyon Seç</div>
            <div class="pos-grid">
                <div>
                    <div class="label-small">Birincil</div>
                    <select id="primaryPos" class="pos-select" onchange="updatePositions()">
                        <option value="">Seç...</option>
                        <option value="top">🛡️ Top</option>
                        <option value="jungle">🌲 Jungle</option>
                        <option value="middle">⚡ Mid</option>
                        <option value="bottom">🏹 ADC</option>
                        <option value="utility">💚 Support</option>
                        <option value="fill">🎲 Fill</option>
                    </select>
                </div>
                <div>
                    <div class="label-small">İkincil</div>
                    <select id="secondaryPos" class="pos-select" onchange="updatePositions()">
                        <option value="">Seç...</option>
                        <option value="top">🛡️ Top</option>
                        <option value="jungle">🌲 Jungle</option>
                        <option value="middle">⚡ Mid</option>
                        <option value="bottom">🏹 ADC</option>
                        <option value="utility">💚 Support</option>
                        <option value="fill">🎲 Fill</option>
                    </select>
                </div>
            </div>
        </div>
    </div>

    <!-- Queue Control -->
    <div class="queue-panel" id="queuePanel">
        <div class="queue-title">🎮 Kuyruk Kontrolü</div>
        <div class="queue-options">
            <label class="q-opt"><input type="radio" name="qType" value="420" checked>
                <span style="font-size:20px;">👑</span>
                <span class="q-opt-label"><strong>Ranked Solo/Duo</strong><small>Rekabetçi 5v5</small></span>
            </label>
            <label class="q-opt"><input type="radio" name="qType" value="440">
                <span style="font-size:20px;">👥</span>
                <span class="q-opt-label"><strong>Ranked Flex</strong><small>Takım Ranked 5v5</small></span>
            </label>
            <label class="q-opt"><input type="radio" name="qType" value="400">
                <span style="font-size:20px;">⚔️</span>
                <span class="q-opt-label"><strong>Normal Draft</strong><small>Casual 5v5 Draft</small></span>
            </label>
            <label class="q-opt"><input type="radio" name="qType" value="430">
                <span style="font-size:20px;">🎯</span>
                <span class="q-opt-label"><strong>Normal Blind</strong><small>Casual 5v5 Blind</small></span>
            </label>
            <label class="q-opt"><input type="radio" name="qType" value="450">
                <span style="font-size:20px;">🌉</span>
                <span class="q-opt-label"><strong>ARAM</strong><small>All Random All Mid</small></span>
            </label>
        </div>
        <div class="queue-btns">
            <button id="startQBtn" class="q-btn q-btn-start" onclick="startQueue()">▶ Kuyruğa Gir</button>
            <button id="stopQBtn" class="q-btn q-btn-stop" onclick="stopQueue()" disabled>⏹ Kuyruğu Durdur</button>
        </div>
        <div id="queueSearching" class="queue-searching hidden">
            <span class="spin">⏳</span>
            <span style="font-size:13px; font-weight:600; color:var(--blue);">Maç aranıyor...</span>
        </div>
    </div>

    <div style="text-align:center; padding:20px 0 10px; color:var(--text-dim); font-size:11px;">
        <p>Powered by <a href="https://autrex.kesug.com" target="_blank" style="color:var(--purple); font-weight:600; text-decoration:none;">Autrex</a></p>
    </div>
</div>

<!-- ==================== CHAMPION SELECT FULL SCREEN ==================== -->
<div id="csLayout">
    <!-- TOP BAR -->
    <div class="cs-topbar">
        <div class="cs-phase-row">
            <div>
                <div class="cs-phase-label" id="csPhaseLabel">Faz</div>
                <div class="cs-phase-text" id="csPhaseText">Bekleniyor...</div>
            </div>
            <div class="cs-timer" id="csTimer">--</div>
        </div>

        <div class="cs-bans-row">
            <div class="cs-bans-group">
                <div class="cs-bans-label ally">Takım Banları</div>
                <div class="cs-bans-list" id="allyBansList"></div>
            </div>
            <div style="width:2px; height:40px; background:linear-gradient(180deg,transparent,var(--border-gold),transparent); flex-shrink:0;"></div>
            <div class="cs-bans-group">
                <div class="cs-bans-label enemy">Düşman Banları</div>
                <div class="cs-bans-list" id="enemyBansList"></div>
            </div>
        </div>
    </div>

    <!-- BODY -->
    <div class="cs-body">
        <!-- MY TEAM -->
        <div class="cs-team-panel ally" id="allyTeamPanel">
            <div class="cs-team-label ally">TAKIM</div>
            <div id="allyTeamList"></div>
        </div>

        <!-- CENTER: search + grid -->
        <div class="cs-center">
            <div class="cs-search-wrap">
                <span class="cs-search-icon">🔍</span>
                <input type="text" class="cs-search" id="csSearch" placeholder="Şampiyon ara..." autocomplete="off">
            </div>
            <div class="cs-champ-count" id="csChampCount">Şampiyonlar yükleniyor...</div>
            <div class="champ-grid" id="champGrid"></div>
        </div>

        <!-- ENEMY TEAM -->
        <div class="cs-team-panel enemy" id="enemyTeamPanel">
            <div class="cs-team-label enemy">DÜŞMAN</div>
            <div id="enemyTeamList"></div>
        </div>
    </div>

    <!-- BOTTOM ACTION BAR -->
    <div class="cs-bottom">
        <!-- Selected champion preview (hidden until selection) -->
        <div id="csSelectedPreview" class="cs-selected-preview hidden">
            <div class="cs-preview-img" id="csPreviewImg"></div>
            <div class="cs-preview-info">
                <div class="cs-preview-label">Seçili Şampiyon</div>
                <div class="cs-preview-name" id="csPreviewName">-</div>
            </div>
            <div class="cs-preview-check">✓</div>
        </div>

        <div class="cs-action-row">
            <div class="cs-action-info">
                <div class="cs-action-phase" id="csActionPhase">Faz</div>
                <div class="cs-action-status" id="csActionStatus">Bekleniyor...</div>
            </div>
            <button class="btn-action pick-btn" id="csActionBtn" disabled onclick="sendCommand()">
                <span id="csActionBtnTxt">✅ Seç</span>
            </button>
            <div style="flex:1; max-width:80px;"></div>
        </div>
    </div>
</div>

<!-- YOUR TURN OVERLAY -->
<div class="your-turn-overlay" id="yourTurnOverlay">
    <div class="your-turn-box">
        <div class="your-turn-pulse-ring" id="ytIcon">⏳</div>
        <div class="your-turn-title">SIRAN!</div>
        <div class="your-turn-sub" id="ytSub">Şimdi seç!</div>
        <div class="your-turn-timer" id="ytTimer">--</div>
        <button class="btn-dismiss" onclick="dismissYourTurn()">Anladım, seçiyorum!</button>
    </div>
</div>

<!-- TRADE NOTIFICATIONS -->
<div class="trade-notif-wrap" id="tradeNotifWrap"></div>

<!-- TRADE MODAL -->
<div class="trade-modal" id="tradeModal">
    <div class="trade-modal-box">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div style="font-size:16px; font-weight:700; color:var(--gold);">Takas Talebi</div>
            <button onclick="closeTradeModal()" style="background:none;border:none;color:var(--text-muted);font-size:22px;cursor:pointer;">×</button>
        </div>
        <div class="trade-type-grid">
            <div class="trade-type-opt" id="tradeOptPickOrder" onclick="selectTradeType('PICK_ORDER')">
                <div style="font-size:28px; margin-bottom:6px;">🔄</div>
                <div style="font-size:13px; font-weight:600; color:var(--text);">Sıra Takası</div>
                <div style="font-size:11px; color:var(--text-muted);">Seçim sırası değiştir</div>
            </div>
            <div class="trade-type-opt" id="tradeOptChampion" onclick="selectTradeType('CHAMPION')">
                <div style="font-size:28px; margin-bottom:6px;">⚔️</div>
                <div style="font-size:13px; font-weight:600; color:var(--text);">Şampiyon Takası</div>
                <div style="font-size:11px; color:var(--text-muted);">Şampiyon değiştir</div>
            </div>
        </div>
        <div style="background:rgba(0,0,0,0.4); border:1px solid var(--border-gold); border-radius:8px; padding:14px; margin-bottom:16px;">
            <div class="label-small" style="margin-bottom:8px;">Önizleme</div>
            <div id="tradePreview" style="font-size:13px; color:var(--text); text-align:center;">Takas türü seçin</div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <button onclick="closeTradeModal()" style="padding:11px; border-radius:6px; background:rgba(0,0,0,0.4); border:1px solid var(--border-gold); color:var(--text); font-size:13px; font-weight:600; cursor:pointer;">İptal</button>
            <button id="tradeConfirmBtn" onclick="confirmTrade()" disabled style="padding:11px; border-radius:6px; background:linear-gradient(135deg,var(--blue),#0397ab); border:none; color:#fff; font-size:13px; font-weight:600; cursor:pointer; opacity:0.4;">Gönder</button>
        </div>
    </div>
</div>

<!-- TOAST -->
<div class="toast" id="toast"></div>

<!-- QR Modal -->
<div class="qr-modal" id="qrModal">
    <div class="qr-box">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div style="font-size:18px; font-weight:700; color:var(--gold);">📷 QR Kodu Tara</div>
            <button onclick="closeQRScanner()" style="background:rgba(255,255,255,0.1); border:none; color:var(--text); width:32px; height:32px; border-radius:8px; cursor:pointer; font-size:18px;">✕</button>
        </div>
        <div id="qr-reader"></div>
        <div id="qrStatus" style="display:none; margin-top:12px; padding:10px; border-radius:6px; text-align:center; font-size:13px;"></div>
        <div style="margin-top:12px; text-align:center; color:var(--text-dim); font-size:12px;">Kameranızı Autrex masaüstü uygulamasındaki QR koduna doğrultun</div>
    </div>
</div>

<script>
const SESSION_CODE = '<?php echo $sessionCode; ?>';
const SUPABASE_URL = '<?php echo SUPABASE_URL; ?>';
const SUPABASE_ANON_KEY = '<?php echo SUPABASE_ANON_KEY; ?>';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// State
let selectedChampion = null;
let currentState = null;
let currentMode = 'pick'; // auto-determined
let champions = [];
let ownedChampionIds = [];
let isMyTurn = false;
let yourTurnShown = false;
let yourTurnTimerInterval = null;
let lastStateHash = '';
let isQueueActive = false;
let tradeModal = { targetCellId: null, targetName: '', selectedType: null };

// ==================== INIT ====================
async function init() {
    try {
        const { data: session, error } = await sb.from('remote_sessions').select('*')
            .eq('session_code', SESSION_CODE).eq('is_active', true).single();

        if (error || !session) {
            showToast('Oturum bulunamadı veya süresi doldu. Yönlendiriliyor...', 'error');
            setTimeout(() => window.location.href = '/remote/', 2000);
            return;
        }

        setConnStatus(true);
        await loadChampions();
        subscribeToState();
        subscribeToGameStatus();
        subscribeToTrades();
        subscribeToLobbyState();
        setupSearch();
        await fetchGameStatus();
        await fetchLobbyState();
        setInterval(pollState, 500);
        setInterval(fetchGameStatus, 2000);
        setInterval(fetchLobbyState, 2000);

    } catch(e) {
        console.error('Init error:', e);
        showToast('Bağlantı hatası: ' + e.message, 'error');
    }
}

// ==================== CHAMPIONS ====================
async function loadChampions() {
    try {
        const vRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const versions = await vRes.json();
        const ver = versions[0];
        window.DD_VERSION = ver;

        const cRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${ver}/data/en_US/champion.json`);
        const data = await cRes.json();
        champions = Object.values(data.data);
        console.log('✅ Loaded', champions.length, 'champions, version:', ver);
    } catch(e) {
        console.error('Champion load error:', e);
        window.DD_VERSION = '15.1.1';
    }
}

function renderChampions(filter) {
    const grid = document.getElementById('champGrid');
    const countEl = document.getElementById('csChampCount');
    const searchEl = document.getElementById('csSearch');

    if (!grid) return;
    if (filter === undefined && searchEl) filter = searchEl.value;

    // Get banned/picked IDs from state
    const bannedIds = new Set();
    const pickedIds = new Set();

    // PRIMARY: use banned_champions array (most reliable)
    if (currentState?.banned_champions && Array.isArray(currentState.banned_champions)) {
        currentState.banned_champions.forEach(ban => {
            if (ban.championId > 0) bannedIds.add(ban.championId);
        });
    }

    // FALLBACK: also check actions for any bans not yet in banned_champions
    if (currentState?.actions) {
        currentState.actions.flat().forEach(a => {
            if (a.championId > 0) {
                if (a.type === 'ban' && (a.completed || a.isInProgress)) bannedIds.add(a.championId);
                else if (a.type === 'pick' && a.completed) pickedIds.add(a.championId);
            }
        });
    }

    // Filter by search
    let filtered = filter
        ? champions.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))
        : champions;

    // Pick mode: owned only
    if (currentMode === 'pick' && ownedChampionIds.length > 0) {
        filtered = filtered.filter(c => ownedChampionIds.includes(parseInt(c.key)));
    }

    const ver = window.DD_VERSION || '15.1.1';

    if (filtered.length === 0) {
        if (currentMode === 'pick' && ownedChampionIds.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px 10px;color:var(--text-muted);">
                <div style="font-size:36px;margin-bottom:12px;">⏳</div>
                <div>Sahip olunan şampiyonlar yükleniyor...</div></div>`;
            countEl.textContent = 'Yükleniyor...';
        } else {
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px 10px;color:var(--text-muted);">Şampiyon bulunamadı</div>`;
            countEl.textContent = '0 şampiyon';
        }
        return;
    }

    countEl.textContent = currentMode === 'pick'
        ? `${filtered.length} sahip olunan şampiyon`
        : `${filtered.length} şampiyon`;

    grid.innerHTML = filtered.map(c => {
        const id = parseInt(c.key);
        const isBanned = bannedIds.has(id);
        const isPicked = pickedIds.has(id);
        const isUnavailable = isBanned || isPicked || !isMyTurn;
        const isSelected = selectedChampion?.id === id;
        const cls = (isBanned || isPicked) ? 'disabled' : (!isMyTurn ? 'not-my-turn' : (isSelected ? 'selected' : ''));
        const onclick = isUnavailable ? '' : `onclick="selectChampion(${c.key},'${c.name.replace(/'/g,"\\'")}','${c.id}')"`;
        const titleSuffix = isBanned ? ' (Banlı)' : isPicked ? ' (Seçildi)' : (!isMyTurn ? ' (Sıra sizde değil)' : '');
        return `<div class="champ-card ${cls}" data-id="${c.key}" ${onclick} title="${c.name}${titleSuffix}">
            <img src="https://ddragon.leagueoflegends.com/cdn/${ver}/img/champion/${c.id}.png" alt="${c.name}" loading="lazy">
        </div>`;
    }).join('');
}

// ==================== SELECT CHAMPION ====================
function selectChampion(id, name, champKey) {
    selectedChampion = { id: parseInt(id), name, champKey };
    const ver = window.DD_VERSION || '15.1.1';

    // Update grid visuals
    document.querySelectorAll('.champ-card').forEach(c => c.classList.remove('selected'));
    const card = document.querySelector(`.champ-card[data-id="${id}"]`);
    if (card) card.classList.add('selected');

    // Show preview
    const preview = document.getElementById('csSelectedPreview');
    const previewImg = document.getElementById('csPreviewImg');
    const previewName = document.getElementById('csPreviewName');
    preview.classList.remove('hidden');
    previewImg.innerHTML = `<img src="https://ddragon.leagueoflegends.com/cdn/${ver}/img/champion/${champKey}.png" alt="${name}">`;
    previewName.textContent = name;

    // Animate preview in
    preview.style.animation = 'none';
    void preview.offsetWidth; // reflow
    preview.style.animation = 'slideInUp 0.25s ease';

    // Enable button only if it's my turn
    const btn = document.getElementById('csActionBtn');
    btn.disabled = !isMyTurn;

    console.log('✅ Selected:', name, '| My turn:', isMyTurn);
}

// ==================== SWITCH MODE ====================
function switchMode(mode) {
    if (currentMode === mode) return;
    currentMode = mode;
    console.log('🔄 Mode:', mode);

    const btn = document.getElementById('csActionBtn');
    const btnTxt = document.getElementById('csActionBtnTxt');

    btn.className = `btn-action ${mode === 'ban' ? 'ban-btn' : 'pick-btn'}`;
    btnTxt.textContent = mode === 'ban' ? '🚫 Banla' : '✅ Seç';

    // Re-render to update disabled states
    renderChampions();

    // Keep selection if same champion still valid
    if (selectedChampion) {
        const card = document.querySelector(`.champ-card[data-id="${selectedChampion.id}"]`);
        if (card && !card.classList.contains('disabled')) {
            card.classList.add('selected');
        } else {
            clearSelection();
        }
    }
}

function clearSelection() {
    selectedChampion = null;
    document.getElementById('csSelectedPreview').classList.add('hidden');
    document.getElementById('csActionBtn').disabled = true;
    document.querySelectorAll('.champ-card').forEach(c => c.classList.remove('selected'));
}

// ==================== SEND COMMAND ====================
async function sendCommand() {
    if (!selectedChampion) return;

    const btn = document.getElementById('csActionBtn');
    const btnTxt = document.getElementById('csActionBtnTxt');
    const orig = btnTxt.textContent;

    btn.disabled = true;
    btnTxt.textContent = '⏳ Gönderiliyor...';

    try {
        const { data, error } = await sb.from('remote_commands').insert([{
            session_code: SESSION_CODE,
            command_type: currentMode,
            champion_id: selectedChampion.id,
            executed: false
        }]).select();

        if (error) throw error;

        showToast(`${currentMode === 'ban' ? '🚫 BAN' : '✅ SEÇİM'}: ${selectedChampion.name}`, 'success');
        clearSelection();
        yourTurnShown = false;
        hideYourTurnOverlay();

    } catch(e) {
        console.error('Command error:', e);
        showToast('Komut gönderilemedi: ' + e.message, 'error');
        btn.disabled = false;
        btnTxt.textContent = orig;
    }
}

// ==================== STATE UPDATES ====================
function subscribeToState() {
    sb.channel(`cs:${SESSION_CODE}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'champ_select_state', filter: `session_code=eq.${SESSION_CODE}` },
            payload => { if (payload.new) updateState(payload.new); })
        .subscribe();
}

function subscribeToGameStatus() {
    sb.channel(`gs:${SESSION_CODE}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'game_status', filter: `session_code=eq.${SESSION_CODE}` },
            payload => { if (payload.new) updateGameStatus(payload.new); })
        .subscribe();
}

function subscribeToTrades() {
    sb.channel(`tr:${SESSION_CODE}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'trade_requests', filter: `session_code=eq.${SESSION_CODE}` },
            payload => { if (payload.new) handleTradeUpdate(payload.new); })
        .subscribe();
}

function subscribeToLobbyState() {
    sb.channel(`lb:${SESSION_CODE}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'lobby_state', filter: `session_code=eq.${SESSION_CODE}` },
            payload => { if (payload.new) renderLobbyMembers(payload.new); })
        .subscribe();
}

async function pollState() {
    try {
        const { data: gs } = await sb.from('game_status').select('*').eq('session_code', SESSION_CODE).maybeSingle();
        if (gs) updateGameStatus(gs);
        else updateGameStatus({ game_phase: 'None', additional_data: {} });

        const { data: cs } = await sb.from('champ_select_state').select('*').eq('session_code', SESSION_CODE).maybeSingle();
        if (cs) updateState(cs);
    } catch(_) {}
}

async function fetchGameStatus() {
    try {
        const { data, error } = await sb.from('game_status').select('*').eq('session_code', SESSION_CODE).maybeSingle();
        if (!error) updateGameStatus(data || { game_phase: 'None', additional_data: {} });
    } catch(_) {}
}

async function fetchLobbyState() {
    try {
        const { data, error } = await sb.from('lobby_state').select('*').eq('session_code', SESSION_CODE).maybeSingle();
        if (!error && data) renderLobbyMembers(data);
    } catch(_) {}
}

// ==================== UPDATE STATE ====================
function updateState(state) {
    const hash = JSON.stringify({
        phase: state?.phase,
        myTeam: state?.my_team?.map(m => ({ cid: m.cellId, champId: m.championId, locked: m.isChampionLocked })),
        enemyTeam: state?.enemy_team?.map(m => ({ cid: m.cellId, champId: m.championId, locked: m.isChampionLocked })),
        bans: state?.banned_champions,
        actions: state?.actions?.flat().map(a => ({ id: a.id, done: a.completed, cid: a.championId })),
        lpci: state?.local_player_cell_id
    });

    if (hash === lastStateHash) return;
    lastStateHash = hash;

    currentState = state;

    const oldOwned = ownedChampionIds.length;
    if (state.owned_champions && Array.isArray(state.owned_champions)) {
        ownedChampionIds = state.owned_champions;
    }

    updateTurnAndPhase(state);
    updateTeamsDisplay(state);

    if (ownedChampionIds.length !== oldOwned && champions.length > 0) {
        renderChampions();
    }
}

// ==================== TURN & PHASE ====================
function updateTurnAndPhase(state) {
    if (!state) return;

    const phase = state.phase || 'PLANNING';
    let activeAction = null;
    let myActiveAction = null;

    if (state.actions && Array.isArray(state.actions)) {
        for (const group of state.actions) {
            if (!Array.isArray(group)) continue;
            for (const a of group) {
                if (a.type === 'phase_transition') continue;
                if (!a.completed && a.actorCellId === state.local_player_cell_id) {
                    myActiveAction = a;
                }
                if (!a.completed && !activeAction) {
                    activeAction = a;
                }
            }
            if (myActiveAction) break;
        }
    }

    isMyTurn = !!myActiveAction;

    // Auto mode switch
    const targetAction = myActiveAction || activeAction;
    if (targetAction) {
        if (myActiveAction?.type === 'ban' && currentMode !== 'ban') switchMode('ban');
        else if (myActiveAction?.type === 'pick' && currentMode !== 'pick') switchMode('pick');
    } else if (phase === 'BAN_PHASE' && currentMode !== 'ban') switchMode('ban');
    else if ((phase === 'PICK_PHASE' || phase === 'PICK_ONLY') && currentMode !== 'pick') switchMode('pick');

    // Update phase label
    const phaseMap = {
        'BAN_PHASE': 'Ban Fazı', 'PICK_PHASE': 'Seçim Fazı',
        'BAN_PICK': targetAction?.type === 'ban' ? 'Ban Fazı' : 'Seçim Fazı',
        'PICK_ONLY': 'Seçim Fazı', 'PLANNING': 'Planlama', 'FINALIZATION': 'Sonlandırma'
    };

    const phaseLabel = document.getElementById('csPhaseLabel');
    const phaseText = document.getElementById('csPhaseText');
    const actionPhase = document.getElementById('csActionPhase');
    const actionStatus = document.getElementById('csActionStatus');

    if (phaseLabel) phaseLabel.textContent = phaseMap[phase] || phase;
    if (actionPhase) actionPhase.textContent = phaseMap[phase] || phase;

    // Update action button enablement
    const btn = document.getElementById('csActionBtn');
    if (selectedChampion && btn) {
        btn.disabled = !isMyTurn;
    }

    if (isMyTurn && myActiveAction) {
        const type = myActiveAction.type === 'ban' ? 'BAN' : 'SEÇ';
        if (phaseText) { phaseText.textContent = `🎯 SIRANIZ - ${type}!`; phaseText.style.color = 'var(--blue)'; }
        if (actionStatus) { actionStatus.textContent = `🎯 ${type} SIRASI!`; actionStatus.className = 'cs-action-status my-turn'; }

        if (!yourTurnShown) {
            showYourTurnOverlay(myActiveAction);
            yourTurnShown = true;
        }
    } else if (activeAction) {
        const type = activeAction.type === 'ban' ? 'ban' : 'seçim';
        if (phaseText) { phaseText.textContent = `⏳ Takım arkadaşı ${type} yapıyor...`; phaseText.style.color = '#f0ad4e'; }
        if (actionStatus) { actionStatus.textContent = `⏳ Bekleniyor...`; actionStatus.className = 'cs-action-status waiting'; }

        yourTurnShown = false;
        hideYourTurnOverlay();
    } else {
        if (phaseText) { phaseText.textContent = 'Bekleniyor...'; phaseText.style.color = 'var(--gold)'; }
        if (actionStatus) { actionStatus.textContent = 'Bekleniyor...'; actionStatus.className = 'cs-action-status'; }
        yourTurnShown = false;
        hideYourTurnOverlay();
    }
    
    // Update timer display
    const timerEl = document.getElementById('csTimer');
    if (timerEl && state.time_left) {
        const seconds = Math.floor(state.time_left / 1000);
        timerEl.textContent = seconds + 's';
        
        // Add urgent class if time is low
        if (seconds <= 10) {
            timerEl.classList.add('urgent');
        } else {
            timerEl.classList.remove('urgent');
        }
    } else if (timerEl) {
        timerEl.textContent = '--';
        timerEl.classList.remove('urgent');
    }
}

// ==================== YOUR TURN OVERLAY ====================
function showYourTurnOverlay(action) {
    const overlay = document.getElementById('yourTurnOverlay');
    const icon = document.getElementById('ytIcon');
    const sub = document.getElementById('ytSub');
    const timer = document.getElementById('ytTimer');

    icon.textContent = action.type === 'ban' ? '🚫' : '✅';
    sub.textContent = action.type === 'ban' ? 'Bir şampiyon banla!' : 'Şampiyonunu seç!';
    overlay.classList.add('active');

    if (currentState?.time_left) {
        let t = Math.floor(currentState.time_left / 1000);
        timer.textContent = t + 's';
        if (yourTurnTimerInterval) clearInterval(yourTurnTimerInterval);
        yourTurnTimerInterval = setInterval(() => {
            t--;
            if (t >= 0) timer.textContent = t + 's';
            else { clearInterval(yourTurnTimerInterval); yourTurnTimerInterval = null; }
        }, 1000);
    } else {
        timer.textContent = '--';
    }
}

function hideYourTurnOverlay() {
    document.getElementById('yourTurnOverlay').classList.remove('active');
    if (yourTurnTimerInterval) { clearInterval(yourTurnTimerInterval); yourTurnTimerInterval = null; }
}

function dismissYourTurn() { hideYourTurnOverlay(); }

// ==================== TEAMS DISPLAY ====================
function updateTeamsDisplay(state) {
    const inCS = state?.my_team?.length > 0;
    const csLayout = document.getElementById('csLayout');

    if (!inCS) {
        csLayout.classList.remove('visible');
        return;
    }

    csLayout.classList.add('visible');

    const ver = window.DD_VERSION || '15.1.1';
    const pickSeq = state.pick_order_sequence || [];

    // Find current picker
    let currentPickerCellId = null;
    if (state.actions) {
        for (const group of state.actions) {
            if (!Array.isArray(group)) continue;
            for (const a of group) {
                if (!a.completed && a.type !== 'phase_transition') {
                    currentPickerCellId = a.actorCellId;
                    break;
                }
            }
            if (currentPickerCellId !== null) break;
        }
    }

    // ---- ALLY TEAM ----
    const allyList = document.getElementById('allyTeamList');
    allyList.innerHTML = '';
    state.my_team.forEach(m => {
        const isPicking = m.cellId === currentPickerCellId;
        const isLocked = m.isChampionLocked || false;
        const isLocal = m.isLocalPlayer || false;
        const pos = m.assignedPosition || '';
        const pickInfo = pickSeq.find(p => p.cellId === m.cellId);
        const champ = m.championId > 0 ? champions.find(c => parseInt(c.key) === m.championId) : null;

        const card = document.createElement('div');
        card.className = `member-card ${isPicking ? 'picking' : ''} ${isLocked ? 'locked' : ''}`;

        const posIcon = pos ? `<div class="member-pos-icon"><img src="https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-${pos}.svg" alt="${pos}" onerror="this.parentElement.style.display='none'"></div>` : '';
        const pickBadge = pickInfo ? `<div class="member-pick-badge">${pickInfo.pickOrder}</div>` : '';
        const lockIcon = isLocked ? `<div class="member-lock-icon">🔒</div>` : '';

        const posNames = { top:'TOP', jungle:'JGL', middle:'MID', bottom:'BOT', utility:'SUP' };

        if (champ) {
            card.innerHTML = `${pickBadge}${posIcon}${lockIcon}
                <div class="member-inner">
                    <div class="member-champ-img"><img src="https://ddragon.leagueoflegends.com/cdn/${ver}/img/champion/${champ.id}.png" alt="${champ.name}"></div>
                    <div class="member-info">
                        <div class="member-name ${isLocal ? 'you' : ''}">${m.summonerName || 'Bilinmiyor'}</div>
                        <div class="member-champ-name">${champ.name}</div>
                        <div class="member-role">${posNames[pos] || 'Seçiyor...'}</div>
                    </div>
                </div>`;
        } else {
            card.innerHTML = `${pickBadge}${posIcon}
                <div class="member-inner" style="justify-content:center;flex-direction:column;gap:4px;text-align:center;">
                    <div class="member-empty-icon">?</div>
                    <div class="member-name ${isLocal ? 'you' : ''}" style="text-align:center;">${m.summonerName || 'Bilinmiyor'}</div>
                    <div class="member-role">${posNames[pos] || 'Seçiyor...'}</div>
                </div>`;
        }

        allyList.appendChild(card);
    });

    // ---- ENEMY TEAM ----
    const enemyList = document.getElementById('enemyTeamList');
    enemyList.innerHTML = '';
    state.enemy_team.forEach(m => {
        const isLocked = m.isChampionLocked || false;
        const pos = m.assignedPosition || '';
        const champ = m.championId > 0 ? champions.find(c => parseInt(c.key) === m.championId) : null;
        const posNames = { top:'TOP', jungle:'JGL', middle:'MID', bottom:'BOT', utility:'SUP' };
        const posIcon = pos ? `<div class="member-pos-icon"><img src="https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-${pos}.svg" alt="${pos}" onerror="this.parentElement.style.display='none'"></div>` : '';
        const lockIcon = isLocked ? `<div class="member-lock-icon">🔒</div>` : '';

        const card = document.createElement('div');
        card.className = `member-card ${isLocked ? 'locked' : ''}`;

        if (champ) {
            card.innerHTML = `${posIcon}${lockIcon}
                <div class="member-inner">
                    <div class="member-champ-img"><img src="https://ddragon.leagueoflegends.com/cdn/${ver}/img/champion/${champ.id}.png" alt="${champ.name}"></div>
                    <div class="member-info">
                        <div class="member-name">${m.summonerName || 'Düşman'}</div>
                        <div class="member-champ-name">${champ.name}</div>
                        <div class="member-role">${posNames[pos] || ''}</div>
                    </div>
                </div>`;
        } else {
            card.innerHTML = `${posIcon}
                <div class="member-inner" style="justify-content:center;flex-direction:column;gap:4px;text-align:center;">
                    <div class="member-empty-icon">?</div>
                    <div class="member-name" style="text-align:center;">${m.summonerName || 'Düşman'}</div>
                    <div class="member-role">${posNames[pos] || ''}</div>
                </div>`;
        }

        enemyList.appendChild(card);
    });

    // ---- BANS ----
    const allyBans = document.getElementById('allyBansList');
    const enemyBans = document.getElementById('enemyBansList');
    allyBans.innerHTML = '';
    enemyBans.innerHTML = '';

    const maxBans = 5;
    const allyBanData = [];
    const enemyBanData = [];

    if (state.banned_champions && Array.isArray(state.banned_champions)) {
        // Determine local player's teamId from my_team data
        // my_team cells start at 0-4 (teamId=100) or 5-9 (teamId=200)
        // local_player_cell_id < 5 means team 100, >= 5 means team 200
        const localCellId = state.local_player_cell_id ?? 0;
        const localTeamId = localCellId < 5 ? 100 : 200;
        const enemyTeamId = localTeamId === 100 ? 200 : 100;

        state.banned_champions.forEach(ban => {
            if (!ban.championId || ban.championId <= 0) return;
            const champ = champions.find(c => parseInt(c.key) === ban.championId);
            if (!champ) return; // champion data not loaded yet, skip
            if (ban.teamId === localTeamId) allyBanData.push(champ);
            else if (ban.teamId === enemyTeamId) enemyBanData.push(champ);
        });
    }

    // Also collect bans from actions as fallback (for in-progress bans)
    if (state.actions && Array.isArray(state.actions)) {
        const actionBannedIds = new Set(allyBanData.concat(enemyBanData).map(c => parseInt(c.key)));
        state.actions.flat().forEach(a => {
            if (a.type === 'ban' && a.championId > 0 && !actionBannedIds.has(a.championId)) {
                const champ = champions.find(c => parseInt(c.key) === a.championId);
                if (!champ) return;
                // actorCellId < 5 = team 100
                const localCellId = state.local_player_cell_id ?? 0;
                const localTeamId = localCellId < 5 ? 100 : 200;
                const actorTeamId = a.actorCellId < 5 ? 100 : 200;
                if (actorTeamId === localTeamId) allyBanData.push(champ);
                else enemyBanData.push(champ);
                actionBannedIds.add(a.championId);
            }
        });
    }

    // Fill to 5 slots
    for (let i = 0; i < maxBans; i++) {
        const c = allyBanData[i];
        if (c && c.id) {
            allyBans.innerHTML += `<div class="ban-thumb" title="${c.name} (Banlı)"><img src="https://ddragon.leagueoflegends.com/cdn/${ver}/img/champion/${c.id}.png" alt="${c.name}"></div>`;
        } else {
            allyBans.innerHTML += `<div class="ban-slot-empty"></div>`;
        }
    }

    for (let i = 0; i < maxBans; i++) {
        const c = enemyBanData[i];
        if (c && c.id) {
            enemyBans.innerHTML += `<div class="ban-thumb" title="${c.name} (Banlı)"><img src="https://ddragon.leagueoflegends.com/cdn/${ver}/img/champion/${c.id}.png" alt="${c.name}"></div>`;
        } else {
            enemyBans.innerHTML += `<div class="ban-slot-empty"></div>`;
        }
    }

    // Re-render champions to keep selection & filtered view correct
    renderChampions();
}

// ==================== GAME STATUS ====================
function updateGameStatus(status) {
    const phase = status?.game_phase || 'None';

    document.getElementById('gameStatusRow').classList.remove('hidden');

    const ad = status?.additional_data;
    if (ad) {
        const name = ad.summoner_name;
        const tag = ad.summoner_tag;
        const iconId = ad.profile_icon_id;
        const level = ad.summoner_level;
        const tier = ad.ranked_tier;
        const div = ad.ranked_division;
        const lp = ad.ranked_lp;

        if (name && name !== 'Unknown') {
            document.getElementById('accountInfoRow').classList.remove('hidden');
            document.getElementById('accountNameEl').textContent = tag ? `${name}#${tag}` : name;

            let lvlTxt = `Seviye: ${level || '--'}`;
            if (tier && tier !== 'UNRANKED') {
                const t = tier.charAt(0) + tier.slice(1).toLowerCase();
                lvlTxt += ` • ${t}${div ? ' '+div : ''}${lp !== undefined ? ' ('+lp+' LP)' : ''}`;
            }
            document.getElementById('accountLevelEl').textContent = lvlTxt;

            if (iconId > 0) {
                const ver = window.DD_VERSION || '15.1.1';
                document.getElementById('accountAvatarWrap').classList.remove('hidden');
                document.getElementById('accountAvatarImg').src = `https://ddragon.leagueoflegends.com/cdn/${ver}/img/profileicon/${iconId}.png`;
            }

            if (tier && tier !== 'UNRANKED') {
                const tierL = tier.toLowerCase();
                document.getElementById('rankBadgeWrap').classList.remove('hidden');
                document.getElementById('rankBadgeImg').src = `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${tierL}.png`;
            }
        }
    }

    const statusMap = {
        'None':            { icon: '⏳', title: 'Bekleniyor',       sub: 'Oyunda değil' },
        'Lobby':           { icon: '🏠', title: 'Lobide',           sub: 'Kuyruk bekleniyor' },
        'Matchmaking':     { icon: '🔍', title: 'Maç Aranıyor',     sub: 'Oyuncu aranıyor...' },
        'ReadyCheck':      { icon: '✋', title: 'Hazır Kontrolü',   sub: 'Maçı kabul et!' },
        'ChampSelect':     { icon: '🎯', title: 'Şampiyon Seçimi',  sub: 'Seç veya banla' },
        'InProgress':      { icon: '⚔️', title: 'Oyunda',           sub: 'Maç devam ediyor' },
        'WaitingForStats': { icon: '📊', title: 'Oyun Bitiyor',     sub: 'İstatistikler bekleniyor' },
        'EndOfGame':       { icon: '🏆', title: 'Oyun Bitti',       sub: 'Maç tamamlandı' }
    };

    const info = statusMap[phase] || statusMap['None'];
    document.getElementById('gsIcon').textContent = info.icon;
    document.getElementById('gsTitle').textContent = info.title;
    document.getElementById('gsSub').textContent = info.sub;

    // Queue panel visibility
    const queuePanel = document.getElementById('queuePanel');
    if (phase === 'None' || phase === 'Lobby' || phase === 'Matchmaking') {
        queuePanel?.classList.remove('hidden');
        if (phase === 'Matchmaking') {
            isQueueActive = true;
            document.getElementById('startQBtn').disabled = true;
            document.getElementById('stopQBtn').disabled = false;
            document.getElementById('queueSearching').classList.remove('hidden');
        } else {
            isQueueActive = false;
            document.getElementById('startQBtn').disabled = false;
            document.getElementById('stopQBtn').disabled = true;
            document.getElementById('queueSearching').classList.add('hidden');
            document.querySelectorAll('input[name="qType"]').forEach(i => i.disabled = false);
        }
    } else {
        queuePanel?.classList.add('hidden');
    }

    // Show champion select layout
    if (phase === 'ChampSelect') {
        document.getElementById('csLayout').classList.add('visible');
        if (champions.length > 0) renderChampions();
    } else {
        document.getElementById('csLayout').classList.remove('visible');
        clearSelection();
    }
}

// ==================== QUEUE ====================
async function startQueue() {
    const sel = document.querySelector('input[name="qType"]:checked');
    if (!sel) { showToast('Kuyruk türü seçin', 'error'); return; }

    const qid = parseInt(sel.value);
    const names = { 420:'Ranked Solo/Duo', 440:'Ranked Flex', 400:'Normal Draft', 430:'Normal Blind', 450:'ARAM' };

    try {
        const { error } = await sb.from('remote_commands').insert({
            session_code: SESSION_CODE, command_type: 'start_queue', champion_id: qid, executed: false
        });
        if (error) throw error;

        isQueueActive = true;
        document.getElementById('startQBtn').disabled = true;
        document.getElementById('stopQBtn').disabled = false;
        document.getElementById('queueSearching').classList.remove('hidden');
        document.querySelectorAll('input[name="qType"]').forEach(i => i.disabled = true);
        showToast(`${names[qid]} kuyruğu başlatıldı`, 'success');
    } catch(e) {
        showToast('Kuyruk başlatılamadı: ' + e.message, 'error');
    }
}

async function stopQueue() {
    // Immediate UI
    isQueueActive = false;
    document.getElementById('startQBtn').disabled = false;
    document.getElementById('stopQBtn').disabled = true;
    document.getElementById('queueSearching').classList.add('hidden');
    document.querySelectorAll('input[name="qType"]').forEach(i => i.disabled = false);

    try {
        const { error } = await sb.from('remote_commands').insert({
            session_code: SESSION_CODE, command_type: 'stop_queue', champion_id: 0, executed: false
        });
        if (error) throw error;
        showToast('Kuyruk durduruldu', 'success');
    } catch(e) {
        showToast('Kuyruk durdurulamadı', 'error');
        // Revert
        isQueueActive = true;
        document.getElementById('startQBtn').disabled = true;
        document.getElementById('stopQBtn').disabled = false;
        document.getElementById('queueSearching').classList.remove('hidden');
        document.querySelectorAll('input[name="qType"]').forEach(i => i.disabled = true);
    }
}

// ==================== POSITIONS ====================
async function updatePositions() {
    const p = document.getElementById('primaryPos').value;
    const s = document.getElementById('secondaryPos').value;
    if (!p || !s) return;
    if (p === s) { showToast('Birincil ve ikincil pozisyon farklı olmalı', 'error'); return; }

    try {
        const { error } = await sb.from('remote_commands').insert([{
            session_code: SESSION_CODE, command_type: 'update_positions',
            additional_data: { primary_position: p, secondary_position: s }
        }]);
        if (error) throw error;
        showToast('Pozisyon tercihleri güncellendi!', 'success');
    } catch(e) {
        showToast('Pozisyon güncellenemedi', 'error');
    }
}

// ==================== LOBBY ====================
function renderLobbyMembers(lobbyState) {
    const card = document.getElementById('lobbyCard');
    const list = document.getElementById('lobbyList');
    const posCard = document.getElementById('posCard');

    if (!lobbyState?.lobby_members?.length) {
        card.classList.add('hidden');
        return;
    }

    card.classList.remove('hidden');
    list.innerHTML = lobbyState.lobby_members.map(m => {
        const badges = [];
        if (m.isLeader) badges.push('<span style="color:var(--gold);">👑</span>');
        if (m.isLocalPlayer) badges.push('<span style="background:rgba(11,198,227,0.2); color:var(--blue); font-size:10px; padding:1px 6px; border-radius:4px; font-weight:700;">SEN</span>');
        return `<div class="lobby-member-row">
            <span style="font-size:16px;">👤</span>
            <span style="font-size:13px; font-weight:600; color:${m.isLocalPlayer ? 'var(--blue)' : 'var(--text)'}; flex:1;">${m.summonerName}</span>
            ${badges.join('')}
        </div>`;
    }).join('');

    const qid = lobbyState.queue_id;
    if (qid === 420 || qid === 440) {
        posCard.classList.remove('hidden');
        const lp = lobbyState.local_player_position_preferences;
        if (lp?.primaryPosition) document.getElementById('primaryPos').value = lp.primaryPosition;
        if (lp?.secondaryPosition) document.getElementById('secondaryPos').value = lp.secondaryPosition;
    } else {
        posCard.classList.add('hidden');
    }
}

// ==================== TRADES ====================
function handleTradeUpdate(trade) {
    if (trade.state === 'RECEIVED') showTradeNotif(trade, 'incoming');
    else if (trade.state === 'SENT') showTradeNotif(trade, 'outgoing');
    else if (trade.state === 'ACCEPTED') { updateTradeNotif(trade.id, '✅ ' + trade.to_summoner_name + ' kabul etti!'); setTimeout(() => removeTradeNotif(trade.id), 3000); }
    else if (trade.state === 'DECLINED') { updateTradeNotif(trade.id, '❌ ' + trade.to_summoner_name + ' reddetti'); setTimeout(() => removeTradeNotif(trade.id), 3000); }
    else if (trade.state === 'EXPIRED' || trade.state === 'INVALID') removeTradeNotif(trade.id);
}

function showTradeNotif(trade, dir) {
    const wrap = document.getElementById('tradeNotifWrap');
    if (!wrap || document.getElementById(`trade-${trade.id}`)) return;

    const div = document.createElement('div');
    div.id = `trade-${trade.id}`;
    div.className = `trade-card ${dir}`;
    const typeText = trade.type === 'PICK_ORDER' ? 'Sıra Takası' : 'Şampiyon Takası';

    if (dir === 'incoming') {
        div.innerHTML = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
            <span style="font-size:20px;">${trade.type==='PICK_ORDER'?'🔄':'⚔️'}</span>
            <span style="font-size:13px;font-weight:700;color:var(--gold);">${typeText}</span>
        </div>
        <div style="font-size:13px;color:var(--text);margin-bottom:10px;"><span style="color:var(--blue);font-weight:700;">${trade.from_summoner_name}</span> takas istiyor</div>
        <div class="trade-btns">
            <button class="trade-btn trade-btn-yes" onclick="acceptTrade(${trade.trade_id})">✅ Kabul</button>
            <button class="trade-btn trade-btn-no" onclick="declineTrade(${trade.trade_id})">❌ Reddet</button>
        </div>
        <div id="ttimer-${trade.id}" style="text-align:center;margin-top:8px;font-size:11px;color:#f0ad4e;font-family:monospace;"></div>`;
    } else {
        div.innerHTML = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
            <span style="font-size:20px;">⏳</span>
            <span style="font-size:13px;font-weight:700;color:var(--gold);">${typeText}</span>
        </div>
        <div style="font-size:13px;color:var(--text);">Bekleniyor: <span style="color:var(--blue);font-weight:700;">${trade.to_summoner_name}</span></div>
        <div id="ttimer-${trade.id}" style="text-align:center;margin-top:8px;font-size:11px;color:#f0ad4e;font-family:monospace;"></div>`;
    }

    wrap.appendChild(div);
    if (trade.expires_at) startTradeTimer(trade.id, trade.expires_at);
}

function updateTradeNotif(tradeId, msg) {
    const n = document.getElementById(`trade-${tradeId}`);
    if (!n) return;
    const body = n.querySelector('div:nth-child(2)');
    const btns = n.querySelector('.trade-btns');
    if (body) body.textContent = msg;
    if (btns) btns.remove();
}

function removeTradeNotif(tradeId) {
    const n = document.getElementById(`trade-${tradeId}`);
    if (n) { n.style.opacity = '0'; n.style.transform = 'translateX(80px)'; n.style.transition = 'all 0.3s'; setTimeout(() => n.remove(), 300); }
}

function startTradeTimer(tradeId, expiresAt) {
    const el = document.getElementById(`ttimer-${tradeId}`);
    if (!el) return;
    const tick = () => {
        const left = Math.max(0, Math.floor((new Date(expiresAt)-Date.now())/1000));
        if (left > 0) { el.textContent = left+'s'; setTimeout(tick, 1000); }
        else { el.textContent = 'Süresi doldu'; removeTradeNotif(tradeId); }
    };
    tick();
}

async function acceptTrade(tradeId) {
    try {
        await sb.from('remote_commands').insert([{ session_code: SESSION_CODE, command_type: 'accept_trade', trade_id: tradeId }]);
        showToast('Takas kabul edildi!', 'success');
    } catch(e) { showToast('Takas kabul edilemedi', 'error'); }
}

async function declineTrade(tradeId) {
    try {
        await sb.from('remote_commands').insert([{ session_code: SESSION_CODE, command_type: 'decline_trade', trade_id: tradeId }]);
        showToast('Takas reddedildi', 'success');
    } catch(e) { showToast('Takas reddedilemedi', 'error'); }
}

// Trade modal
function openTradeModal(cellId, name, canTrade=true, localPicked=false, targetPicked=false) {
    if (!canTrade) { showToast('Bu oyuncuyla takas yapılamaz', 'error'); return; }
    tradeModal = { targetCellId: cellId, targetName: name, selectedType: null };

    const canPO = !localPicked && !targetPicked;
    const canCH = localPicked && targetPicked;

    document.getElementById('tradeOptPickOrder').className = 'trade-type-opt' + (!canPO ? ' dis' : '');
    document.getElementById('tradeOptChampion').className = 'trade-type-opt' + (!canCH ? ' dis' : '');
    document.getElementById('tradePreview').textContent = 'Takas türü seçin';
    document.getElementById('tradeConfirmBtn').disabled = true;
    document.getElementById('tradeConfirmBtn').style.opacity = '0.4';

    if (canPO && !canCH) selectTradeType('PICK_ORDER');
    else if (!canPO && canCH) selectTradeType('CHAMPION');

    document.getElementById('tradeModal').classList.add('active');
}

function closeTradeModal() {
    document.getElementById('tradeModal').classList.remove('active');
}

function selectTradeType(type) {
    const opt = document.getElementById(type==='PICK_ORDER' ? 'tradeOptPickOrder' : 'tradeOptChampion');
    if (opt.classList.contains('dis')) {
        showToast(type==='PICK_ORDER' ? 'Sıra takası: her ikisi de henüz seçmemiş olmalı' : 'Şampiyon takası: her ikisi de seçmiş olmalı', 'error');
        return;
    }
    tradeModal.selectedType = type;
    document.getElementById('tradeOptPickOrder').classList.toggle('sel', type==='PICK_ORDER');
    document.getElementById('tradeOptChampion').classList.toggle('sel', type==='CHAMPION');

    const preview = document.getElementById('tradePreview');
    if (type === 'PICK_ORDER') preview.innerHTML = `Senin sıran ↔️ ${tradeModal.targetName}'in sırası`;
    else preview.innerHTML = `Senin şampiyonun ↔️ ${tradeModal.targetName}'in şampiyonu`;

    document.getElementById('tradeConfirmBtn').disabled = false;
    document.getElementById('tradeConfirmBtn').style.opacity = '1';
}

async function confirmTrade() {
    if (!tradeModal.selectedType || !tradeModal.targetCellId) return;
    try {
        await sb.from('remote_commands').insert([{
            session_code: SESSION_CODE, command_type: 'initiate_trade',
            trade_type: tradeModal.selectedType, target_cell_id: tradeModal.targetCellId, details: {}
        }]);
        showToast(`${tradeModal.targetName}'e takas isteği gönderildi`, 'success');
        closeTradeModal();
    } catch(e) { showToast('Takas isteği gönderilemedi', 'error'); }
}

// ==================== UI HELPERS ====================
function setConnStatus(connected) {
    document.getElementById('connDot').className = 'dot ' + (connected ? 'on' : 'off');
    document.getElementById('connText').textContent = connected ? 'Bağlı' : 'Bağlantı Kesildi';
}

let toastTimeout = null;
function showToast(msg, type='success') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = `toast toast-${type} show`;
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => el.classList.remove('show'), type==='error' ? 4000 : 2500);
}

function setupSearch() {
    document.getElementById('csSearch').addEventListener('input', e => renderChampions(e.target.value));
}

// ==================== QR SCANNER ====================
let html5QrCode = null;

function openQRScanner() {
    document.getElementById('qrModal').classList.add('active');
    html5QrCode = new Html5Qrcode("qr-reader");
    html5QrCode.start({ facingMode:"environment" }, { fps:10, qrbox:{width:250,height:250} }, onQRSuccess, ()=>{})
        .catch(() => showQRStatus('Kamera erişimi başarısız. İzinleri kontrol edin.', '#ff6b7a'));
}

function closeQRScanner() {
    document.getElementById('qrModal').classList.remove('active');
    if (html5QrCode) { html5QrCode.stop().then(() => { html5QrCode.clear(); html5QrCode = null; }).catch(()=>{}); }
}

function onQRSuccess(text) {
    let code = '';
    try {
        if (text.includes('autrex.kesug.com/remote')) {
            code = new URL(text).searchParams.get('code');
        } else if (/^[A-Z0-9]{6}$/i.test(text)) {
            code = text.toUpperCase();
        }
    } catch(_){}
    if (code && /^[A-Z0-9]{6}$/.test(code)) {
        showQRStatus('✓ Kod algılandı! Bağlanılıyor...', 'var(--blue)');
        if (html5QrCode) html5QrCode.stop().then(() => window.location.href = '?code=' + code);
    } else {
        showQRStatus('Geçersiz QR kodu. Lütfen Autrex uygulamasındaki kodu tarayın.', 'var(--red)');
    }
}

function showQRStatus(msg, color) {
    const el = document.getElementById('qrStatus');
    el.textContent = msg;
    el.style.display = 'block';
    el.style.background = 'rgba(0,0,0,0.5)';
    el.style.color = color;
    el.style.border = `1px solid ${color}`;
    el.style.borderRadius = '6px';
}

document.addEventListener('keydown', e => { if (e.key==='Escape') closeQRScanner(); });

// ==================== START ====================
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
</script>
<?php endif; ?>

<!-- QR Modal (login page too) -->
<div class="qr-modal" id="qrModal">
    <div class="qr-box">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <div style="font-size:18px;font-weight:700;color:var(--gold);">📷 QR Kodu Tara</div>
            <button onclick="closeQRScanner()" style="background:rgba(255,255,255,0.1);border:none;color:var(--text);width:32px;height:32px;border-radius:8px;cursor:pointer;font-size:18px;">✕</button>
        </div>
        <div id="qr-reader"></div>
        <div id="qrStatus" style="display:none;margin-top:12px;padding:10px;border-radius:6px;text-align:center;font-size:13px;"></div>
        <div style="margin-top:12px;text-align:center;color:var(--text-dim);font-size:12px;">Kameranızı Autrex masaüstü uygulamasındaki QR koduna doğrultun</div>
    </div>
</div>

<?php if (!$sessionCode): ?>
<script>
let html5QrCode = null;
function openQRScanner() {
    document.getElementById('qrModal').classList.add('active');
    html5QrCode = new Html5Qrcode("qr-reader");
    html5QrCode.start({ facingMode:"environment" }, { fps:10, qrbox:{width:250,height:250} },
        function(text) {
            let code = '';
            try {
                if (text.includes('autrex')) code = new URL(text).searchParams.get('code');
                else if (/^[A-Z0-9]{6}$/i.test(text)) code = text.toUpperCase();
            } catch(_){}
            if (code && /^[A-Z0-9]{6}$/.test(code)) {
                if (html5QrCode) html5QrCode.stop().then(() => window.location.href = '?code='+code);
            }
        }, ()=>{}).catch(()=>{});
}
function closeQRScanner() {
    document.getElementById('qrModal').classList.remove('active');
    if (html5QrCode) { html5QrCode.stop().catch(()=>{}); html5QrCode = null; }
}
document.addEventListener('keydown', e => { if(e.key==='Escape') closeQRScanner(); });
</script>
<?php endif; ?>

</body>
</html>