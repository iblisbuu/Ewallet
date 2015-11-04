var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io');

app.use('/', express.static('public'));

io = io.listen(app.listen(8000));


var clients = [];

var coupons = [
	{id : 1},
	{id : 2},
	{id : 3},
	{id : 4},
	{id : 5},
	{id : 6},
	{id : 7},
	{id : 8},
	{id : 9},
	{id : 10}
];

function findClientOnID(id){
	var i = 0;
	while (i < clients.length){
				if (clients[i].ID == id){
					return clients[i];
				}
	}
	throw 'Id is not found in the list of clients';
}

function findCouponOnID(id){
	var i = 0;
	while (i < id.length){
				if (coupons[i].id == id){
					return coupons[i];
				}
	}
	throw 'Id is not found in the list of coupons'; 
}

io.on('connection', function(socket){
	console.log('connection');
	socket.on('addClient', function(client){
  		console.log('msg arrives at server');
  		if (client.lastName && client.firstName){
  			client["ID"] = clients.length + 1;
  			clients.push(client);
  			console.log('added new client');
  			console.log(clients);
  			socket.emit('result' , 'done');
  		}
    	else{
    		socket.emit('result', 'failed');
    	}
  });
	socket.on('addCouponToClient', function(data){
		console.log('msg arrives at server for coupon');
		if(data.clientID && data.couponID){
			client = findClientOnID(data.clientID);
			client.listOfCoupons.push(findCouponOnID(data.couponID));
			console.log('added coupon to the list')
			console.log(client);
			socket.emit('result' , 'done');
  		}
    	else{
    		socket.emit('result', 'failed');
    	}
	});
});
