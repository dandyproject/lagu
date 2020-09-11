
const fs = require("fs"); 
const moment = require("moment");
const qrcode = require("qrcode-terminal"); 
const { Client, MessageMedia } = require("whatsapp-web.js"); 
const mqtt = require("mqtt"); 
const listen = mqtt.connect("mqtt://test.mosquitto.org"); 
const fetch = require("node-fetch"); 
const puppeteer = require("puppeteer"); 
const cheerio = require("cheerio");
const SESSION_FILE_PATH = "./session.json";
// file is included here
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionCfg = require(SESSION_FILE_PATH);
}
client = new Client({	  
    
	     puppeteer: {
        executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
        headless: true,
		args: [
      "--log-level=3", // fatal only
   
      "--no-default-browser-check",
      "--disable-infobars",
      "--disable-web-security",
      "--disable-site-isolation-trials",
      "--no-experiments",
      "--ignore-gpu-blacklist",
      "--ignore-certificate-errors",
      "--ignore-certificate-errors-spki-list",
    
      "--disable-extensions",
      "--disable-default-apps",
      "--enable-features=NetworkService",
      "--disable-setuid-sandbox",
      "--no-sandbox",
    
      "--no-first-run",
      "--no-zygote"
    ]
		
    },	      
    session: sessionCfg
});
// You can use an existing session and avoid scanning a QR code by adding a "session" object to the client options.

client.initialize();

// ======================= Begin initialize WAbot

client.on("qr", qr => {
  // NOTE: This event will not be fired if a session is specified.
  qrcode.generate(qr, {
    small: true
  });
  console.log(`[ ${moment().format("HH:mm:ss")} ] Please Scan QR with app!`);
});

client.on("authenticated", session => {
  console.log(`[ ${moment().format("HH:mm:ss")} ] Authenticated Success!`);
  // console.log(session);
  sessionCfg = session;
  fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function(err) {
    if (err) {
      console.error(err);
    }
  });
});

client.on("auth_failure", msg => {
  // Fired if session restore was unsuccessfull
  console.log(
    `[ ${moment().format("HH:mm:ss")} ] AUTHENTICATION FAILURE \n ${msg}`
  );
  fs.unlink("./session.json", function(err) {
    if (err) return console.log(err);
    console.log(
      `[ ${moment().format("HH:mm:ss")} ] Session Deleted, Please Restart!`
    );
    process.exit(1);
  });
});

client.on("ready", () => {
  console.log(`[ ${moment().format("HH:mm:ss")} ] Whatsapp bot ready!`);
});

// ======================= Begin initialize mqtt broker

listen.on("connect", () => {
  listen.subscribe("corona", function(err) {
    if (!err) {
      console.log(`[ ${moment().format("HH:mm:ss")} ] Mqtt topic subscribed!`);
    }
  });
});

// ======================= WaBot Listen on Event

client.on("message_create", msg => {
  // Fired on all message creations, including your own
  if (msg.fromMe) {
    // do stuff here
  }
});

client.on("message_revoke_everyone", async (after, before) => {
  // Fired whenever a message is deleted by anyone (including you)
  // console.log(after); // message after it was deleted.
  if (before) {
    console.log(before.body); // message before it was deleted.
  }
});

client.on("message_revoke_me", async msg => {
  // Fired whenever a message is only deleted in your own view.
  // console.log(msg.body); // message before it was deleted.
});

client.on("message_ack", (msg, ack) => {
  /*
        == ACK VALUES ==
        ACK_ERROR: -1
        ACK_PENDING: 0
        ACK_SERVER: 1
        ACK_DEVICE: 2
        ACK_READ: 3
        ACK_PLAYED: 4
    */

  if (ack == 3) {
    // The message was read
  }
});


client.on("group_update", notification => {
  // Group picture, subject or description has been updated.
  console.log("update", notification);
});

client.on("disconnected", reason => {
  console.log("Client was logged out", reason);
});

// ======================= WaBot Listen on message

