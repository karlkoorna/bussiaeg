![Bussiaeg.ee logo](https://raw.githubusercontent.com/karlkoorna/bussiaeg/master/web/public/assets/logo-single.svg?sanitize=true)

Kogu Eesti ühistranspordi väljumisajad ühes kohas.

## Prerequisites 📄

|  Name   | Version |
| :-----: | :-----: |
| Node.js |   12    |
|  MySQL  |   8.3   |
|  NGINX  |  1.17   |
| OpenSSL |   1.1   |

### MySQL

**Database and user**

```sql
CREATE DATABASE bussiaeg;
CREATE USER 'bussiaeg'@'localhost' IDENTIFIED WITH mysql_native_password BY 'pA$$w0rD';
GRANT ALL PRIVILEGES ON bussiaeg.* TO 'bussiaeg'@'localhost';
```

**Server configuration**

```ini
[mysqld]
local-infile = 1
secure-file-priv = ""
group_concat_max_len = 65536
innodb_buffer_pool_size = 2G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
```

### NGINX

Template files for development (`nginx.dev.conf`) and production (`nginx.pro.conf`) to be adapted to installed NGINX.

## Production 💦

Populate `.env` by example `.env.example` in all modules.

Run setup in production mode.

```bash
$ ./setup.sh
```

Start all modules in production mode.

```bash
$ ./start.sh
```

## Development 🔥

*Note: For secure development `ca.crt` must be added to the trusted authorities store.*\
*Note: HTTP headers do not work if the HTTPS certificate is insecure.*\
*Note: Deleting `tmp/update` will force a data update on next launch.*

Direct `devaeg.ee` and `api.devaeg.ee` to the local or public IP.

Populate `.env` by example `.env.example` in all modules.

Run setup in development mode.

```bash
$ ./setup.sh dev
```

Start all modules in development mode.

```bash
$ ./start.sh dev
```
