<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$db_file = __DIR__ . '/atbrand.db';
$db = new PDO('sqlite:' . $db_file);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Initialize schema if not exists
$db->exec("
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT DEFAULT 'Men',
    season TEXT DEFAULT '4 Season',
    price REAL NOT NULL,
    original_price REAL,
    cost_price REAL DEFAULT 0,
    fabric TEXT,
    images TEXT DEFAULT '[]',
    colors TEXT DEFAULT '[]',
    is_new INTEGER DEFAULT 0,
    featured INTEGER DEFAULT 0,
    in_stock INTEGER DEFAULT 1,
    stock_quantity INTEGER DEFAULT 10,
    low_stock_threshold INTEGER DEFAULT 3,
    sku TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT DEFAULT 'Sargodha',
    items TEXT NOT NULL DEFAULT '[]',
    subtotal REAL NOT NULL DEFAULT 0,
    delivery_charge REAL DEFAULT 0,
    discount REAL DEFAULT 0,
    total_amount REAL NOT NULL,
    payment_method TEXT DEFAULT 'COD',
    payment_status TEXT DEFAULT 'Unpaid',
    status TEXT DEFAULT 'Pending',
    courier_name TEXT,
    tracking_number TEXT,
    customer_notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS stitching_requests (
    id TEXT PRIMARY KEY,
    request_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    address TEXT NOT NULL,
    city TEXT DEFAULT 'Sargodha',
    unit TEXT DEFAULT 'inches',
    style_selections TEXT DEFAULT '{}',
    measurements TEXT NOT NULL DEFAULT '{}',
    fabric_choice TEXT,
    special_instructions TEXT,
    status TEXT DEFAULT 'Pending',
    stitching_price REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
");

// Determine endpoint
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Strip prefix
$path = preg_replace('#^/api/#', '', $uri);

// 1. ADMIN LOGIN
if ($path === 'admin/login' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';

    if (($username === 'admin' || $username === 'atbrand00@gmail.com') && $password === 'atbrandAdmin2026!') {
        echo json_encode([
            'success' => true,
            'token' => 'atbrand_static_auth_token_hostinger_php_2026',
            'user' => [
                'name' => 'ARSLAN TARIQ',
                'email' => 'atbrand00@gmail.com',
                'role' => 'ADMIN'
            ]
        ]);
        exit;
    }

    http_response_code(401);
    echo json_encode(['error' => 'Invalid username or password']);
    exit;
}

// 2. DASHBOARD STATS
if ($path === 'admin/dashboard-stats' && $method === 'GET') {
    $ordersCount = (int)$db->query("SELECT COUNT(*) FROM orders")->fetchColumn();
    $rev = (float)$db->query("SELECT SUM(total_amount) FROM orders WHERE status != 'Cancelled'")->fetchColumn();
    $activeProd = (int)$db->query("SELECT COUNT(*) FROM products WHERE in_stock = 1")->fetchColumn();
    $pendingOrders = (int)$db->query("SELECT COUNT(*) FROM orders WHERE status = 'Pending'")->fetchColumn();

    $stmt = $db->query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 6");
    $recentOrders = [];
    while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $r['items'] = json_decode($r['items'] ?? '[]', true);
        $recentOrders[] = $r;
    }

    $lowStock = $db->query("SELECT * FROM products WHERE stock_quantity <= low_stock_threshold ORDER BY stock_quantity ASC LIMIT 10")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'stats' => [
            'totalRevenue' => $rev ?: 0,
            'totalOrders' => $ordersCount,
            'activeProducts' => $activeProd,
            'pendingOrders' => $pendingOrders,
            'recentOrders' => $recentOrders,
            'lowStockProducts' => $lowStock
        ]
    ]);
    exit;
}

// 3. GET / ADD PRODUCTS
if ($path === 'products') {
    if ($method === 'GET') {
        $stmt = $db->query("SELECT * FROM products ORDER BY created_at DESC");
        $prods = [];
        while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $r['images'] = json_decode($r['images'] ?? '[]', true);
            $r['colors'] = json_decode($r['colors'] ?? '[]', true);
            $r['isNew'] = (bool)$r['is_new'];
            $r['featured'] = (bool)$r['featured'];
            $r['in_stock'] = (bool)$r['in_stock'];
            $r['originalPrice'] = $r['original_price'];
            $prods[] = $r;
        }
        echo json_encode(['success' => true, 'count' => count($prods), 'products' => $prods]);
        exit;
    }

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? ('at-' . time());
        $stmt = $db->prepare("
            INSERT INTO products (id, name, type, category, season, price, original_price, cost_price, fabric, images, colors, is_new, featured, in_stock, stock_quantity, low_stock_threshold, sku)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $id,
            $input['name'] ?? '',
            $input['type'] ?? 'Unstitched',
            $input['category'] ?? 'Men',
            $input['season'] ?? '4 Season',
            (float)($input['price'] ?? 0),
            isset($input['originalPrice']) ? (float)$input['originalPrice'] : null,
            (float)($input['cost_price'] ?? 0),
            $input['fabric'] ?? '',
            json_encode($input['images'] ?? []),
            json_encode($input['colors'] ?? []),
            !empty($input['isNew']) ? 1 : 0,
            !empty($input['featured']) ? 1 : 0,
            isset($input['in_stock']) && !$input['in_stock'] ? 0 : 1,
            (int)($input['stock_quantity'] ?? 10),
            (int)($input['low_stock_threshold'] ?? 3),
            $input['sku'] ?? ('AT-SKU-' . strtoupper($id))
        ]);
        echo json_encode(['success' => true, 'id' => $id, 'message' => 'Product saved']);
        exit;
    }
}

