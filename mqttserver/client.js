var mqtt=require("mqtt");
var client=mqtt.connect("mptt://192.168.1.32:1883");

client.on('connect',function(){

    console.log("Connected");

    client.subscribe("new-user",function(err){
        if (!err){
            client.publish("new-user","yilmaz");
        }
    });
});

client.on("messae" ,function(topic,message){
    console.log(topic," : " ,message.toString());
} );
