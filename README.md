


Instructions:

1.) CLONE THE REPOSITORY : git clone <Repository_URL>
3.) npm install      
      ;  if any issue with use peer dependency conflicts use to bypass them: npm install --legacy-peer-deps
5.) **RUN COMMAND : pm2 start server.js  

TO RUN using Cluster Module with full utilisation of core:  pm2 start server.js -i max   
; (OR) ; pm2 start server.js -i max

To STOP server : pm2 stop server.js
To Delete pm2 process : pm2 delete server.js

6.) Utilise GraphiQL URL http://localhost:4003/graphql

7.) Utilise sample queries provided in queries.graphql file to utilise the server


