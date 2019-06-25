![Bussiaeg.ee logo](https://raw.githubusercontent.com/karlkoorna/bussiaeg/master/web/public/assets/logo-single.svg?sanitize=true)

Kogu Eesti ühistranspordi väljumisajad ühest kohast.

## Prerequisites :open_book:

Having the latest stable version of all prerequisites is recommended.

1. **Debian** :penguin:
	
	[Download](https://www.debian.org/distrib/) and install Debian. Ensure additional packages.
	
	```bash
	$ apt install curl git openssl
	```

2. **MySQL** :package:
	
	Install MySQL.
	
	```bash
	$ curl -o mysql.deb https://repo.mysql.com/mysql-apt-config_0.8.13-1_all.deb
	$ dpkg -i mysql.deb
	$ rm mysql.deb
	$ apt update
	$ apt install mysql-server
	$ mysql_secure_installation
	```
	
	Create the database and the user.
	
	```bash
	$ mysql --password=1234
	```
	
	```sql
	CREATE DATABASE bussiaeg;
	CREATE USER 'bussiaeg'@'localhost' IDENTIFIED BY '1234';
	GRANT ALL PRIVILEGES ON bussiaeg.* TO 'bussiaeg'@'localhost';
	```
	
	Configure the server.
	
	```bash
	$ nano /etc/mysql/mysql.cnf
	```
	
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
	
	Restart the daemon.
	
	```bash
	$ systemctl restart mysql
	```

3. **Node.js** :zap:
	
	Install Node.js.
	
	```bash
	$ curl https://deb.nodesource.com/setup_12.x | bash
	$ apt install nodejs
	```

4. **Caddy** :earth_americas:
	
	Install Caddy with plugins.
	
	```bash
	$ curl https://getcaddy.com | bash -s personal http.cors,http.ratelimit,http.expires
	$ setcap cap_net_bind_service=+ep /usr/local/bin/caddy
	```

## Production :sweat_drops:

Update all modules.

```bash
$ ./update.sh
```

Populate `.env` by example in `.env.example` for all modules.

Start all modules in production mode.

```bash
$ ./start.sh
```

## Development :fire:

*Note: HTTP headers do not work if the HTTPS certificate is invalid.*\
*Note: Deleting `tmp/update` will force a data update next launch.*

Direct `devaeg.ee` and `api.devaeg.ee` to the local or public IP.

Add the generated `ca.crt` to the trusted certificate authorities list.

Populate `.env` by example in `.env.example` for all modules.

Start all modules in development mode...

```bash
$ ./start.sh dev
```

or start server and/or client module in development mode.

```bash
$ cd api && npm run develop
$ cd web && npm start
```
