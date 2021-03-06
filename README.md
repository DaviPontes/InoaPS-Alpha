# InoaPS-Alpha
InoaPS-Alpha is a python project for visualize stock prices and send email alerts on target prices.
## Installation
Create a new virtual environment
```bash
python3 -m venv env
```
Activate virtual environment
**Linux**
```bash
source env/bin/activate
```
**Windows**
```bash
.\env\Scripts\activate
```
Install dependencies
```bash
pip install -r requeriments.txt
```
## Configuration
**Credentials**
This project need some credentials, the "secrets-mock.json" is an example of the file structure.
Copy "secrets-mock.json" to /src folder and rename it to "secrets.json" and insert correct credencials.

**DB**
To correct use built-in Django SQLite run the following command with python venv activated and inside /src folder
```bash
python manage.py migrate
```
## Usage
This project is based in two modules: Web Service and Back Service.

**Web Service**

> This module will enable the web interface and interactions with the DB.

The Web Service can be runned with the following command. The command should be runned with on /src folder with venv enbaled.
```bash
python manage.py runserver
``` 
**PS**: In Windows powershell a  know issue occours, to solve this run the command with the flag "--noreload"


**Back Service**

> This module gets data from an external API and updates the DB.

- **Cron Job (Linux)**
In Linux the Back Service can be runned with cron tasks. Run the following command to setup the task. This command should be runned on /src folder with venv enabled.
```bash
python manage.py installtasks
```
- **Continuous Script**
This method can be executed in loop or just one time. To run the script execute the following command. This command should be runned on /src folder with venv enabled.
```bash
#One time execution.
python manage.py b3

#Loop execution. Pass time in minutes.
python manage.py b3 --loop ${time}
```
