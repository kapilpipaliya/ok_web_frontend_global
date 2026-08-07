Make a zip file and move it to public_html folder and download from cyberpanel admin.

# 1) Find site user
ls -la /home/lessn.in/
# → owner is lessn7431
# 2) Fix file ownership + mode
chown lessn7431:lessn7431 /home/lessn.in/public_html/l.zip
chmod 644 /home/lessn.in/public_html/l.zip
# 3) Fix directory so CyberPanel can read it (this was the real "Not a valid file" fix)
chmod 755 /home/lessn.in/public_html
chmod 711 /home/lessn.in
# 4) Verify
stat -c '%a %U:%G %n' /home/lessn.in /home/lessn.in/public_html /home/lessn.in/public_html/l.zip
sudo -u cyberpanel test -f /home/lessn.in/public_html/l.zip && echo OK || echo FAIL
Generic version for any domain/file:

DOMAIN=lessn.in
FILE=l.zip
USER=$(stat -c '%U' /home/$DOMAIN)
chown $USER:$USER /home/$DOMAIN/public_html/$FILE
chmod 644 /home/$DOMAIN/public_html/$FILE
chmod 755 /home/$DOMAIN/public_html
chmod 711 /home/$DOMAIN

