# Cloud-based Storage System

## Initialization
- Create .env from example
- Edit domain in `install.sh`
- Convert to executable `chmod +x install.sh` 
- Execute `./install.sh` to gather SSL Certifications - Ensure domain is redirected to host IP

## Starting up
- Start up production environment with `docker-compose -f docker-compose.prod.yml up --build`
- Start up development environment with `docker-compose up --build` - App will be hosted on port 80 `localhost`
