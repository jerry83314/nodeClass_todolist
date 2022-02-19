const http = require('http');
const { v4: uuidv4 } = require('uuid');
const errorHandle = require('./errorHandle');

const todos = [];

const requestListener = (req, res) => {
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json'
  };

  let body = '';
  req.on('data', (chunk) => {
    body += chunk
  });

  if (req.url == '/todos' && req.method == 'GET') {
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      "status": "success",
      "data": todos
    }));
    res.end();
  } else if (req.url == '/todos' && req.method == 'POST') {
    req.on('end', () => {
      try {
        const title = JSON.parse(body).title;
        if (title !== undefined) {
          const todo = {
            title,
            id: uuidv4()
          };
          todos.push(todo);
          res.writeHead(200, headers);
          res.write(JSON.stringify({
            "status": "success",
            "data": todos
          }));
          res.end();
        } else {
          errorHandle(res, headers, "請填寫 title 屬性");
        }
      } catch (error) {
        errorHandle(res, headers, "格式錯誤");
      }
    });
    
  } else if (req.url == '/todos' && req.method == 'DELETE') {
    todos.length = 0;
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      "status": "success",
      "data": todos
    }));
    res.end();
  } else if (req.url.startsWith('/todos/') && req.method == 'DELETE') {
    const id = req.url.split('/').pop();
    const index = todos.findIndex(el => el.id == id);
    if (index !== -1) {
      todos.splice(index, 1);
      res.writeHead(200, headers);
      res.write(JSON.stringify({
        "status": "success",
        "data": todos
      }));
      res.end();
    } else {
      errorHandle(res, headers, "無此 ID");
    }
  } else if (req.url.startsWith('/todos/') && req.method == 'PATCH') {
      req.on('end', () => {
        try {
          const newTitle = JSON.parse(body).title;
          const id = req.url.split('/').pop();
          const index = todos.findIndex(el => el.id == id);
          if (newTitle !== undefined && index !== -1) {
            todos[index].title = newTitle;
            res.writeHead(200, headers);
            res.write(JSON.stringify({
              "status": "success",
              "data": todos
            }));
            res.end();
          } else {
            errorHandle(res, headers, "無 Title 屬性或無此 ID");
          }
        } catch (error) {
          errorHandle(res, headers, "格式錯誤");
        }
      });
  } else if (req.method == 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write('404 not found');
    res.end();
  }
}

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);