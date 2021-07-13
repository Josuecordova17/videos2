const { Client } = require('whatsapp-web.js');
const client = new Client();
const qrcode = require('qrcode-terminal')
const mysql = require('mysql');
const fetch = require('node-fetch');
const palabras = `_*Palabras disponibles*_:
Fisica - Manda los videos de Fisica disponibles
Biologia - Manda los videos de Biologia disponibles
Quimica - Manda los videos de Quimica disponibles
ayuda - Envia las palabras y los comandos disponibles
videos - Manda la vista de los videos disponibles`
//Base de Datos
const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database:'videos'
  });

  connection.connect((err)=>{
    if (!err) {
        console.log("Conexion existosa")
    }else {
        console.error("Conexion fallida /n Error"+JSON.stringify(err,undefined,2))
    }
});

const executeQuery=async(query)=>{
    return new Promise((resolve,rejects)=>{
        connection.query(query,(error,rows,fields)=>{
            if (!error) {
                resolve({rows})
            } else {
                rejects({message:"error en db",error:error})
            }
        })
    })
}
const inicio = async ()=>{
      let res =await executeQuery("SELECT * FROM `videos`")
      rows = res.rows
}
inicio()


client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    qrcode.generate(qr,{small:true})
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {
    let txt = procesar(msg.body)
    if (txt == 'hola bot') {
        msg.reply(`Bienvenid@`)
        msg.reply('Mandame el nombre del video que deseas o utiliza "videos" para ver que videos hay')
        msg.reply('Si no sabe que palabra o comando hace algo utilice "ayuda bot"')
    }else if (txt=='ayuda bot') {
        msg.reply(palabras)
    } else if(txt=='videos'|| txt=="video") {
        console.log(txt);
        clases(msg)
    }else if (txt=='biologia'||txt=='fisica'||txt=='quimica') {
        nclase(msg,txt)
    }else{
        video(msg,txt)
    }
});
client.initialize();
function procesar(txt) {
        txt= txt.toLowerCase()
        txt= txt.trim()
        txt=tildes(txt)
        const r1='"'
        const r2="'"
        const re1 = new RegExp(r1,'g');
        const re2 = new RegExp(r2,'g');
        txt=txt.replace(re1,'')
        txt=txt.replace(re2,'')
        txt=txt.replace(/`/g,'')
        return txt
}
function tildes(txt) {
    //espacios
    while (txt.indexOf('  ')!=-1) {
        txt=txt.replace(' ','')   
    }
let re;
    do {
        txt = txt.replace('á','a')
        txt = txt.replace('é','e')
        txt = txt.replace('í','i')
        txt = txt.replace('ó','o')
        txt = txt.replace('ú','u')
         re = txt
    } while (re.indexOf('á')!=-1 || re.indexOf('é')!=-1|| re.indexOf('í')!=-1|| re.indexOf('ó')!=-1|| re.indexOf('ú')!=-1);
return re    
}
function clases(msg) {
    connection.query("SELECT `video` FROM `videos`",(err,rows,fields)=>{
            var re = ''
            for (let i = 0; i < rows.length; i++) {
                let n =rows[i].video,
                nombre=cap(n)
                if (nombre.indexOf('2021')!=-1) {
                    re =re +`
`+`*${nombre}*`
                } else {
                    re =re +`
`+nombre
                }
            }
            msg.reply(re)
})
}
function cap(n) {
    let nombre = n.charAt(0).toUpperCase() + n.slice(1);
    num = nombre.indexOf(' ')
    nombre =nombre.slice(0,num+1) + nombre.charAt(num+1).toUpperCase() + nombre.slice(num+2);
return nombre
}
function nclase(msg,txt) {
    const body = { txt: txt };
 
fetch('http://192.168.0.8/nclases', {
        method: 'put',
        body:    JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    })
    .then(res => res.json())
    .then(json => msg.reply(json.re))
}
function video(msg,txt) {
    let res = txt.split(" ", 1);
     res=res[0]
     if (res=='fisica'||res=='biologia'||res=='quimica') {
        let sql ="SELECT * FROM `videos` WHERE `video`='"+ txt + "'"
        connection.query(sql,(err,rows,fields)=>{
            if (!err) {
                if (rows=="") {
                    console.log(err);
                    msg.reply(`Oh no el video solicitado no existe :
Comprueba la ortografia
${palabras}
Tambien puedes revisar la ortografia`,{parse_mode:'HTML'})
                } else {
                 msg.reply(`El link es : ${rows[0].linkVideo}`)   
                }  
                }else{
                    console.log(err);
           }
            })     
     }
      
}