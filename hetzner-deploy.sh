#!/bin/bash
set -e

echo "=== TPL Factory - Hetzner Deployment Script ==="
echo ""

if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

if ! command -v docker compose &> /dev/null; then
    echo "Docker Compose not found. Please install Docker Compose."
    exit 1
fi

if [ ! -f .env ]; then
    echo "Creating .env file..."
    DB_PASS=$(openssl rand -base64 32 | tr -d '/+=')
    SESSION_SEC=$(openssl rand -base64 32 | tr -d '/+=')
    
    cat > .env << EOF
DB_PASSWORD=${DB_PASS}
SESSION_SECRET=${SESSION_SEC}
FIREBASE_SERVICE_ACCOUNT=
EOF
    
    echo ".env file created with secure random passwords."
    echo "IMPORTANT: Edit .env to add your FIREBASE_SERVICE_ACCOUNT if needed."
    echo ""
fi

echo "Building and starting services..."
docker compose up -d --build

echo ""
echo "Waiting for database to be ready..."
sleep 10

echo "Running database migrations..."
docker compose exec app sh -c "npx drizzle-kit push --force"

echo ""
echo "=== Deployment Complete ==="
echo "Application is running on port 80"
echo ""
echo "Next steps:"
echo "1. Point your domain DNS to this server's IP"
echo "2. Set up SSL with: certbot --nginx -d yourdomain.com"
echo "3. Edit .env to add FIREBASE_SERVICE_ACCOUNT for notifications"
echo ""
