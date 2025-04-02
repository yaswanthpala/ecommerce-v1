
PRE-REQUISITES: 

1.) SETUP MONGO DB and GraphQL

2.) Import the provided datasets. (Collections: Orders,Products,Customers) and regading Data.


NOTE: MongoDb running at port : 27017 ; can be altered if you're using a different port.
Import for Customers and Products using commands: 

mongoimport --uri="mongodb://localhost:27017" --db=ecommerce --collection=Customers --type=csv --headerline --file=customers.csv

mongoimport --uri="mongodb://localhost:27017" --db=ecommerce --collection=Products --type=csv --headerline --file=products.csv

Import manually for **Orders** through insertMany in Mongosh shell  based on provided Data or can also be done by small script.

Instructions to RUN Server:

1.) CLONE THE REPOSITORY : git clone https://github.com/yaswanthpala/ecommerce-v1.git


2.) RUN : npm install      
      ;  if any issue with use peer dependency conflicts use to bypass them: npm install --legacy-peer-deps

3.) RUN: npm install pm2@latest -g

4.) **RUN COMMAND : pm2 start server.js  

TO RUN using Cluster Module with full utilisation of core:  pm2 start server.js -i max   
; (OR) ; pm2 start server.js -i max

To STOP server : pm2 stop server.js
To Delete pm2 process : pm2 delete server.js

5.) Utilise GraphiQL URL http://localhost:4003/graphql   ;Server running at Port 4003

6.) Utilise sample queries provided in queries.graphql file to utilise the server


