#!/bin/bash

# Generate favicon files of various sizes
echo "Generating favicon files..."

# Create a simple favicon using HTML and convert to PNG
cat > /tmp/favicon.html << EOF
<!DOCTYPE html>
<html>
<head>
  <title>Favicon Generator</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 256px;
      height: 256px;
      background-color: #2c3e50;
    }
    .initials {
      font-family: Arial, sans-serif;
      font-size: 128px;
      font-weight: bold;
      color: white;
    }
  </style>
</head>
<body>
  <div class="initials">CB</div>
</body>
</html>
EOF

# Create a basic square favicon
echo "Creating favicon base..."
convert -size 256x256 xc:#2c3e50 -fill white -gravity center -font Arial -pointsize 128 -annotate +0+0 "CB" /tmp/favicon-256.png

# Create different sizes
echo "Creating favicon sizes..."
convert /tmp/favicon-256.png -resize 16x16 static/favicon-16x16.png
convert /tmp/favicon-256.png -resize 32x32 static/favicon-32x32.png
convert /tmp/favicon-256.png -resize 180x180 static/apple-touch-icon.png
convert /tmp/favicon-256.png -resize 192x192 static/icon-192.png
convert /tmp/favicon-256.png -resize 512x512 static/icon-512.png
convert /tmp/favicon-256.png static/favicon.ico

echo "Favicon files created in the static directory" 