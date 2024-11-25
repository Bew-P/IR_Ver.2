
const express = require('express');

const path = require('path');

const port = 3000;

const Project_web = express();

const router = express.Router();
Project_web.use(router);



router.use(express.json());
router.use(express.urlencoded({ extended: true }));

function call(Name,file,url){
router.use(express.static(path.join(__dirname, Name)));

router.get(url, (req, res) => {
res.sendFile(path.join(__dirname,Name, file));
console.log(`working: Server aT ${file}`)
});
}

call('Home','plantsearch.html', '/');
call('Home','Search.html','/search');


// listen import 
Project_web.listen(port, () => {
    console.log(`Server listening on port: ${port}`)
})