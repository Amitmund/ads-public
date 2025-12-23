# ads-public
my own ads-data repo, where the file will be called from website's link.

# Note
- keeping it public, because anyway this can be accessable via inspect. So, keeping both the script on the public repo.

# ads-systems
my own ads-system details.

# Notes:
- Create two files: ads-data.js (this will be having details about images data, like image link, descriptions and size.). This you can keep in the git public location so all the site can access it. So keep in a public repo.
- create: ads-gallery.js (Its need to be part of the project, so that it can render.)
- Add this to your head file:
  ```
    <script defer src="https://cdn.jsdelivr.net/gh/Amitmund/ads-public@main/ads-data.js"></script>
    <script defer src="https://cdn.jsdelivr.net/gh/Amitmund/ads-public@main/ads-gallery.js"></script>
  ```
- And add this section in your html.
  ```
  <section id="ads"></section>
  ```

# Result:
- I have tested this one and works perfectly.

# We are going with json file and nginx mapping, (where want to control caching):

```
server {
    listen 443 ssl;
    server_name ads.yourdomain.com;

    root /var/www/ads-config;

    location = /ads-domain-map.json {

        # Serve file
        default_type application/json;

        # 🔥 STRONG no-cache policy
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;

        # Allow revalidation
        etag on;
        if_modified_since exact;

        # Security
        add_header X-Content-Type-Options "nosniff" always;

        # Logging (optional but useful)
        access_log /var/log/nginx/ads-config-access.log;
    }
}
```
