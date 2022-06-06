# coding:utf-8

import socket
import sys
import filetype
import json

from multiprocessing import Process


class HTTPServer(object):
    def __init__(self):
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.libs=__import__("libs").Libs()

    def start(self):
        self.server_socket.listen(8)
        while True:
            client_socket, client_address = self.server_socket.accept()
            # print("[%s:%s]已连接到服务器" % client_address)
            handle_client_process = Process(target=self.handle_client, args=(client_socket,))
            handle_client_process.start()
            client_socket.close()

    def start_response(self, status, headers):
        response_headers = "HTTP/1.1 " + status + "\r\n"
        for header in headers:
            response_headers += "%s: %s\r\n" % header

        self.response_headers = response_headers

    def __filetypeList(self,str):
        dict={"svg": "image/svg+xml", "js": "application/javascript"}
        return dict.get(str,"text/%s"%str)

    def handle_client(self, client_socket):
        """
        处理客户端请求
        """
        # 获取客户端请求数据
        request_data = client_socket.recv(1024).splitlines()

        # 解析请求报文
        # 提取用户请求的文件名及请求方法
        if len(request_data) == 0:
            client_socket.close()
            return
        (method,url,version) = request_data[0].decode("utf-8").split()
        del version

        if method == 'GET':
            #初始页面index
            if "/" == url:
                url = "./index.html"
            else:
                url = '.' + url
            # 打开文件，读取内容
            try:
                fo = open(url, "rb")
            except IOError:
                response_start_line = "HTTP/1.1 404 Not Found\r\n"
                response_headers = "Server: EzIsingModel\r\n"
                response_body = "<h1>404 </h1><h2>Not Found</h2><h3>The file \"%s\" is not exist!</h3>"%url
            else:
                file_data = fo.read()
                fo.close()
                file_type = filetype.guess(url)
                if file_type == None:
                    file_type=self.__filetypeList(url.split(".")[-1])
                else:
                    file_type=file_type.mime


                # 构造响应数据
                response_start_line = "HTTP/1.1 200 OK\r\n"
                response_headers = "Server: EzIsingModel\r\n"
                response_headers += "Content-Type: %s\r\n"%file_type
                response_body = file_data


        elif method == 'POST':
            response_body = b""
            if('execute' in url):
                i=request_data.index(b'')+1
                while i<len(request_data):
                    try:
                        funs=json.loads(request_data[i].decode("utf-8"))
                    except:
                        response_body+=b"JSON can't be parsed:" + request_data[i] + b"\r\n"
                        i+=1
                        continue
                    '''
                    response_body += bytes(getattr(self.libs,funs["method"])(funs["arguments"]),"utf-8") + b"\r\n"
                    '''
                    try:
                        response_body += bytes(getattr(self.libs,funs["method"])(funs["arguments"]),"utf-8") + b"\r\n"
                    except Exception as e:
                        response_body+=bytes("%s: Can't execute %s\r\n" % (repr(e),funs["method"]),"utf-8")
                        print(repr(e))
                    
                    i+=1
                del i
                response_start_line = "HTTP/1.1 200 OK\r\n"
                response_headers = "Server: EzIsingModel\r\n"
                response_headers += "Content-Type: text/json; charset=utf-8\r\n"
            else:
                response_start_line = "HTTP/1.1 400 Bad Request\r\n"
                response_headers = "Server: EzIsingModel\r\n"
        else:
            print('UNKNOWN method:%s'%method)
            response_start_line = "HTTP/1.1 405 Method Not Allowed\r\n"
            response_headers = "Server: EzIsingModel\r\n"
            response_body = "Method %s is Not Allowed"%method
        
        if type(response_body) == type(""):
            response_body=bytes(response_body,"utf-8")
        # 向客户端返回响应数据
        client_socket.send(bytes(response_start_line + response_headers + "\r\n", "utf-8") + response_body)

        # 关闭客户端连接
        client_socket.close()
        

    def bind(self, port):
        self.server_socket.bind(("", port))


def main():
    sys.path.insert(1, "py/")
    http_server = HTTPServer()
    http_server.bind(8848)
    http_server.start()


if __name__ == "__main__":
    main()