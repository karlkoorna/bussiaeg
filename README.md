![Bussiaeg.ee logo](https://raw.githubusercontent.com/karlkoorna/bussiaeg/master/web/public/assets/banner-1.svg?sanitize=true)

Ühistranspordi ajad üle kogu Eesti.

## Prerequisites

Latest stable versions of all prerequisites are recommended.

1) **Debian**
	
	[Download](https://www.debian.org/distrib/) and install Debian with SSH and without a desktop environment.
	
	Install additional required tools.
	
	```bash
	$ apt install curl git
	```
	
2) **MySQL**
	
	Install and configure MySQL.
	
	```bash
	$ curl -o mysql https://repo.mysql.com/mysql-apt-config_0.8.10-1_all.deb
	$ dpkg -i mysql
	$ rm mysql
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
	$ curl https://deb.nodesource.com/setup_8.x | bash
	$ apt install nodejs
	```
	
4) **Caddy**
	
	Install Caddy with CORS plugin.
	
	```bash
	$ curl https://getcaddy.com | bash -s personal http.cors
	$ ulimit -n 8192
	```
	
## Installation and updates

Update all modules.

```bash
$ ./update.sh
```

Fill in `.env` module configuration file by example `.env.example` file. Provided values are for development only.

Start all modules.

```bash
$ ./start.sh
```

## Development

Redirect `devaeg.ee` and `api.devaeg.ee` to the machine's local or public ip.

Fill in `.env` module configuration file by example `.env.example` file. Provided values are for development only.

Run Caddy with development config file.

```bash
$ caddy -conf Caddydev
```

Start API module.

```bash
$ cd api
$ npm start
```

Start Web module in development mode. Setting `NODE_ENV=development` will disable data updating.

```bash
$ cd web
$ npm start
```
