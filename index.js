// 引入所需模块
const express = require('express');
const Web3 = require('web3');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const ethers = require('ethers');
const MyContract = require('./build/contracts/MyContract.json'); // 假设您有一个Truffle编译后的合约

// 初始化环境变量
dotenv.config();

// 设置MongoDB连接
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// 创建Express应用
const app = express();
app.use(cors());
app.use(bodyParser.json());

// 设置HTTP服务器和Socket.io
const server = http.createServer(app);
const io = new Server(server, { /* options */ });

// 初始化Web3
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URL));

// 设置Ethereum合约实例
const contractAddress = process.env.CONTRACT_ADDRESS; // 你的合约地址
const contractABI = MyContract.abi; // 你的合约ABI
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Express路由设置
app.get('/', (req, res) => {
    res.send('Welcome to the Blockchain Server');
});

// Socket.io实时通信设置
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    // 监听来自客户端的消息
    socket.on('client message', (msg) => {
        console.log('message: ' + msg);
        // 可以在这里添加更多功能，如广播消息或处理业务逻辑
    });
});

// 监听合约事件
contract.events.MyEvent({
    fromBlock: 0
}, function(error, event) {
    if (error) console.log(error);
    console.log(event);
    // 处理事件，可以是更新数据库或者通过Socket.io发送实时消息
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