// 4. DELETE PRODUCT
if (preg_match('#^products/(.+)$#', $path, $matches) && $method === 'DELETE') {
    $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$matches[1]]);
    echo json_encode(['success' => true, 'message' => 'Product deleted']);
    exit;
}

// 5. GET / CREATE ORDERS
if ($path === 'orders') {
    if ($method === 'GET') {
        $stmt = $db->query("SELECT * FROM orders ORDER BY created_at DESC");
        $orders = [];
        while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $r['items'] = json_decode($r['items'] ?? '[]', true);
            $orders[] = $r;
        }
        echo json_encode(['success' => true, 'orders' => $orders]);
        exit;
    }

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $order_num = 'AT-' . substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ23456789'), 0, 6);
        $id = uniqid('ord_', true);
        $stmt = $db->prepare("
            INSERT INTO orders (id, order_number, customer_name, phone, address, city, items, subtotal, delivery_charge, discount, total_amount, payment_method)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $id,
            $order_num,
            trim($input['customer_name'] ?? ''),
            trim($input['phone'] ?? ''),
            trim($input['address'] ?? ''),
            trim($input['city'] ?? 'Sargodha'),
            json_encode($input['items'] ?? []),
            (float)($input['subtotal'] ?? $input['total_amount'] ?? 0),
            (float)($input['delivery_charge'] ?? 0),
            (float)($input['discount'] ?? 0),
            (float)($input['total_amount'] ?? 0),
            $input['payment_method'] ?? 'COD'
        ]);

        echo json_encode(['success' => true, 'data' => ['id' => $id, 'order_id' => $order_num, 'order_number' => $order_num, 'status' => 'Pending']]);
        exit;
    }
}

// 6. TRACK ORDER
if (preg_match('#^orders/track/(.+)$#', $path, $matches) && $method === 'GET') {
    $stmt = $db->prepare("SELECT * FROM orders WHERE UPPER(order_number) = UPPER(?)");
    $stmt->execute([trim($matches[1])]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($order) {
        $order['items'] = json_decode($order['items'] ?? '[]', true);
        echo json_encode(['success' => true, 'order' => $order]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Order not found']);
    }
    exit;
}

// 7. UPDATE ORDER STATUS
if (preg_match('#^orders/(.+)/status$#', $path, $matches) && ($method === 'PATCH' || $method === 'POST')) {
    $input = json_decode(file_get_contents('php://input'), true);
    $status = $input['status'] ?? 'Pending';
    $courier = $input['courier_name'] ?? null;
    $tracking = $input['tracking_number'] ?? null;
    $stmt = $db->prepare("UPDATE orders SET status = ?, courier_name = COALESCE(?, courier_name), tracking_number = COALESCE(?, tracking_number), updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    $stmt->execute([$status, $courier, $tracking, $matches[1]]);
    echo json_encode(['success' => true, 'message' => 'Status updated']);
    exit;
}

// 8. FILE UPLOADS
if ($path === 'upload' && $method === 'POST') {
    $uploadDir = __DIR__ . '/uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    $urls = [];
    if (!empty($_FILES['images'])) {
        $files = $_FILES['images'];
        $count = is_array($files['name']) ? count($files['name']) : 1;
        for ($i = 0; $i < $count; $i++) {
            $name = is_array($files['name']) ? $files['name'][$i] : $files['name'];
            $tmp = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
            $ext = pathinfo($name, PATHINFO_EXTENSION);
            $cleanName = preg_replace('/[^a-zA-Z0-9]/', '-', pathinfo($name, PATHINFO_FILENAME));
            $filename = $cleanName . '-' . time() . '-' . rand(100, 999) . '.' . $ext;
            if (move_uploaded_file($tmp, $uploadDir . $filename)) {
                $urls[] = '/api/uploads/' . $filename;
            }
        }
    }
    echo json_encode(['success' => true, 'urls' => $urls]);
    exit;
}

// 9. SERVE UPLOADED FILES
if (preg_match('#^uploads/(.+)$#', $path, $matches)) {
    $file = __DIR__ . '/uploads/' . basename($matches[1]);
    if (file_exists($file)) {
        $mime = mime_content_type($file);
        header('Content-Type: ' . $mime);
        readfile($file);
        exit;
    }
}

// Default 404
http_response_code(404);
echo json_encode(['error' => 'API endpoint not found: ' . $path]);
