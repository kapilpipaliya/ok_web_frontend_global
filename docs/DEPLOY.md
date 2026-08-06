generate spf: https://mxtoolbox.com/SPFRecordGenerator.aspx
but its not valid syntax fix it:
SPF Syntax Validator:
https://vamsoft.com/support/tools/spf-syntax-validator
Generate DMAC Record:
https://dmarcguide.globalcyberalliance.org

follow this steps:
Unlock High Inbox Delivery 💯 Build SMTP Server with CyberPanel & Send Bulk Emails | CyberPanel Guide
https://www.youtube.com/watch?v=Q37-qeYdiYY
Notes while setup first time:
1. on reverse dns set mail.decodeui.io
2. we need to setup spf and DKIM1 and DMARC1 records.
on initial configuration on cyberpanel use: mail.decodeui.io (first we neet to setup *.decodeui.io in dns)
Test score should be 10/10:
https://www.mail-tester.com

sudo hostnamectl set-hostname mail.decodeui.io
sudo nano /etc/hosts
# https://cyberpanel.net/KnowledgeBase/home/install-cyberpanel/
sudo apt update && sudo apt upgrade -y
sh <(curl https://cyberpanel.net/install.sh || wget -O - https://cyberpanel.net/install.sh)
https://mail.decodeui.io:8090/
https://mail.decodeui.io:7080/
to generate admpass use command: /usr/local/lsws/admin/misc/admpass.sh
after email setup we need to setup app server:
1. install java, neo4j, start and change password (connect with ssh in editor, forward two port 7474, 7687). 
   sudo apt install openjdk-25-jdk
2. install node using volta
3. setup git
   sudo apt install git -y
   authenticate git, create a new ssh key in .ssh folder and upload public key to git
4. clone project, create .env file, update .env file for email and db, install packages (npm i --force),  install playwright (npx playwright install), build,  install dotenv globally (npm install -g dotenv-cli) and start
export NODE_OPTIONS="--max-old-space-size=4096" if build failed.
5. go do to admin subdomain, login and create www subdomain.
## Media optimization (images + videos)
- Images use Sharp (npm dependency). Videos use system **ffmpeg** and **ffprobe**.
- Install on Ubuntu/Debian deploy hosts: `sudo apt install -y ffmpeg`
- Confirm with `ffmpeg -version` and `ffprobe -version` before enabling video optimization in Global Settings → Media Optimization.
- Video variants and posters are generated asynchronously by the media worker (same BullMQ queue as images).
- After changing the encoding pipeline (formats, ladders, quality defaults), bump `CURRENT_MEDIA_PROCESSING_VERSION` in `src/lib/files/mediaOptimizationConfig.ts`, deploy, then run **Global Settings → Media Optimization → Backfill** to requeue Files with a lower `processingVersion`.
## SSL Setup
- even if we don't use domain without subdomain, we still need certificate for it, else redirect from https://decodeui.io to htts://www.decodeui.io will not work.
- Setup a wildcard domain including free SSL | Let's Encrypt: [YouTube Tutorial](https://www.youtube.com/watch?v=oJ_sP9y9KWo)
  git clone https://github.com/acmesh-official/acme.sh.git (not recommanded)
  curl https://get.acme.sh | sh -s email=admin@decodecommerce.com
  ./acme.sh --install -m kapil.pipaliya@yahoo.com
  Setup default certification authority
  acme.sh --issue -d decodeui.io -d *.decodeui.io --dns  --yes-I-know-dns-manual-mode-enough-go-ahead-please --set-default-ca --server letsencrypt
  Issue cert
  acme.sh --issue -d decodeui.io -d *.decodeui.io --dns  --yes-I-know-dns-manual-mode-enough-go-ahead-please
  add TXT record to dns.
  Renew cert
  acme.sh --issue -d decodeui.io -d *.decodeui.io --dns  --yes-I-know-dns-manual-mode-enough-go-ahead-please --renew
  It will generate keys like:
  our cert is in: /root/.acme.sh/decodeui.io_ecc/*.decodeui.io.cer 	Just your domain cert 
  our cert key is in: /root/.acme.sh/decodeui.io_ecc/*.decodeui.io.key Private key (sensitive!)
  The intermediate CA cert is in: /root/.acme.sh/decodeui.io_ecc/ca.cer Intermediate cert(s) only
  And the full-chain cert is in: /root/.acme.sh/decodeui.io_ecc/fullchain.cer Domain cert + intermediate chain
  Past your fullchain.cer and key on cyberpanel

  for renew do:
  acme.sh --renew -d decodeui.io --ecc --force

 more morden way:
 export CF_Token="cfut_hKKndcotBPQpcLYf0W4qkSI1sFB5yNFRgb7nd1dTb62b0e49"
export CF_Account_ID="7c8f865ea09c4f834697698956f9ca3f" no need
export CF_Zone_ID="9b2bc4649dffd55917a58650c18103c9" no need
root@mail:~/ok_web_frontend_global# acme.sh --issue \
  --dns dns_cf \
  -d decodeui.io \
  -d '*.decodeui.io'

export HETZNER_TOKEN="WDTRi2BDTQdh7D8wUNxg46eG38SGqHsL8jkROJMiO3fogHRDlXNbA9xMgOSiWNeu"
acme.sh --issue \
  --dns dns_hetznercloud \
  -d decodecommerce.com \
  -d '*.decodecommerce.com'

5. configure cyberpanel to use this server as reverse proxy (rewrite rule)
RewriteEngine On

# Redirect to www if no subdomain is present
RewriteCond %{HTTP_HOST} ^decodeui\.io$ [NC]
RewriteRule ^(.*)$ https://www.decodeui.io/$1 [R=301,L]

# Force HTTPS
RewriteCond %{HTTPS} !=on
RewriteRule ^/?(.*) https://%{SERVER_NAME}/$1 [R,L]

# Proxy requests to internal server
# RewriteRule ^(.*)$ http://decodeuiio/$1 [P,NE,L]
configure from openlightspeed instead
6. configure openlight speed to serve all subdomains.
   Server Configuration -> External App -> New -> Web Server -> 
   name: decodeuiio
   Address: localhost:3001
   Max Connections: 2000
   Initial Request Timeout (secs) 100
   Retry Timeout (secs) 2
   Listners -> default -> decodeui.io -> decodeui.io, *.decodeui.io
   do in other listners too
   Graceful restart
7. renew SSL every month, using acme tool for all subdomains.

Node: do not reset admin database because if we change it we need to also reset all the databases too.


If first time run:
/api/setup/adminUserSetup


export NODE_OPTIONS="--max-old-space-size=4096"
