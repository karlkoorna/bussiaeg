![Bussiaeg.ee logo](https://raw.githubusercontent.com/karlkoorna/bussiaeg/master/web/public/assets/logo-single.svg?sanitize=true)

Kogu Eesti ühistranspordi väljumisajad ühes kohas.

## Prerequisites 📄

|    Name    | Version |
| :--------: | :-----: |
|  Node.js   |   12    |
|   MySQL    |   8.3   |
|    Curl    |  7.58   |
|    Git     |  2.17   |
|  OpenSSL   |   1.1   |
|   NGINX    |  1.17   |
| NGX Brotli |         |
|   Brotli   |   1.0   |

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

## Production 💦

Run setup in production mode.

```bash
$ ./setup.sh
```

Populate `.env` by example `.env.example` in all modules.

Start all modules in production mode.

```bash
$ ./start.sh
```

## Development 🔥

*Note: HTTP headers do not work if the HTTPS certificate is invalid.*\
*Note: Deleting `tmp/update` will force a data update next launch.*\
*Note: Updating in production mode will pull the latest release tag.*\
*Note: Updating in development mode will pull the origin master branch.*

Direct `devaeg.ee` and `api.devaeg.ee` to the local or public IP.

Add the generated `ca.crt` to the trusted certificate authorities list.

Populate `.env` by example `.env.example` in all modules.

Run setup in development mode.

```bash
$ ./setup.sh dev
```

Start all modules in development mode...

```bash
$ ./start.sh dev
```

or start them separately.

```bash
$ cd api && npm run develop
$ cd web && npm start
```
