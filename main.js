/*
`  @Author Amorphe kariukidennisde@gmail.com
    Dependancies[
        $ npm install firebase-admin --save
        $ npm install -g firebase-tools
        $npm i --save replace-in-file
    ]
*/


var admin = require('firebase-admin');
var fs = require('fs');
const replace = require('replace-in-file');


var base_domain = 'getplusx.com'

var serviceAccount = require('./plus-x.json');

var defaultApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://plus-x.firebaseio.com/'
});

console.log("Attempting connection to database");
var db = admin.database();
var ref = db.ref("HostName");

// Attach an asynchronous callback to read the data at our posts reference
ref.on("value", function(snapshot) {
    /*
    we now loop through the hostnames creating sample other hostnames
    */
    var hostnames = snapshot.val();

    if(hostnames!=null){
        for(let key in hostnames){
            var site = hostnames[key];

            //Copy the template to the vhosts folder
            var sub_domain = site['name']+'.'+base_domain;
            fs.copyFile('./templates/_apache_config.txt', './vhosts/'+sub_domain+'.conf', (err) => {
                if (err) throw err;
                console.log('created configuration file for '+sub_domain);
            });

            //now we replace the server names in the generated configuration files tomatch the subdomains so reverse proxy works for them
            const changes = replace.sync({
                files: './vhosts/'+sub_domain+'.conf',
                from: /site.com/g,
                to: sub_domain,
              });
            console.log(changes);

        }
    }else{
        console.log("No hostnames to create");
    }

}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});
