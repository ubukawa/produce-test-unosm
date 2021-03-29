## note
This is for osm data and un data togeter (test) 

#  


## install and preparation  
```console
git clone https://github.com/ubukawa/produce-test-unosm
cd produce-test-unosm
npm install
vi config/default.hjson
```


## run (priority tiles -update everyday)
```console
node index_everyday.js
```  

## run (other tiles)
```console
node index_XXXday.js
```  


## Update as scheduled task  
It woudl be a good idea to use crontab.  
You may need to use ssh-key if you want to upload the tile to an independent hosting server.  
```console
crontab -e  

(edit the crontab as you like)  
mm hh * * * cd /home/xxxx/produce-test-unosm; ./work_every.sh
``` 
