![Bussiaeg.ee logo](https://raw.githubusercontent.com/karlkoorna/bussiaeg/master/web/public/assets/banner-1.svg?sanitize=true)

Kogu Eesti ühistranspordi väljumisajad ühest kohast.

## Prerequisites

Latest stable versions of all prerequisites are recommended.

1) **Debian**
	
	[Download](https://www.debian.org/distrib/) and install Debian.
	
	Install additional required tools.
	
	```bash
	$ apt install curl git
	```
	
2) **MySQL**
	
	Install and configure MySQL.
	
	```bash
	$ curl -o mysql.deb https://repo.mysql.com/mysql-apt-config_0.8.10-1_all.deb
	$ dpkg -i mysql.deb
	$ rm mysql.deb
	$ apt update
	$ apt install mysql-server
	$ mysql_secure_installation
	```
	
	Create the database and the user.
	
	```bash
	$ mysql --password=password
	```
	
	```sql
	CREATE DATABASE bussiaeg;
	CREATE USER 'bussiaeg'@'%' IDENTIFIED BY 'password';
	GRANT ALL PRIVILEGES ON bussiaeg.* TO 'bussiaeg'@'%';
	```
	
	Configure the database engine.
	
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
	
	Restart the server.
	
	```bash
	$ systemctl restart mysql
	```
	
3) **Node.js**
	
	Install Node.js.
	
	```bash
	$ curl https://deb.nodesource.com/setup_10.x | bash
	$ apt install nodejs
	```
	
4) **Caddy**
	
	Install Caddy with plugins.
	
	```bash
	$ curl https://getcaddy.com | bash -s personal http.cors,http.ratelimit,http.expires
	$ setcap cap_net_bind_service=+ep /usr/local/bin/caddy
	```
	
## Production

Update modules.

```bash
$ ./update.sh
```

Fill in `.env` file by example `.env.example` file for all modules.

Start modules.

```bash
$ ./start.sh
```

## Development

Redirect `devaeg.ee` and `api.devaeg.ee` to the local or public IP.

Fill in `.env` file by example `.env.example` file for all modules.\
*Note: HTTP headers do not work properly if the HTTPS certificate is invalid.*\
*Note: Deleting `tmp/update` will force a data update next launch.*

Start modules in development mode.

```bash
$ npm start dev
```
