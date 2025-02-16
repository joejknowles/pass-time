Setting up a new EC2

1. Launch EC2
 - Amazon linux 2023, t2.micro
 - 20GB storage
 - With advanced, user data script for swap space
   - ```
        #!/bin/bash
        set -e  # Exit on any error

        # Create a 4GB swap file
        fallocate -l 4G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=4096

        # Set correct permissions
        chmod 600 /swapfile

        # Format as swap space
        mkswap /swapfile

        # Enable swap
        swapon /swapfile

        # Make it persistent
        echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab

        # Set swappiness to reduce swap usage unless necessary
        sysctl -w vm.swappiness=10
        echo 'vm.swappiness=10' >> /etc/sysctl.conf
```
2. Install git: `sudo dnf install -y git`
3. Clone repo – use the https url, not SSH
4. Install node: `sudo dnf install -y nodejs`
5. Install yarn: `sudo npm install -g yarn`
6. Copy ~/.zshrc
    - `cat ~/.zshrc` in first env
    - `nano ~/.zshrc`, and paste in new env
    - `source ~/.zshrc`
    - echo 'source ~/.zshrc' >> ~/.bash_profile
    - source ~/.bash_profile
7. Install pm2: `npm install -g pm2`
8. Setup server:
    - `cd pass-time`
    - `yarn && yarn build`
    - `pm2 start yarn --name "nextjs" -- start`
    - Verify it's running: `pm2 list`
    - `pm2 save`
    - `pm2 startup`, copy the command and run it
    - Verify it restarts OK: `pm2 restart nextjs`
9. Install and setup nginx:
    - `sudo dnf install -y nginx`
    - `sudo systemctl start nginx`
    - `sudo systemctl enable nginx`
    - Check it's running: `sudo systemctl status nginx`
    - add test nginx config: `sudo nano /etc/nginx/conf.d/passti.me.conf`
       ```
       server {
    listen 80;
    server_name passti.me www.passti.me;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
    - test setup: `sudo nginx -t`
    - reload nginx: `sudo systemctl reload nginx` or restart `sudo systemctl restart nginx`
    - test it's running: `sudo systemctl status nginx`

10. Add http security rule for 'my IP' in AWS
11. remove the default nginx page `sudo rm -f /etc/nginx/nginx.conf.default`
12. Visit the EC2 public IP in the browser to verify it's working
13. Setup RDS
    - Create a new RDS instance
    - Choose PostgreSQL, Free tier
    - Set master username and password
    - Set security group to allow inbound traffic from the EC2 security group
    - In additional config – Don't tell AWS to create the DB for you, AWS has name requirements that doesn't allow prismas default naming (type `initial_db` in case it helps create first one)
    - Create the instance
    - Install psql on EC2: `sudo dnf install -y postgresql`
    - Connect with PSQL, with `initial_db`
    - Create the database: `CREATE DATABASE "passtime-production";`
    - Check it's there with `\l`
    - Once it's available, copy the endpoint and add it to the .zshrc file
    - Redeploy the server
14. Copy the database content
15. Setup SSL
    - Copy config from existing: `sudo cat /etc/nginx/conf.d/*.conf`
    - `sudo nano /etc/nginx/conf.d/passti.me.conf`, paste in new env
    - Install certbot `sudo dnf install -y certbot python3-certbot-nginx`
    - Check certificates can be created with `sudo certbot --nginx --staging -d passti.me` (staging is Important, because certbot has a limit of 5 requests per week)
    - If it works, run it for real: `sudo certbot --nginx -d passti.me`

    - Renew SSL with: `sudo certbot renew --dry-run`


