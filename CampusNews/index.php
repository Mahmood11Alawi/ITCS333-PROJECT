
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Campus Hub API</title>
    <meta charset="UTF-8">
  </head>
  <body>
    <?php
    $host = "127.0.0.1";
    $user = getenv("db_user");
    $pass = getenv("db_pass");
    $db = getenv("db_name");

    try {
        $conn = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        echo "<p>✅ Database connected successfully!</p>";
        
        $stmt = $conn->query("SELECT COUNT(*) FROM newscampus");
        $count = $stmt->fetchColumn();
        echo "<p>📰 Total news articles: $count</p>";
        
    } catch(PDOException $e) {
        echo "<p>❌ Connection failed: " . $e->getMessage() . "</p>";
    }
    ?>
    <h2>API Endpoints:</h2>
    <ul>
      <li>GET /api/news.php - List all news (supports pagination with ?page=1&limit=10)</li>
      <li>GET /api/news.php?search=keyword - Search news</li>
      <li>POST /api/news.php - Create new article</li>
      <li>PUT /api/news.php?id=1 - Update article</li>
      <li>DELETE /api/news.php?id=1 - Delete article</li>
    </ul>
  </body>
</html>