client.on("message", async msg => {
	// console.log('MESSAGE RECEIVED', msg);
    const chat = await msg.getChat();
    const users = await msg.getContact()
    const dariGC = msg['author']
    const dariPC = msg['from']
	console.log(` ${chat} 
	participant
	`)
const botTol = () => {
        msg.reply('[!] Maaf, Fitur ini hanya untuk Admin (Owner).')
        return
    }
    const botTol2 = () => {
        msg.reply(`[!] Maaf, fitur ini hanya untuk 'Group Chat'.`)
        return
      }
      if (msg.body.startsWith("ytmp3 ")) {
        var url = msg.body.split("ytmp3 ")[1];
        var videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);

        const ytdl = require("ytdl-core")
        const { exec } = require("child_process");
        if(videoid != null) {
             console.log("video id = ",videoid[1]);
           } else {
                msg.reply("_Format yang digunakan salah._");
              }
              ytdl.getInfo(videoid[1]).then(info => {
                if (info.length_seconds > 18000){
                  msg.reply("terlalu panjang.. ")
                }else{

                  console.log(info.length_seconds)

                  msg.reply("_Permintaan sedang diproses_");
                  var YoutubeMp3Downloader = require("youtube-mp3-downloader");

                  //Configure YoutubeMp3Downloader with your settings
                  var YD = new YoutubeMp3Downloader({
                        "ffmpegPath": "ffmpeg", 
                            "outputPath": "./mp3",    // Where should the downloaded and en>
                                "youtubeVideoQuality": "highest",       // What video quality sho>
                                    "queueParallelism": 100,                  // How many parallel down>
                                        "progressTimeout": 40                 // How long should be the>
                                      });

                  YD.download(videoid[1]);


                  YD.on("finished", function(err, data) {


                    var musik = MessageMedia.fromFilePath(data.file);

                    msg.reply(` *+=[ Convert YT To MP3 ]=+*

Nama File : *${data.videoTitle}*
Nama : *${data.title}*
Artis : *${data.artist}*

*DP-WhatsApp © 2020* `);
                    msg.reply(musik);
                  });
                  YD.on("error", function(error) {
                        console.log(error);
                      });

                }});
            }
 if (msg.body.startsWith("lagu")) {
  msg.reply("_Sedang Mendownload Lagu..._ *Jangan Req Lagi!,Tunggu Sampai Selesai*")
let axios = require('axios').default;

async function searchYoutube(keyword) {
    let request = await axios.get("https://www.youtube.com/result", {
        params: {
            "search_query": keyword,
            "disable_polymer": 1
        }
    });
    let body = request.data;
    if (body.substring(0,92) == '<!doctype html><html  style="font-size: 10px;font-family: Roboto, Arial, sans-serif;" lang="') {
        let page = String(body);
        let pageSource = page.split(",");
        let id = [];
        let idIndex = 0;
        for (let index in pageSource) {
            if (pageSource[index].substring(0, 10) == '"videoId":' && pageSource[index].length == 23) {
                idIndex ++;
                if (idIndex % 2) {
                    id.push(pageSource[index].substring(11, pageSource[index].length - 1));
                };
            };
        };
        return id;
    }
    else {
        let page = String(body);
        let pageSource = page.split(" ");
        let id = [];
        let idIndex = 0;
        for (let index = 0; index<pageSource.length; index+=1) {
            element = pageSource[index];
            if (element.substring(0,15) == 'href="/watch?v='  && element.length == 27) {
                idIndex++;
                if (idIndex % 2) {
                    id.push(element.substring(15, element.length -1));
                };
            };
        };
        return id;
    };
};
var hh = msg.body.split("lagu ")[1];
var keyword = hh.replace(/ /g, "+");
//////////Calling Async Function//////////
(async () => {

    index = 0

    result = await searchYoutube(keyword);
    console.log(result[index])
    var YoutubeMp3Downloader = require("youtube-mp3-downloader");
console.log(result[index]);
//Configure YoutubeMp3Downloader with your settings
var YD = new YoutubeMp3Downloader({
    "ffmpegPath": "ffmpeg", 
    "outputPath": "./mp3",    // Where should the downloaded and en>
    "youtubeVideoQuality": "highest",       // What video quality sho>
    "queueParallelism": 100,                  // How many parallel down>
    "progressTimeout": 2000                 // How long should be the>
});

//Download video and save as MP3 file
YD.download(result[index]);

YD.on("finished", function(err, data) {


const musik = MessageMedia.fromFilePath(data.file);
msg.reply(` *[+]Berhasil Download[+]*
  
Judul: *${data.videoTitle}* 

*INFO* : _Req lagu sewajarnya jangan req lagu jorok,kasar,full album yang lebih dari 25-1jam (Auto Banned)_`);
msg.reply(musik);
});
YD.on("progress", function(data) {
});
})();
}

});

