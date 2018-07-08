# Bussiaeg
Ühistranspordi ajad üle kogu Eesti.

### Prerequisites

Latest stable versions of all prerequisites are recommended.

1) **Debian**
	
	[Download](https://www.debian.org/distrib/) and install the operating system with SSH and without a desktop environment.
	
	Install additional required tools.
	
	```
	$ apt install curl git
	```
	
2) **MySQL**
	
	Install and configure MySQL.
	
	```
	$ curl -o mysql https://repo.mysql.com/mysql-apt-config_0.8.10-1_all.deb
	$ dpkg -i mysql
	$ rm mysql
	$ apt update
	$ apt install mysql-server
	$ mysql_secure_installation
	```
	
	Create the database and the user.
	
	```
	$ mysql --password=password
	```
	
	```sql
	CREATE DATABASE bussiaeg;
	CREATE USER 'bussiaeg'@'%' IDENTIFIED BY 'password';
	GRANT ALL PRIVILEGES ON bussiaeg.* TO 'bussiaeg'@'%';
	```
	
	Configure the database engine.
	
	```
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
	
	```
	$ systemctl restart mysql
	```
	
3) **Node.js**
	
	Install Node.js.
	
	```
	$ curl https://deb.nodesource.com/setup_8.x | bash
	$ apt install nodejs
	```
	
4) **Caddy**
	
	Install Caddy.
	
	```
	$ curl https://getcaddy.com | bash -s personal
	$ ulimit -n 8192
	```
	
### Installation


